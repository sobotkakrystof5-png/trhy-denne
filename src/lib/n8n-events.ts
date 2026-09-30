import "server-only";
import { env } from "@/lib/env";
import { signOutgoingRequest } from "@/lib/internal-auth";

/**
 * Podepsané události pro n8n (zadání 5.5, W14): uvítací e-mail, potvrzení
 * změny, Telegram. Posílají se až po zapsání platby do databáze a pád n8n
 * nesmí platbu zablokovat, proto se chyba jen zaloguje a nikdy nevyhodí.
 * Bez adresy nebo tajemství (n8n zatím nezapojené) se neposílá nic.
 */
export type N8nEvent =
  | { type: "checkout_completed"; userId: string; tier: string }
  | { type: "subscription_updated"; userId: string; tier: string; status: string }
  | { type: "subscription_canceled"; userId: string }
  | { type: "payment_failed"; userId: string };

export async function notifyN8n(event: N8nEvent): Promise<void> {
  const { N8N_EVENT_WEBHOOK_URL, INTERNAL_HMAC_SECRET } = env();
  if (!N8N_EVENT_WEBHOOK_URL || !INTERNAL_HMAC_SECRET) return;

  const body = JSON.stringify({ ...event, sentAt: new Date().toISOString() });
  try {
    const response = await fetch(N8N_EVENT_WEBHOOK_URL, {
      method: "POST",
      headers: signOutgoingRequest(body),
      body,
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) console.error("[n8n] událost odmítnuta", event.type, response.status);
  } catch (error) {
    console.error("[n8n] odeslání události selhalo", event.type, error);
  }
}
