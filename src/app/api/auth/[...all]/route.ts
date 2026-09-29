import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";
import { accountsReady } from "@/lib/env";

/**
 * Better Auth umí přes HTTP desítky cest. Web potřebuje jedinou: ověření
 * odkazu z e-mailu. Odeslání odkazu a odhlášení jdou přes serverové akce,
 * které hlídají vlastní limity (src/app/prihlaseni/actions.ts). Kdyby byla
 * cesta /sign-in/magic-link otevřená, šlo by limity obejít přímým voláním.
 */
const allowed = new Set(["GET /api/auth/magic-link/verify"]);

let handler: ReturnType<typeof toNextJsHandler> | null = null;

async function handle(request: Request) {
  const { pathname } = new URL(request.url);
  if (!allowed.has(`${request.method} ${pathname}`)) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }
  if (!accountsReady()) {
    return Response.redirect(new URL("/prihlaseni?error=UNAVAILABLE", request.url), 303);
  }
  handler ??= toNextJsHandler(auth());
  return request.method === "GET" ? handler.GET(request) : handler.POST(request);
}

export { handle as GET, handle as POST };
