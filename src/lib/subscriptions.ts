import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, isNull, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import {
  CONFIRM_LINK_HOURS,
  sendAlreadySubscribedEmail,
  sendConfirmEmail,
} from "@/lib/email";
import { siteUrl } from "@/lib/env";
import { plans } from "@/lib/plans";
import { hit, limits } from "@/lib/rate-limit";
import type { SignupTier } from "@/lib/signup";

const { users, subscriptionConfirmations } = schema;

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Free odběr (zadání 5.4, kroky 1 a 2). Volající dostane vždy stejný
 * výsledek, ať adresa existovala, nebo ne. Formulář tak neprozradí,
 * kdo u nás odběr má.
 *
 * - nová adresa: řádek v users se souhlasem, potvrzovací e-mail
 * - nepotvrzená nebo odhlášená: nový souhlas, nový odkaz, staré odkazy neplatí
 * - potvrzená: e-mail "odběr už máte", souhlas zůstává původní
 *
 * Na jednu adresu odejdou nejvýš tři e-maily za hodinu, další se tiše
 * zahodí. Jinak by formulář šel použít k zaplavení cizí schránky.
 */
export async function subscribe(input: {
  email: string;
  tier: SignupTier;
  consentVersion: string;
  ip: string | null;
}): Promise<void> {
  const email = input.email.trim().toLowerCase();
  const requestedTier = input.tier === "free" ? null : input.tier;
  const consent = {
    consentAt: new Date(),
    consentIp: input.ip,
    consentTextVersion: input.consentVersion,
  };

  const inserted = await db()
    .insert(users)
    .values({ email, ...consent, requestedTier })
    .onConflictDoNothing({ target: users.email })
    .returning({ id: users.id });

  let userId = inserted[0]?.id;
  let active = false;

  if (!userId) {
    const [existing] = await db()
      .select({
        id: users.id,
        confirmedAt: users.emailConfirmedAt,
        unsubscribedAt: users.unsubscribedAt,
      })
      .from(users)
      .where(eq(users.email, email));
    userId = existing.id;
    active = Boolean(existing.confirmedAt && !existing.unsubscribedAt);

    await db()
      .update(users)
      .set({
        // Potvrzený odběr má platný souhlas, ten se nepřepisuje.
        ...(active ? {} : consent),
        ...(requestedTier ? { requestedTier } : {}),
      })
      .where(eq(users.id, userId));
  }

  const allowed = await hit(limits.emailPerAddress, email);
  if (!allowed.ok) return;

  const tierName = requestedTier ? plans[requestedTier].name : undefined;

  if (active) {
    await sendAlreadySubscribedEmail(email, tierName);
    return;
  }

  const token = randomBytes(32).toString("base64url");
  // Platí jen nejnovější odkaz. Starší nepoužité se ruší.
  await db()
    .delete(subscriptionConfirmations)
    .where(
      and(
        eq(subscriptionConfirmations.userId, userId),
        isNull(subscriptionConfirmations.usedAt),
      ),
    );
  await db()
    .insert(subscriptionConfirmations)
    .values({
      tokenHash: hashToken(token),
      userId,
      expiresAt: new Date(Date.now() + CONFIRM_LINK_HOURS * 60 * 60 * 1000),
    });

  const url = new URL("/potvrzeni", siteUrl());
  url.searchParams.set("token", token);
  await sendConfirmEmail(email, url.toString(), tierName);
}

/**
 * Potvrzení odběru (krok 3). Token se spotřebuje a uživatel potvrdí
 * v jednom příkazu, takže nemůže zůstat použitý token bez potvrzení.
 */
export async function confirmSubscription(token: string): Promise<boolean> {
  const result = await db().execute<{ id: string }>(sql`
    with used as (
      update subscription_confirmations
      set used_at = now()
      where token_hash = ${hashToken(token)}
        and used_at is null
        and expires_at > now()
      returning user_id
    )
    update users
    set email_confirmed_at = coalesce(users.email_confirmed_at, now()),
        email_verified = true,
        unsubscribed_at = null,
        updated_at = now()
    from used
    where users.id = used.user_id
    returning users.id
  `);
  return result.rows.length > 0;
}

/**
 * Potvrzení z účtu. Přihlášení odkazem už vlastnictví adresy prokázalo
 * a souhlas je uložený z formuláře. Kdo se odhlásil, musí se znovu
 * přihlásit k odběru formulářem, protože jeho souhlas už neplatí.
 */
export async function confirmSubscriptionForUser(userId: string): Promise<void> {
  await db()
    .update(users)
    .set({
      emailConfirmedAt: sql`coalesce(${users.emailConfirmedAt}, now())`,
      emailVerified: true,
    })
    .where(and(eq(users.id, userId), isNull(users.unsubscribedAt)));
}
