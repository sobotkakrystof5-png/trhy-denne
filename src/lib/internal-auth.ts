import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";

/**
 * Podpis interních tras mezi Next.js a n8n (zadání 5.6). Jeden mechanismus
 * platí obousměrně: n8n volá /api/internal/render-report, Next.js posílá
 * podepsané události po platbě. Sdílené tajemství je INTERNAL_HMAC_SECRET.
 */
const MAX_AGE_SECONDS = 5 * 60;

function sign(secret: string, timestamp: string, body: string): string {
  return createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
}

/**
 * Ověří příchozí požadavek: podpis nad syrovým tělem a časovou značku ne
 * starší 5 minut. Bez tajemství (zatím nezapojeno) vždy odmítne.
 */
export function verifyInternalRequest(headers: Headers, rawBody: string): boolean {
  const secret = env().INTERNAL_HMAC_SECRET;
  if (!secret) return false;

  const timestamp = headers.get("x-internal-timestamp");
  const signature = headers.get("x-internal-signature");
  if (!timestamp || !signature) return false;

  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > MAX_AGE_SECONDS) return false;

  const expected = sign(secret, timestamp, rawBody);
  const given = Buffer.from(signature, "hex");
  const wanted = Buffer.from(expected, "hex");
  if (given.length !== wanted.length) return false;
  return timingSafeEqual(given, wanted);
}

/** Hlavičky pro odchozí podepsaný požadavek na n8n. Vyžaduje tajemství. */
export function signOutgoingRequest(body: string): Record<string, string> {
  const secret = env().INTERNAL_HMAC_SECRET;
  if (!secret) throw new Error("INTERNAL_HMAC_SECRET není nastavená.");
  const timestamp = String(Math.floor(Date.now() / 1000));
  return {
    "content-type": "application/json",
    "x-internal-timestamp": timestamp,
    "x-internal-signature": sign(secret, timestamp, body),
  };
}
