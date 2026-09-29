import "server-only";
import { and, asc, count, eq, sql } from "drizzle-orm";
import { db, schema, withTransaction } from "@/db";
import { checkAdd, isTier, type Limits, type Tier } from "@/lib/plans";

const { users, planLimits, watchlist, symbols } = schema;

export type WatchlistEntry = { ticker: string; active: boolean };

export type AddResult =
  | { ok: true }
  | { ok: false; reason: "limit"; limit: number; upgrade: Tier | null }
  | { ok: false; reason: "unknown_symbol" };

/** Limity všech tarifů z plan_limits. Jediný zdroj pravdy (AGENTS.md). */
export async function loadLimits(): Promise<Limits> {
  const rows = await db()
    .select({ tier: planLimits.tier, max: planLimits.maxWatchlist })
    .from(planLimits);
  const limits: Partial<Limits> = {};
  for (const row of rows) if (isTier(row.tier)) limits[row.tier] = row.max;
  if (Object.keys(limits).length !== 4) throw new Error("plan_limits není úplná.");
  return limits as Limits;
}

export async function getWatchlist(userId: string): Promise<WatchlistEntry[]> {
  return db()
    .select({ ticker: watchlist.ticker, active: watchlist.active })
    .from(watchlist)
    .where(eq(watchlist.userId, userId))
    .orderBy(asc(watchlist.addedAt), asc(watchlist.ticker));
}

/**
 * Přidání položky (zadání 5.7). Jedna transakce přes Pool:
 * 1. zamkne řádek uživatele (SELECT … FOR UPDATE), takže dvě souběžná
 *    přidání se seřadí za sebe a druhé už vidí první,
 * 2. načte limit tarifu a spočítá aktivní položky,
 * 3. při plném výběru vrátí, co by přidal vyšší tarif,
 * 4. jinak vloží položku. Neaktivní položku (přebytek po snížení tarifu)
 *    znovu zapne, pokud je místo.
 */
export async function addToWatchlist(userId: string, ticker: string): Promise<AddResult> {
  return withTransaction(async (tx) => {
    const [user] = await tx
      .select({ tier: users.tier })
      .from(users)
      .where(eq(users.id, userId))
      .for("update");
    if (!user || !isTier(user.tier)) throw new Error("Uživatel nebo tarif neexistuje.");

    const [symbol] = await tx
      .select({ ticker: symbols.ticker })
      .from(symbols)
      .where(and(eq(symbols.ticker, ticker), eq(symbols.active, true)));
    if (!symbol) return { ok: false, reason: "unknown_symbol" };

    const [existing] = await tx
      .select({ active: watchlist.active })
      .from(watchlist)
      .where(and(eq(watchlist.userId, userId), eq(watchlist.ticker, ticker)));
    if (existing?.active) return { ok: true };

    const limitRows = await tx
      .select({ tier: planLimits.tier, max: planLimits.maxWatchlist })
      .from(planLimits);
    const limits = Object.fromEntries(limitRows.map((row) => [row.tier, row.max])) as Limits;

    const [{ value: activeCount }] = await tx
      .select({ value: count() })
      .from(watchlist)
      .where(and(eq(watchlist.userId, userId), eq(watchlist.active, true)));

    const check = checkAdd(activeCount, user.tier, limits);
    if (!check.ok) return { ok: false, reason: "limit", limit: check.limit, upgrade: check.upgrade };

    await tx
      .insert(watchlist)
      .values({ userId, ticker })
      .onConflictDoUpdate({
        target: [watchlist.userId, watchlist.ticker],
        set: { active: true, addedAt: sql`now()` },
      });
    return { ok: true };
  });
}

/** Odebrání nic nepřidává, limit hlídat nemusí. Stačí jeden příkaz. */
export async function removeFromWatchlist(userId: string, ticker: string): Promise<void> {
  await db()
    .delete(watchlist)
    .where(and(eq(watchlist.userId, userId), eq(watchlist.ticker, ticker)));
}
