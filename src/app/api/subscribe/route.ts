import { z } from "zod";
import { accountsReady } from "@/lib/env";
import { isSameOrigin, tooManyRequests } from "@/lib/http";
import { clientIp, hit, limits } from "@/lib/rate-limit";
import {
  CONSENT_TEXT_VERSION,
  EMAIL_MAX_LENGTH,
  EMAIL_PATTERN,
  signupTiers,
  validateSignup,
} from "@/lib/signup";
import { subscribe } from "@/lib/subscriptions";

/**
 * Odběr Free a zájem o tarif (zadání 5.3 a 5.4). Uloží souhlas s časem,
 * IP a verzí znění a pošle potvrzovací e-mail (double opt-in).
 *
 * Bez databáze nebo e-mailu odpovídá pravdivě 503, nikdy falešným
 * úspěchem. Odpověď neprozradí, jestli adresa už odběr měla.
 */
const bodySchema = z.object({
  email: z.string().trim().max(EMAIL_MAX_LENGTH).regex(EMAIL_PATTERN),
  consent: z.literal(true),
  tier: z.enum(signupTiers),
  consentVersion: z.literal(CONSENT_TEXT_VERSION),
});

const MAX_BODY_BYTES = 2048;

const NOT_READY_TEXT =
  "Odběr zatím nespouštíme, web se teprve dokončuje. Adresu jsme nikam neuložili.";

type Candidate = Record<string, unknown>;

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  const isJson = contentType.startsWith("application/json");
  const isForm = contentType.startsWith("application/x-www-form-urlencoded");
  if (!isJson && !isForm) {
    return Response.json({ error: "unsupported_media_type" }, { status: 415 });
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return Response.json({ error: "payload_too_large" }, { status: 413 });
  }

  const candidate = isJson ? parseJson(raw) : parseForm(raw);
  if (!candidate) {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  // Robot, který vyplnil past, dostane stejnou odpověď jako člověk.
  // Kdyby dostal chybu, naučí se pole vynechat.
  const trapped =
    typeof candidate.company === "string" && candidate.company.length > 0;

  const parsed = bodySchema.safeParse(candidate);
  if (!parsed.success && !trapped) {
    const fields = validateSignup({
      email: typeof candidate.email === "string" ? candidate.email : "",
      consent: candidate.consent === true,
    });
    if (isForm) {
      return plainText(Object.values(fields).join("\n") || "Formulář není vyplněný správně.", 400);
    }
    return Response.json({ error: "invalid", fields }, { status: 400 });
  }

  if (!accountsReady()) {
    const headers = { "Retry-After": "86400" };
    if (isForm) return plainText(NOT_READY_TEXT, 503, headers);
    return Response.json({ error: "not_ready" }, { status: 503, headers });
  }

  if (trapped || !parsed.success) return success(isForm);

  const ip = clientIp(request.headers);
  const limit = await hit(limits.subscribeIp, ip ?? "unknown");
  if (!limit.ok) {
    if (isForm) {
      return plainText("Z této adresy přišlo moc pokusů. Zkuste to za pár minut znovu.", 429, {
        "Retry-After": String(limit.retryAfter),
      });
    }
    return tooManyRequests(limit.retryAfter);
  }

  try {
    await subscribe({
      email: parsed.data.email,
      tier: parsed.data.tier,
      consentVersion: parsed.data.consentVersion,
      ip,
    });
  } catch (error) {
    console.error("[subscribe]", error);
    if (isForm) return plainText("Server teď odpověděl chybou. Zkuste to za pár minut znovu.", 500);
    return Response.json({ error: "server_error" }, { status: 500 });
  }

  return success(isForm);
}

/** Bez JavaScriptu se po úspěchu přesměruje na stránku s dalším krokem. */
function success(isForm: boolean) {
  if (isForm) {
    return new Response(null, { status: 303, headers: { Location: "/dekujeme" } });
  }
  return Response.json({ ok: true });
}

function plainText(body: string, status: number, headers: Record<string, string> = {}) {
  return new Response(body, {
    status,
    headers: { ...headers, "Content-Type": "text/plain; charset=utf-8" },
  });
}

function parseJson(raw: string): Candidate | null {
  try {
    const value: unknown = JSON.parse(raw);
    return value && typeof value === "object" ? (value as Candidate) : null;
  } catch {
    return null;
  }
}

/** Bez JavaScriptu přijde klasický formulář. Zaškrtnuté pole posílá "on". */
function parseForm(raw: string): Candidate {
  const form = new URLSearchParams(raw);
  return {
    email: form.get("email") ?? "",
    consent: form.get("consent") === "on",
    tier: form.get("tier") ?? "free",
    consentVersion: form.get("consentVersion") ?? "",
    company: form.get("company") ?? "",
  };
}
