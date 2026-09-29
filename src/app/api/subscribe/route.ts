import { z } from "zod";
import {
  CONSENT_TEXT_VERSION,
  EMAIL_MAX_LENGTH,
  EMAIL_PATTERN,
  signupTiers,
  validateSignup,
} from "@/lib/signup";

/**
 * Odběr Free (a zájem o tarif). Zatím NIC NEUKLÁDÁ: databáze a Resend
 * přijdou ve fázi 3. Do té doby trasa podle zadání (5.3) odpovídá
 * pravdivě 503, nikdy falešným úspěchem.
 *
 * Omezení počtu požadavků přijde s databází. Dokud trasa nic neukládá
 * a nic neposílá, není co zneužít.
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
      return new Response(Object.values(fields).join("\n") || "Formulář není vyplněný správně.", {
        status: 400,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
    return Response.json({ error: "invalid", fields }, { status: 400 });
  }

  const headers = { "Retry-After": "86400" };
  if (isForm) {
    return new Response(NOT_READY_TEXT, {
      status: 503,
      headers: { ...headers, "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  return Response.json({ error: "not_ready" }, { status: 503, headers });
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

/**
 * Formulář smí posílat jen tento web. Prohlížeč posílá Origin u každého
 * POST, takže chybějící hlavička znamená požadavek mimo prohlížeč.
 */
function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const allowed = new Set([new URL(request.url).origin]);
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    allowed.add(new URL(process.env.NEXT_PUBLIC_SITE_URL).origin);
  }
  return allowed.has(origin);
}
