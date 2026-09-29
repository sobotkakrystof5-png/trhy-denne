import { z } from "zod";
import { getSession } from "@/lib/auth";
import { accountsReady } from "@/lib/env";
import { isSameOrigin, tooManyRequests } from "@/lib/http";
import { hit, limits } from "@/lib/rate-limit";
import { addToWatchlist, getWatchlist, removeFromWatchlist } from "@/lib/watchlist";

/**
 * Výběr přihlášeného uživatele. Limit tarifu se hlídá tady na serveru
 * v transakci (lib/watchlist.ts). UI ho kontroluje jen pro pohodlí.
 */
const tickerSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9.^-]{1,12}$/);

const putSchema = z.object({
  op: z.enum(["add", "remove"]),
  ticker: tickerSchema,
});

export async function GET() {
  if (!accountsReady()) return Response.json({ error: "not_ready" }, { status: 503 });
  const session = await getSession();
  if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });
  return Response.json({ items: await getWatchlist(session.user.id) });
}

export async function PUT(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "forbidden" }, { status: 403 });
  if (!accountsReady()) return Response.json({ error: "not_ready" }, { status: 503 });

  const session = await getSession();
  if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });

  if (!(request.headers.get("content-type") ?? "").startsWith("application/json")) {
    return Response.json({ error: "unsupported_media_type" }, { status: 415 });
  }
  const raw = await request.text();
  if (raw.length > 512) return Response.json({ error: "payload_too_large" }, { status: 413 });

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = putSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "invalid" }, { status: 400 });

  const userId = session.user.id;
  const limit = await hit(limits.watchlistUser, userId);
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  const { op, ticker } = parsed.data;
  if (op === "remove") {
    await removeFromWatchlist(userId, ticker);
    return Response.json({ items: await getWatchlist(userId) });
  }

  const result = await addToWatchlist(userId, ticker);
  if (!result.ok && result.reason === "unknown_symbol") {
    return Response.json({ error: "unknown_symbol" }, { status: 404 });
  }
  if (!result.ok) {
    return Response.json(
      {
        error: "limit",
        limit: result.limit,
        upgrade: result.upgrade,
        items: await getWatchlist(userId),
      },
      { status: 409 },
    );
  }
  return Response.json({ items: await getWatchlist(userId) });
}
