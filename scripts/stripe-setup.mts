/**
 * Produkty, ceny a nastavení portálu ve Stripe (fáze 4, krok 19).
 * Spuštění: npm run stripe:setup
 *
 * Opakovatelné: ceny se hledají podle `lookup_key`, takže druhý běh nic
 * nezaloží znovu. Skript nic nemaže a nemění ceny, které už existují: cena,
 * na kterou běží předplatné, se ve Stripe upravovat nesmí. Změna ceny znamená
 * novou cenu a nový `lookup_key`.
 *
 * Výstupem jsou řádky pro `.env.local`. Skript je nikam nezapisuje.
 */
import Stripe from "stripe";

try {
  process.loadEnvFile(".env.local");
} catch {
  // proměnná může přijít z prostředí
}

const key = process.env.STRIPE_SECRET_KEY;
if (!key) throw new Error("Chybí STRIPE_SECRET_KEY.");
if (key.includes("_live_")) {
  throw new Error("Tohle je klíč do živého režimu. Skript je určený pro sandbox.");
}

const stripe = new Stripe(key, { appInfo: { name: "trhy-denne-setup" } });

/** Ceny musí odpovídat ceníku na webu (src/lib/plans.ts). */
const tiers = [
  { tier: "start", name: "Trhy denně Start", czk: 79, watchlist: 5 },
  { tier: "plus", name: "Trhy denně Plus", czk: 129, watchlist: 25 },
] as const;

const created: { tier: string; priceId: string; productId: string }[] = [];

for (const plan of tiers) {
  const lookupKey = `trhy-denne-${plan.tier}-monthly`;
  const existing = await stripe.prices.list({ lookup_keys: [lookupKey], expand: ["data.product"] });

  if (existing.data[0]) {
    const price = existing.data[0];
    const productId = typeof price.product === "string" ? price.product : price.product.id;
    console.log(`${plan.tier}: cena už existuje (${price.id})`);
    created.push({ tier: plan.tier, priceId: price.id, productId });
    continue;
  }

  const product = await stripe.products.create({
    name: plan.name,
    description: `Ranní přehled amerických akcií a indexů, vlastní výběr ${plan.watchlist} položek.`,
    metadata: { tier: plan.tier },
  });
  const price = await stripe.prices.create({
    product: product.id,
    currency: "czk",
    // Haléře: 79 Kč je 7900.
    unit_amount: plan.czk * 100,
    recurring: { interval: "month" },
    lookup_key: lookupKey,
    metadata: { tier: plan.tier },
  });
  console.log(`${plan.tier}: založeno (${price.id})`);
  created.push({ tier: plan.tier, priceId: price.id, productId: product.id });
}

/**
 * Portál umí změnit tarif, platební metodu a zrušit předplatné ke konci
 * období. Změna e-mailu je vypnutá schválně: e-mail je v tomto webu
 * přihlašovací údaj a portál by ho rozešel s databází.
 */
const portal = await stripe.billingPortal.configurations.create({
  business_profile: {
    privacy_policy_url: url("/ochrana-udaju"),
    terms_of_service_url: url("/podminky"),
  },
  default_return_url: url("/ucet"),
  features: {
    customer_update: { enabled: true, allowed_updates: ["address", "tax_id"] },
    invoice_history: { enabled: true },
    payment_method_update: { enabled: true },
    subscription_cancel: {
      enabled: true,
      mode: "at_period_end",
      cancellation_reason: { enabled: true, options: ["too_expensive", "missing_features", "unused", "other"] },
    },
    subscription_update: {
      enabled: true,
      default_allowed_updates: ["price"],
      proration_behavior: "create_prorations",
      products: created.map((item) => ({ product: item.productId, prices: [item.priceId] })),
    },
  },
  metadata: { project: "trhy-denne" },
});

function url(path: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path}`;
}

console.log("\nDo .env.local:");
for (const item of created) {
  console.log(`STRIPE_PRICE_${item.tier.toUpperCase()}=${item.priceId}`);
}
console.log(`STRIPE_PORTAL_CONFIGURATION=${portal.id}`);
console.log(
  "\nStripe CLI pro webhook: stripe listen --forward-to localhost:3000/api/webhooks/stripe",
);
console.log("Jeho whsec_… patří do STRIPE_WEBHOOK_SECRET.");
