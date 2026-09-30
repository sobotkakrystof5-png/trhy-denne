import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { graceEndsAt, type BillingState } from "@/lib/billing";
import { formatDate } from "@/lib/format";
import { plans, type Tier } from "@/lib/plans";
import { paidTiers } from "@/lib/stripe";
import { openPortal, startCheckout } from "./actions";

export type TierNotice = "hotovo" | "souhlas" | "pozdeji";

const notices: Record<TierNotice, string> = {
  hotovo: "Platba proběhla. Tarif se propíše během několika sekund, případně stránku obnovte.",
  souhlas: "Bez souhlasu s okamžitým začátkem odběru platbu spustit nemůžeme.",
  pozdeji: "Platbu jste zkoušeli spustit příliš často. Zkuste to za chvíli.",
};

/**
 * Karta tarifu. Kupuje se odsud, ne z prodejní stránky: ceník na `/` jen
 * vybere tarif a pošle adresu, protože platit může jen přihlášený člověk
 * s potvrzenou adresou.
 */
export function TierCard({
  tier,
  billing,
  requested,
  hasCustomer,
  paymentsLive,
  notice,
}: {
  tier: Tier;
  billing: BillingState;
  requested: Tier | null;
  hasCustomer: boolean;
  paymentsLive: boolean;
  notice: TierNotice | null;
}) {
  const plan = plans[tier];
  const paid = tier !== "free" && billing.status !== "canceled";
  const grace = graceEndsAt(billing.pastDueSince);

  return (
    <div
      id="tarif"
      className="scroll-mt-32 rounded-[var(--radius-card)] border-3 border-ink bg-paper p-6 shadow-[var(--shadow-hard-md)] md:p-7"
    >
      <h2 className="font-display text-[0.9375rem] font-bold text-ink">Tarif</h2>

      <p className="mt-3 text-lg leading-relaxed">
        {plan.name}
        {plan.priceCzk > 0 ? `, ${plan.priceCzk} Kč měsíčně` : ", zdarma"}.
        {requested && !paymentsLive ? ` Máte zájem o ${plans[requested].name}.` : ""}
      </p>

      {paid ? (
        <PaidDetail billing={billing} grace={grace} />
      ) : (
        <p className="mt-2 text-[0.9375rem] leading-normal text-mute">
          {paymentsLive
            ? "Přehledy zatím neposíláme, první dostanete po spuštění webu."
            : "Placené tarify zatím nespouštíme. Až je spustíme, přejdete na ně tady."}
        </p>
      )}

      {notice ? (
        <p className="mt-5 rounded-[var(--radius-field)] border-3 border-ink bg-sand px-5 py-4 text-[0.9375rem] font-semibold leading-normal text-ink">
          {notices[notice]}
        </p>
      ) : null}

      {paymentsLive && !paid ? <Offer /> : null}

      {paymentsLive && hasCustomer ? (
        <form action={openPortal} className="mt-6">
          <Button type="submit" variant={paid ? "primary" : "secondary"}>
            {paid ? "Spravovat předplatné" : "Doklady a platby"}
          </Button>
        </form>
      ) : null}
    </div>
  );
}

function PaidDetail({ billing, grace }: { billing: BillingState; grace: Date | null }) {
  if (billing.status === "past_due") {
    return (
      <div className="mt-4 rounded-[var(--radius-field)] border-3 border-ink bg-sand px-5 py-4">
        <p className="text-[0.9375rem] font-semibold leading-normal text-ink">
          Poslední platba neprošla. Zkusíme ji vybrat znovu.
          {grace
            ? ` Přehledy posíláme do ${formatDate(grace)}, pak tarif zastavíme, dokud platba neprojde.`
            : ""}
        </p>
      </div>
    );
  }

  if (billing.cancelAtPeriodEnd) {
    return (
      <p className="mt-2 text-[0.9375rem] leading-normal text-mute">
        {billing.currentPeriodEnd
          ? `Předplatné jste zrušili. Tarif platí do ${formatDate(billing.currentPeriodEnd)}, pak se vrátí na Free.`
          : "Předplatné jste zrušili. Na konci zaplaceného období se tarif vrátí na Free."}
      </p>
    );
  }

  return (
    <p className="mt-2 text-[0.9375rem] leading-normal text-mute">
      {billing.currentPeriodEnd
        ? `Další platba ${formatDate(billing.currentPeriodEnd)}.`
        : "Předplatné běží."}
      {" Přehledy zatím neposíláme, první dostanete po spuštění webu."}
    </p>
  );
}

/**
 * Souhlas s okamžitým začátkem je v témže formuláři jako tarif a je povinný.
 * Bez něj by odběr nesměl začít dřív než po lhůtě na odstoupení.
 */
function Offer() {
  return (
    <form action={startCheckout} className="mt-6">
      <div className="flex items-start gap-3">
        <span className="relative mt-0.5 grid size-6 shrink-0 place-items-center">
          <input
            id="waiver"
            type="checkbox"
            name="waiver"
            required
            className="peer absolute inset-0 size-6 cursor-pointer appearance-none rounded-[4px] border-3 border-ink bg-paper checked:bg-salmon focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink"
          />
          <svg
            viewBox="0 0 16 16"
            width="14"
            height="14"
            aria-hidden="true"
            focusable="false"
            className="pointer-events-none relative hidden text-ink peer-checked:block"
          >
            <path
              d="M2.5 8.5 6.5 12 13.5 4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <label htmlFor="waiver" className="text-[0.9375rem] leading-normal text-text">
          Chci, aby přehledy začaly chodit hned po zaplacení. Beru na vědomí, že tím ztrácím právo
          odstoupit od smlouvy do čtrnácti dnů. Podrobnosti jsou v{" "}
          <Link href="/podminky" className="font-semibold underline underline-offset-2">
            podmínkách
          </Link>
          .
        </label>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        {paidTiers.map((paidTier) => (
          <Button
            key={paidTier}
            type="submit"
            name="tier"
            value={paidTier}
            variant={paidTier === "plus" ? "primary" : "secondary"}
            className="w-full sm:w-auto"
          >
            {plans[paidTier].name} za {plans[paidTier].priceCzk} Kč
          </Button>
        ))}
      </div>
      <p className="mt-4 text-[0.9375rem] leading-normal text-mute">
        Platbu vyřizuje Stripe. Zrušit jde kdykoli, tarif pak platí do konce zaplaceného měsíce.
      </p>
    </form>
  );
}
