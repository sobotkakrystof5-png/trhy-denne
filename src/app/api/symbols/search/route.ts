import { sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { accountsReady } from "@/lib/env";
import { tooManyRequests } from "@/lib/http";
import { clientIp, hit, limits } from "@/lib/rate-limit";

/**
 * Vyhledávání v katalogu nad trigramovým indexem (zadání 5.3). Ticker se
 * hledá od začátku, název kdekoli a s tolerancí překlepů. Vrací i to, jestli
 * pro položku máme čerstvá data. Dokud neběží datové API, jsou "data"
 * jen ukázková data vitríny.
 */
const querySchema = z.string().trim().min(1).max(40);

export async function GET(request: Request) {
  if (!accountsReady()) return Response.json({ error: "not_ready" }, { status: 503 });

  const q = querySchema.safeParse(new URL(request.url).searchParams.get("q") ?? "");
  if (!q.success) return Response.json({ error: "invalid" }, { status: 400 });

  const limit = await hit(limits.searchIp, clientIp(request.headers) ?? "unknown");
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  const needle = q.data;
  const like = needle.replace(/[\\%_]/g, (char) => `\\${char}`);

  const result = await db().execute<{
    ticker: string;
    name: string;
    kind: string;
    has_data: boolean;
  }>(sql`
    select s.ticker, s.name, s.kind, (sc.ticker is not null) as has_data
    from symbols s
    left join showcase_symbols sc on sc.ticker = s.ticker
    where s.active
      and (
        s.ticker ilike ${like + "%"}
        or s.name ilike ${"%" + like + "%"}
        or s.name % ${needle}
      )
    order by
      (upper(s.ticker) = upper(${needle})) desc,
      (s.ticker ilike ${like + "%"}) desc,
      similarity(s.name, ${needle}) desc,
      s.ticker
    limit 20
  `);

  return Response.json({
    items: result.rows.map((row) => ({
      ticker: row.ticker,
      name: row.name,
      kind: row.kind,
      hasData: row.has_data,
    })),
  });
}
