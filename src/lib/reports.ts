import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/db";
import { hasPaidAccess } from "@/lib/billing";

const { users, watchlist, symbols, tickerDaily, marketDaily } = schema;

export type ReportRow = {
  ticker: string;
  name: string;
  price: number | null;
  changePct: number | null;
  significant: boolean;
  summaryText: string | null;
};

export type SkipReason = "unknown_user" | "not_confirmed" | "unsubscribed" | "no_paid_access" | "empty_watchlist";

export type ReportData = {
  /** Report za trh jako celek prošel kontrolou (W1d). Bez toho se nic nerenderuje. */
  ready: boolean;
  sp500ChangePct: number | null;
  recipients: { userId: string; rows: ReportRow[] }[];
  skipped: { userId: string; reason: SkipReason }[];
};

const num = (value: string | null): number | null => (value === null ? null : Number(value));

/**
 * Data pro dávku uživatelů, třemi dotazy bez ohledu na velikost dávky.
 * Čísla se berou jen z tabulek pipeline (ticker_daily, market_daily),
 * nic se tu nedopočítává ani nedopisuje (zadání 1.2).
 */
export async function loadReportData(userIds: string[], reportDate: string): Promise<ReportData> {
  const [market] = await db()
    .select({ ready: marketDaily.reportReady, sp500: marketDaily.sp500ChangePct })
    .from(marketDaily)
    .where(eq(marketDaily.reportDate, reportDate));

  if (!market?.ready) {
    return { ready: false, sp500ChangePct: null, recipients: [], skipped: [] };
  }

  const userRows = await db()
    .select({
      id: users.id,
      tier: users.tier,
      status: users.status,
      pastDueSince: users.pastDueSince,
      confirmedAt: users.emailConfirmedAt,
      unsubscribedAt: users.unsubscribedAt,
    })
    .from(users)
    .where(inArray(users.id, userIds));

  const skipped: ReportData["skipped"] = [];
  const eligible = new Map<string, (typeof userRows)[number]>();
  const known = new Set(userRows.map((row) => row.id));

  for (const id of userIds) if (!known.has(id)) skipped.push({ userId: id, reason: "unknown_user" });
  for (const user of userRows) {
    if (!user.confirmedAt) skipped.push({ userId: user.id, reason: "not_confirmed" });
    else if (user.unsubscribedAt) skipped.push({ userId: user.id, reason: "unsubscribed" });
    else if (
      user.tier !== "free" &&
      !hasPaidAccess({
        status: user.status,
        pastDueSince: user.pastDueSince,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      })
    ) {
      skipped.push({ userId: user.id, reason: "no_paid_access" });
    } else eligible.set(user.id, user);
  }

  const eligibleIds = [...eligible.keys()];
  const picks = eligibleIds.length
    ? await db()
        .select({ userId: watchlist.userId, ticker: watchlist.ticker, name: symbols.name })
        .from(watchlist)
        .innerJoin(symbols, eq(symbols.ticker, watchlist.ticker))
        .where(and(inArray(watchlist.userId, eligibleIds), eq(watchlist.active, true)))
        .orderBy(watchlist.addedAt, watchlist.ticker)
    : [];

  const tickers = [...new Set(picks.map((pick) => pick.ticker))];
  const daily = tickers.length
    ? await db()
        .select({
          ticker: tickerDaily.ticker,
          price: tickerDaily.price,
          changePct: tickerDaily.changePct,
          significant: tickerDaily.significant,
          summaryText: tickerDaily.summaryText,
        })
        .from(tickerDaily)
        .where(and(eq(tickerDaily.reportDate, reportDate), inArray(tickerDaily.ticker, tickers)))
    : [];
  const dailyByTicker = new Map(daily.map((row) => [row.ticker, row]));

  const rowsByUser = new Map<string, ReportRow[]>();
  for (const pick of picks) {
    const day = dailyByTicker.get(pick.ticker);
    const rows = rowsByUser.get(pick.userId) ?? [];
    rows.push({
      ticker: pick.ticker,
      name: pick.name,
      price: num(day?.price ?? null),
      changePct: num(day?.changePct ?? null),
      significant: day?.significant ?? false,
      summaryText: day?.summaryText ?? null,
    });
    rowsByUser.set(pick.userId, rows);
  }

  const recipients: ReportData["recipients"] = [];
  for (const id of eligibleIds) {
    const rows = rowsByUser.get(id);
    if (rows?.length) recipients.push({ userId: id, rows });
    else skipped.push({ userId: id, reason: "empty_watchlist" });
  }

  return { ready: true, sp500ChangePct: num(market.sp500), recipients, skipped };
}
