import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { db, schema } from "@/db";
import { applyCheckoutSession, syncSubscription } from "@/lib/billing";
import { env, paymentsReady } from "@/lib/env";
import { notifyN8n } from "@/lib/n8n-events";
import { stripe } from "@/lib/stripe";

/**
 * Webhook Stripe (zadání 5.5). Podpis se ověřuje nad surovým tělem, proto
 * request.text() a žádné parsování předem. Tělo ani podpis se nikdy nelogují.
 *
 * Idempotence: první krok je zápis do stripe_events. Když už tam řádek je,
 * událost se zpracovala a odpověď je 200 bez další práce. Když zpracování
 * spadne, řádek se maže, aby Stripe mohl doručení zopakovat.
 */
export async function POST(request: Request) {
  if (!paymentsReady()) return Response.json({ error: "not_ready" }, { status: 503 });

  const signature = request.headers.get("stripe-signature");
  if (!signature) return Response.json({ error: "missing_signature" }, { status: 400 });

  const secret = env().STRIPE_WEBHOOK_SECRET;
  if (!secret) return Response.json({ error: "not_ready" }, { status: 503 });

  const raw = await request.text();
  let event: Stripe.Event;
  try {
    event = await stripe().webhooks.constructEventAsync(raw, signature, secret);
  } catch {
    return Response.json({ error: "invalid_signature" }, { status: 400 });
  }

  const claimed = await db()
    .insert(schema.stripeEvents)
    .values({ eventId: event.id, type: event.type })
    .onConflictDoNothing()
    .returning({ eventId: schema.stripeEvents.eventId });
  if (claimed.length === 0) return Response.json({ received: true, duplicate: true });

  try {
    await handle(event);
  } catch (error) {
    await db()
      .delete(schema.stripeEvents)
      .where(eq(schema.stripeEvents.eventId, event.id))
      .catch(() => undefined);
    console.error("[stripe] zpracování selhalo", event.type, error);
    return Response.json({ error: "failed" }, { status: 500 });
  }

  return Response.json({ received: true });
}

/**
 * Po zápisu do databáze jde do n8n podepsaná zpráva (zadání 5.5, W14).
 * notifyN8n nikdy nevyhazuje, takže pád n8n platbu ani opakované doručení
 * události nezpůsobí.
 */
async function handle(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed": {
      const result = await applyCheckoutSession(event.data.object);
      if (result) await notifyN8n({ type: "checkout_completed", userId: result.userId, tier: result.tier });
      return;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const result = await syncSubscription(event.data.object.id);
      if (result) {
        await notifyN8n({
          type: "subscription_updated",
          userId: result.userId,
          tier: result.tier,
          status: result.status,
        });
      }
      return;
    }

    case "customer.subscription.deleted": {
      const result = await syncSubscription(event.data.object.id);
      if (result) await notifyN8n({ type: "subscription_canceled", userId: result.userId });
      return;
    }

    case "invoice.payment_failed": {
      // Fakturu už předplatné nenese přímo, od verze basil je v parent.
      const details = event.data.object.parent?.subscription_details?.subscription;
      const id = typeof details === "string" ? details : details?.id;
      if (!id) return;
      const result = await syncSubscription(id);
      if (result) await notifyN8n({ type: "payment_failed", userId: result.userId });
      return;
    }

    default:
      // Ostatní události neposloucháme. Odpověď je stejně 200, jinak by je
      // Stripe zkoušel doručovat znovu.
      return;
  }
}
