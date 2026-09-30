"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth, getSession } from "@/lib/auth";
import { createCheckout, createPortal } from "@/lib/billing";
import { paymentsReady } from "@/lib/env";
import { hit, limits } from "@/lib/rate-limit";
import { confirmSubscriptionForUser } from "@/lib/subscriptions";
import { paidTiers } from "@/lib/stripe";

export async function signOut() {
  await auth().api.signOut({ headers: await headers() });
  redirect("/");
}

/** Potvrzení odběru z účtu, pro toho, kdo se přihlásil dřív, než potvrdil. */
export async function confirmFromAccount() {
  const session = await getSession();
  if (!session) redirect("/prihlaseni");
  await confirmSubscriptionForUser(session.user.id);
  revalidatePath("/ucet");
}

/**
 * Souhlas se zaškrtává v témže formuláři jako tarif, takže bez něj se
 * Checkout nezaloží ani s vypnutým JavaScriptem.
 */
const checkoutSchema = z.object({
  tier: z.enum(paidTiers),
  waiver: z.literal("on"),
});

export async function startCheckout(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/prihlaseni");
  if (!paymentsReady()) redirect("/ucet");

  const parsed = checkoutSchema.safeParse({
    tier: formData.get("tier"),
    waiver: formData.get("waiver"),
  });
  if (!parsed.success) redirect("/ucet?platba=souhlas");

  const limit = await hit(limits.billingUser, session.user.id);
  if (!limit.ok) redirect("/ucet?platba=pozdeji");

  redirect(await createCheckout(session.user.id, parsed.data.tier));
}

export async function openPortal() {
  const session = await getSession();
  if (!session) redirect("/prihlaseni");
  if (!paymentsReady()) redirect("/ucet");

  const limit = await hit(limits.billingUser, session.user.id);
  if (!limit.ok) redirect("/ucet?platba=pozdeji");

  const url = await createPortal(session.user.id);
  redirect(url ?? "/ucet");
}
