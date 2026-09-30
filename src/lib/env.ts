import "server-only";
import { z } from "zod";

/**
 * Proměnné prostředí serveru. Čtou se líně, aby build prošel i bez nich.
 * Chybějící hodnota znamená "funkce není zapojená" a trasy to říkají
 * pravdivě (503), místo aby předstíraly úspěch.
 *
 * Do prohlížeče smí jen NEXT_PUBLIC_*. Tento soubor na klientu spadne
 * už při importu (server-only).
 */
const schema = z.object({
  DATABASE_URL: z.url().optional(),
  BETTER_AUTH_SECRET: z.string().min(32).optional(),
  RESEND_API_KEY: z.string().startsWith("re_").optional(),
  EMAIL_FROM: z.string().min(3).optional(),
  NEXT_PUBLIC_SITE_URL: z.url().optional(),
  // Doporučený je omezený klíč (rk_), tajný (sk_) jen když omezený nejde.
  STRIPE_SECRET_KEY: z.string().regex(/^(rk|sk)_(test|live)_/).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_").optional(),
  STRIPE_PRICE_START: z.string().startsWith("price_").optional(),
  STRIPE_PRICE_PLUS: z.string().startsWith("price_").optional(),
  /** Konfigurace portálu ze scripts/stripe-setup.mts. Bez ní výchozí z Dashboardu. */
  STRIPE_PORTAL_CONFIGURATION: z.string().startsWith("bpc_").optional(),
  /** Sdílené tajemství pro podpis interních tras mezi Next.js a n8n (zadání 5.6). */
  INTERNAL_HMAC_SECRET: z.string().min(32).optional(),
  /** Adresa, na kterou Next.js posílá podepsané události po platbě (W14). */
  N8N_EVENT_WEBHOOK_URL: z.url().optional(),
});

type Env = z.infer<typeof schema>;

let cached: Env | null = null;

export function env(): Env {
  if (cached) return cached;
  const empty = (value: string | undefined) => (value ? value : undefined);
  cached = schema.parse({
    DATABASE_URL: empty(process.env.DATABASE_URL),
    BETTER_AUTH_SECRET: empty(process.env.BETTER_AUTH_SECRET),
    RESEND_API_KEY: empty(process.env.RESEND_API_KEY),
    EMAIL_FROM: empty(process.env.EMAIL_FROM),
    NEXT_PUBLIC_SITE_URL: empty(process.env.NEXT_PUBLIC_SITE_URL),
    STRIPE_SECRET_KEY: empty(process.env.STRIPE_SECRET_KEY),
    STRIPE_WEBHOOK_SECRET: empty(process.env.STRIPE_WEBHOOK_SECRET),
    STRIPE_PRICE_START: empty(process.env.STRIPE_PRICE_START),
    STRIPE_PRICE_PLUS: empty(process.env.STRIPE_PRICE_PLUS),
    STRIPE_PORTAL_CONFIGURATION: empty(process.env.STRIPE_PORTAL_CONFIGURATION),
    INTERNAL_HMAC_SECRET: empty(process.env.INTERNAL_HMAC_SECRET),
    N8N_EVENT_WEBHOOK_URL: empty(process.env.N8N_EVENT_WEBHOOK_URL),
  });
  return cached;
}

export const isDev = process.env.NODE_ENV === "development";

/** Adresa webu pro odkazy v e-mailech. Nikdy ne z hlavičky Host. */
export function siteUrl(): string {
  const url = env().NEXT_PUBLIC_SITE_URL;
  if (url) return url.replace(/\/$/, "");
  if (isDev) return "http://localhost:3000";
  throw new Error("NEXT_PUBLIC_SITE_URL není nastavená.");
}

/**
 * Může web odesílat e-maily? Bez Resendu jen ve vývoji, kde se odkaz
 * vypíše do konzole serveru. V produkci bez klíče odběr neběží.
 */
export function canSendEmail(): boolean {
  const { RESEND_API_KEY, EMAIL_FROM } = env();
  return Boolean(RESEND_API_KEY && EMAIL_FROM) || isDev;
}

/** Odběr a přihlášení potřebují databázi, tajemství relací a e-mail. */
export function accountsReady(): boolean {
  const { DATABASE_URL, BETTER_AUTH_SECRET } = env();
  return Boolean(DATABASE_URL && BETTER_AUTH_SECRET) && canSendEmail();
}

/**
 * Běží placené tarify? Potřebují účty, klíč, podpis webhooku a obě ceny.
 * Bez webhooku by se zaplacený tarif nikdy nepropsal, proto je povinný.
 */
export function paymentsReady(): boolean {
  const e = env();
  return (
    accountsReady() &&
    Boolean(e.STRIPE_SECRET_KEY && e.STRIPE_WEBHOOK_SECRET && e.STRIPE_PRICE_START && e.STRIPE_PRICE_PLUS)
  );
}

/** Umí web ověřit podepsané požadavky z n8n a podepisovat ty svoje? */
export function internalRoutesReady(): boolean {
  return Boolean(env().INTERNAL_HMAC_SECRET);
}
