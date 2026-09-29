import "server-only";
import { createHash } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "@/db";

/**
 * Omezení počtu požadavků v pevném okně, uložené v Postgresu. Na Vercelu
 * běží víc instancí najednou, počítadlo v paměti by proto nic nehlídalo.
 * Jeden příkaz INSERT … ON CONFLICT je atomický, souběžné požadavky se
 * nepředběhnou.
 *
 * Klíč je hash, v tabulce proto neleží IP adresy ani e-maily.
 */
export type Limit = { scope: string; max: number; windowSeconds: number };

export const limits = {
  subscribeIp: { scope: "subscribe:ip", max: 5, windowSeconds: 10 * 60 },
  /** Kolik e-mailů smí na jednu adresu odejít, než se začnou tiše zahazovat. */
  emailPerAddress: { scope: "email:to", max: 3, windowSeconds: 60 * 60 },
  loginIp: { scope: "login:ip", max: 5, windowSeconds: 10 * 60 },
  confirmIp: { scope: "confirm:ip", max: 20, windowSeconds: 10 * 60 },
  searchIp: { scope: "search:ip", max: 60, windowSeconds: 60 },
  watchlistUser: { scope: "watchlist:user", max: 60, windowSeconds: 60 },
} satisfies Record<string, Limit>;

export type LimitResult = { ok: boolean; retryAfter: number };

export async function hit(limit: Limit, subject: string): Promise<LimitResult> {
  const key = createHash("sha256").update(`${limit.scope}\n${subject}`).digest("base64url");
  const window = `${limit.windowSeconds} seconds`;

  const result = await db().execute<{ count: number; retry_after: number }>(sql`
    insert into rate_limits (key, count, reset_at)
    values (${key}, 1, now() + ${window}::interval)
    on conflict (key) do update set
      count = case when rate_limits.reset_at <= now() then 1 else rate_limits.count + 1 end,
      reset_at = case when rate_limits.reset_at <= now() then excluded.reset_at else rate_limits.reset_at end
    returning count, ceil(extract(epoch from reset_at - now()))::int as retry_after
  `);

  // Úklid starých řádků občas, ať tabulka neroste. Na výsledku nezáleží.
  if (Math.random() < 0.01) {
    void db()
      .execute(sql`delete from rate_limits where reset_at < now() - interval '1 day'`)
      .catch(() => undefined);
  }

  const row = result.rows[0];
  return { ok: row.count <= limit.max, retryAfter: Math.max(row.retry_after, 1) };
}

/**
 * IP adresa klienta. Na Vercelu ji do x-forwarded-for zapisuje jeho proxy
 * (první hodnota je klient). Lokálně chybí a vrací se null.
 */
export function clientIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const candidate = forwarded || headers.get("x-real-ip")?.trim();
  if (!candidate) return null;
  return isIp(candidate) ? candidate : null;
}

function isIp(value: string): boolean {
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(value)) {
    return value.split(".").every((part) => Number(part) <= 255);
  }
  return /^[0-9a-f:]+$/i.test(value) && value.includes(":") && value.length <= 45;
}
