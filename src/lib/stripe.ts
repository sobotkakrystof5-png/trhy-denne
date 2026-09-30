import "server-only";
import Stripe from "stripe";
import { env } from "@/lib/env";
import type { Tier } from "@/lib/plans";

/**
 * Klient Stripe. Verze API je ta, se kterou vyšlo SDK (package.json), takže
 * typy a odpovědi sedí. Při upgradu SDK projít changelog, ve verzi basil
 * se třeba přesunul current_period_end ze Subscription na SubscriptionItem.
 */
let client: Stripe | null = null;

export function stripe(): Stripe {
  const key = env().STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY není nastavená.");
  client ??= new Stripe(key, { appInfo: { name: "trhy-denne" } });
  return client;
}

/** Tarify, které jde koupit. Pro se staví později (zadání 1.1). */
export const paidTiers = ["start", "plus"] as const satisfies Tier[];
export type PaidTier = (typeof paidTiers)[number];

/**
 * Cena a tarif se mapují jen tady, na serveru. Klient posílá název tarifu,
 * ID ceny nikdy (AGENTS.md, bezpečnostní pravidlo 7).
 */
export function priceForTier(tier: PaidTier): string {
  const { STRIPE_PRICE_START, STRIPE_PRICE_PLUS } = env();
  const price = tier === "start" ? STRIPE_PRICE_START : STRIPE_PRICE_PLUS;
  if (!price) throw new Error(`Cena pro tarif ${tier} není nastavená.`);
  return price;
}

export function tierForPrice(priceId: string): PaidTier | null {
  const { STRIPE_PRICE_START, STRIPE_PRICE_PLUS } = env();
  if (priceId === STRIPE_PRICE_START) return "start";
  if (priceId === STRIPE_PRICE_PLUS) return "plus";
  return null;
}

/** Štítek pro porovnání toků Checkoutu v Dashboardu. Jediný tok, jediný štítek. */
export const CHECKOUT_INTEGRATION_ID = "ucet-tarif";

/** Verze znění souhlasu s okamžitým poskytnutím digitálního obsahu. */
export const WAIVER_TEXT_VERSION = "2026-09-30";
