import "server-only";
import { and, eq, isNull, sql } from "drizzle-orm";
import type Stripe from "stripe";
import { db, schema, withTransaction, type Tx } from "@/db";
import { env, siteUrl } from "@/lib/env";
import { isTier, type Tier } from "@/lib/plans";
import {
  CHECKOUT_INTEGRATION_ID,
  priceForTier,
  stripe,
  tierForPrice,
  WAIVER_TEXT_VERSION,
  type PaidTier,
} from "@/lib/stripe";

const { users, planLimits } = schema;

/**
 * Předplatné (zadání 5.5). Zdrojem pravdy o tarifu je Stripe, databáze drží
 * jeho odraz. Každá událost webhooku proto stav nedopočítává z těla zprávy,
 * ale načte předplatné ze Stripe a přepíše podle něj řádek uživatele. Události
 * mohou přijít v jiném pořadí, než nastaly, a takhle na tom nezáleží.
 */

/** Po neúspěšné platbě se placené reporty posílají ještě tolik dní. */
export const PAST_DUE_GRACE_DAYS = 7;

export type BillingState = {
  status: string;
  pastDueSince: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
};

/** Do kdy ještě posílat, když platba neprošla. Null znamená bez omezení. */
export function graceEndsAt(pastDueSince: Date | null): Date | null {
  if (!pastDueSince) return null;
  return new Date(pastDueSince.getTime() + PAST_DUE_GRACE_DAYS * 24 * 60 * 60 * 1000);
}

/**
 * Má uživatel právo na placený obsah? Rozhodnutí z 2026-09-29: po neúspěšné
 * platbě ještě 7 dní, pak ne, dokud Stripe platbu nevybere.
 */
export function hasPaidAccess(state: BillingState, now: Date = new Date()): boolean {
  if (state.status === "active") return true;
  if (state.status !== "past_due") return false;
  const ends = graceEndsAt(state.pastDueSince);
  return ends ? now < ends : true;
}

/**
 * Zákazník ve Stripe. Vzniká až při první platbě, ne při odběru, aby ve
 * Stripe neleželi lidé, kteří nikdy neplatili. Zámek řádku brání dvěma
 * souběžným kliknutím vyrobit dva zákazníky, idempotentní klíč tomu samému
 * po spadnutí spojení.
 */
async function ensureCustomer(userId: string): Promise<string> {
  return withTransaction(async (tx) => {
    const [user] = await tx
      .select({ email: users.email, customerId: users.stripeCustomerId })
      .from(users)
      .where(eq(users.id, userId))
      .for("update");
    if (!user) throw new Error("Uživatel neexistuje.");
    if (user.customerId) return user.customerId;

    const customer = await stripe().customers.create(
      { email: user.email, metadata: { userId } },
      { idempotencyKey: `customer:${userId}` },
    );
    await tx.update(users).set({ stripeCustomerId: customer.id }).where(eq(users.id, userId));
    return customer.id;
  });
}

/**
 * Checkout v režimu subscription. Souhlas s okamžitým poskytnutím digitálního
 * obsahu se ukládá tady, ještě před platbou: bez něj by se lhůta na odstoupení
 * neztratila a uživatel by první report dostal až po čtrnácti dnech.
 *
 * payment_method_types se nikdy neposílá, platební metody řídí Dashboard.
 */
export async function createCheckout(userId: string, tier: PaidTier): Promise<string> {
  const price = priceForTier(tier);
  const customer = await ensureCustomer(userId);

  await db()
    .update(users)
    .set({ digitalContentWaiverAt: new Date(), digitalContentWaiverVersion: WAIVER_TEXT_VERSION })
    .where(eq(users.id, userId));

  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer,
    line_items: [{ price, quantity: 1 }],
    client_reference_id: userId,
    subscription_data: { metadata: { userId } },
    // Stav se po návratu čte z databáze, parametr jen řekne stránce, že se
    // člověk vrací z platby a webhook možná ještě nedorazil.
    success_url: `${siteUrl()}/ucet?platba=hotovo`,
    cancel_url: `${siteUrl()}/ucet`,
    locale: "cs",
    // Adresa je potřeba k dokladu a k určení státu pro DPH.
    billing_address_collection: "required",
    customer_update: { address: "auto", name: "auto" },
    integration_identifier: CHECKOUT_INTEGRATION_ID,
  });
  if (!session.url) throw new Error("Checkout nevrátil adresu.");
  return session.url;
}

/**
 * Customer Portal: změna tarifu, platební metoda, zrušení, doklady. Kdo ještě
 * nikdy neplatil, nemá zákazníka a portál nemá co ukázat.
 */
