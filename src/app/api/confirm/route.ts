import { z } from "zod";
import { accountsReady } from "@/lib/env";
import { isSameOrigin } from "@/lib/http";
import { clientIp, hit, limits } from "@/lib/rate-limit";
import { confirmSubscription } from "@/lib/subscriptions";

/**
 * Potvrzení odběru. Odkaz v e-mailu vede na /potvrzeni, kde člověk
 * klikne na tlačítko, a teprve to token spotřebuje přes POST.
 * Bezpečnostní skenery pošty odkazy otevírají (GET), ale formuláře
 * neodesílají. Potvrzení tak dělá člověk, ne robot.
 *
 * GET zůstává kvůli zadání 5.3 a jen přesměruje na stránku s tlačítkem.
 */
const tokenSchema = z.string().regex(/^[A-Za-z0-9_-]{43}$/);

export function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const target = new URL("/potvrzeni", request.url);
  if (tokenSchema.safeParse(token).success) target.searchParams.set("token", token);
  return Response.redirect(target, 303);
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }
  if (!accountsReady()) return redirect(request, "nedostupne");

  const form = await request.formData().catch(() => null);
  const token = tokenSchema.safeParse(form?.get("token"));
  if (!token.success) return redirect(request, "neplatny");

  const limit = await hit(limits.confirmIp, clientIp(request.headers) ?? "unknown");
  if (!limit.ok) return redirect(request, "pozdeji");

  try {
    const confirmed = await confirmSubscription(token.data);
    return redirect(request, confirmed ? "potvrzeno" : "neplatny");
  } catch (error) {
    console.error("[confirm]", error);
    return redirect(request, "chyba");
  }
}

function redirect(request: Request, state: string) {
  const target = new URL("/potvrzeni", request.url);
  target.searchParams.set("stav", state);
  return Response.redirect(target, 303);
}
