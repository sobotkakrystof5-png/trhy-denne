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