export async function createPortal(userId: string): Promise<string | null> {
  const [user] = await db()
    .select({ customerId: users.stripeCustomerId })
    .from(users)
    .where(eq(users.id, userId));
  if (!user?.customerId) return null;

  const { STRIPE_PORTAL_CONFIGURATION } = env();
  const session = await stripe().billingPortal.sessions.create({
    customer: user.customerId,
    return_url: `${siteUrl()}/ucet`,
    locale: "cs",
    ...(STRIPE_PORTAL_CONFIGURATION ? { configuration: STRIPE_PORTAL_CONFIGURATION } : {}),
  });
  return session.url;
}

/**
 * Stavy Stripe se sbalují do tří, se kterými pracuje web. `trialing` je
 * placený přístup, `incomplete` ještě žádný (první platba neprošla).
 */
function mapStatus(status: Stripe.Subscription.Status): "active" | "past_due" | "canceled" {
  if (status === "active" || status === "trialing") return "active";
  if (status === "past_due" || status === "unpaid") return "past_due";
  return "canceled";
}

/**
 * Přebytek po snížení tarifu. Položky nad limit se vypnou, nemažou: po
 * návratu k vyššímu tarifu si je uživatel zapne zpátky. Zůstávají ty nejdřív
 * přidané, protože o pořadí nic lepšího nevíme.
 */
async function applyTierLimit(tx: Tx, userId: string, tier: Tier): Promise<void> {
  const [limit] = await tx
    .select({ max: planLimits.maxWatchlist })
    .from(planLimits)
    .where(eq(planLimits.tier, tier));
  const max = limit?.max ?? 0;

  await tx.execute(sql`
    update watchlist set active = false
    where user_id = ${userId}
      and active
      and ticker not in (
        select ticker from watchlist
        where user_id = ${userId} and active
        order by added_at, ticker
        limit ${max}
      )
  `);
}

/**
 * Přepíše tarif a stav podle předplatného ve Stripe. Neznámé ID ceny tarif
 * nemění: to znamená, že někdo ve Stripe založil cenu, kterou web nezná, a
 * tipovat tarif by znamenalo dát nebo vzít obsah naslepo.
 */
export type SyncResult = { userId: string; tier: Tier; status: "active" | "past_due" | "canceled" };

export async function syncSubscription(subscriptionId: string): Promise<SyncResult | null> {
  const subscription = await stripe().subscriptions.retrieve(subscriptionId);
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const item = subscription.items.data[0];
  const priceTier = item ? tierForPrice(item.price.id) : null;
  const status = mapStatus(subscription.status);
  const periodEnd = item ? new Date(item.current_period_end * 1000) : null;

  if (!priceTier && status !== "canceled") {
    console.error("[stripe] neznámé ID ceny u předplatného", subscriptionId);
  }

  return withTransaction(async (tx): Promise<SyncResult | null> => {
    const metaUserId = subscription.metadata?.userId;
    let [user] = await tx
      .select({ id: users.id, tier: users.tier, pastDueSince: users.pastDueSince })
      .from(users)
      .where(eq(users.stripeCustomerId, customerId))
      .for("update");

    if (!user && metaUserId) {
      // Zákazník se k uživateli nenavázal (třeba pád mezi Stripe a databází).
      [user] = await tx
        .select({ id: users.id, tier: users.tier, pastDueSince: users.pastDueSince })
        .from(users)
        .where(eq(users.id, metaUserId))
        .for("update");
      if (user) {
        await tx.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, user.id));
      }
    }
    if (!user) {
      console.error("[stripe] předplatné bez uživatele", subscriptionId);
      return null;
    }

    const current = isTier(user.tier) ? user.tier : "free";
    const tier: Tier = status === "canceled" ? "free" : (priceTier ?? current);

    await tx
      .update(users)
      .set({
        tier,
        status,
        currentPeriodEnd: status === "canceled" ? null : periodEnd,
        // Lhůta začíná první neúspěšnou platbou, opakované pokusy ji neposouvají.
        pastDueSince: status === "past_due" ? (user.pastDueSince ?? new Date()) : null,
        cancelAtPeriodEnd: status === "canceled" ? false : subscription.cancel_at_period_end,
        // Kdo zaplatil, tarif si nejen přál, ale má ho.
        requestedTier: null,
      })
      .where(eq(users.id, user.id));

    if (tier !== current) await applyTierLimit(tx, user.id, tier);
    return { userId: user.id, tier, status };
  });
}

/**
 * Dokončený Checkout. Naváže zákazníka, pokud ho ensureCustomer nezapsal, a
 * předá práci syncSubscription, aby tarif vznikal na jednom místě.
 */
export async function applyCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<SyncResult | null> {
  const userId = session.client_reference_id ?? session.metadata?.userId ?? null;
  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;

  if (userId && customerId) {
    await db()
      .update(users)
      .set({ stripeCustomerId: customerId })
      .where(and(eq(users.id, userId), isNull(users.stripeCustomerId)));
  }

  const subscriptionId =
    typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
  return subscriptionId ? syncSubscription(subscriptionId) : null;
}
