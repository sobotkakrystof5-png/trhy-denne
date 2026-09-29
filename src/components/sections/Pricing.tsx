import type { ReactNode } from "react";
import { plans, type Tier } from "@/lib/plans";
import { Badge } from "../ui/Badge";
import { ButtonLink } from "../ui/Button";

type Column = {
  tier: Tier;
  tone: string;
  badge?: ReactNode;
  raised?: boolean;
  reports: string;
  content: string;
  watchlist: string;
  archive: string;
  cta: ReactNode;
};

/**
 * Ceník. Karty jsou sloupce jedné tabulky: řádky drží subgrid, takže
 * "Obsah" je u všech tarifů na stejné výšce a dají se porovnat očima.
 *
 * Musí říkat pravdu o tom, co ještě neexistuje (odpolední report, Pro).
 */
const columns: Column[] = [
  {
    tier: "free",
    tone: "bg-paper",
    reports: "Jednou týdně, v neděli",
    content: "Tři největší pohyby týdne",
    watchlist: "Bez vlastního výběru",
    archive: "Bez archivu",
    cta: (
      <ButtonLink href="#objednat" data-signup-tier="free" className="w-full">
        Začít zdarma
      </ButtonLink>
    ),
  },
  {
    tier: "start",
    tone: "bg-mist",
    reports: "Každé ráno po obchodním dni",
    content:
      "Přehled S&P 500 s největšími růsty a propady. U výrazných pohybů vysvětlení se zdroji.",
    watchlist: "5 položek",
    archive: "Bez archivu",
    cta: (
      <ButtonLink href="#objednat" data-signup-tier="start" className="w-full">
        Vybrat tarif
      </ButtonLink>
    ),
  },
  {
    tier: "plus",
    tone: "bg-salmon",
    badge: <Badge>Nejvíc obsahu</Badge>,
    raised: true,
    reports: "Každé ráno. Odpolední report po otevření Wall Street připravujeme.",
    content: "Vše ze Startu, k tomu kalendář výsledků a dividend",
    watchlist: "25 položek",
    archive: "90 dní",
    cta: (
      <ButtonLink href="#objednat" data-signup-tier="plus" className="w-full">
        Vybrat tarif
      </ButtonLink>
    ),
  },
  {
    tier: "pro",
    tone: "bg-sand",
    badge: <Badge>Brzy</Badge>,
    reports: "Třikrát denně a upozornění na pohyby",
    content: "Vše z Plusu, k tomu analýza sektorů a týdenní souhrn",
    watchlist: "100 položek",
    archive: "Celý archiv",
    cta: (
      <div>
        <span className="flex h-14 w-full items-center justify-center rounded-[var(--radius-btn)] border-3 border-dashed border-ink font-display text-[0.9375rem] font-bold uppercase tracking-[0.08em] text-ink">
          Připravujeme
        </span>
        <p className="mt-3 text-[0.9375rem] leading-normal">Tarif Pro teprve stavíme.</p>
      </div>
    ),
  },
];

export function Pricing() {
  return (
    <section id="cenik" aria-labelledby="cenik-title" className="content-width section-y">
      <div className="max-w-[44rem]">
        <h2 id="cenik-title" className="h2">
          Tarify a ceny
        </h2>
        <p className="lead mt-6">
          Odpolední report a tarif Pro teprve stavíme. U obou to píšeme přímo
          v ceníku.
        </p>
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-2 md:grid-rows-[repeat(14,auto)] xl:grid-cols-4 xl:grid-rows-[repeat(7,auto)]">
        {columns.map((column) => (
          <PlanCard key={column.tier} column={column} />
        ))}
      </div>
    </section>
  );
}

function PlanCard({ column }: { column: Column }) {
  const plan = plans[column.tier];
  const titleId = `plan-${column.tier}`;

  return (
    <article
      aria-labelledby={titleId}
      className={`relative grid gap-y-0 rounded-[var(--radius-card)] border-3 border-ink shadow-[var(--shadow-hard-lg)] md:row-span-7 md:grid-rows-subgrid ${column.tone} ${
        column.raised ? "xl:-translate-y-3" : ""
      }`}
    >
      {column.badge ? <div className="absolute -top-4 right-5">{column.badge}</div> : null}

      <div className="px-6 pb-2 pt-7">
        <h3 id={titleId} className="h3">
          {plan.name}
        </h3>
      </div>

      <p className="flex items-baseline gap-2 px-6 pb-6" data-numeric>
        <span className="font-display text-[3.5rem] font-bold leading-none tracking-[-0.02em] text-ink">
          {plan.priceCzk}
        </span>
        <span className="font-display text-base font-semibold text-ink">Kč / měs.</span>
      </p>

      <Value label="Reporty">{column.reports}</Value>
      <Value label="Obsah">{column.content}</Value>
      <Value label="Vlastní výběr">{column.watchlist}</Value>
      <Value label="Archiv">{column.archive}</Value>

      <div className="border-t-2 border-ink px-6 py-6">{column.cta}</div>
    </article>
  );
}

/** Hodnota s vlastním popiskem, aby dávala smysl i v kartách pod sebou. */
function Value({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-t-2 border-ink px-6 py-4">
      <p className="font-display text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-ink">
        {label}
      </p>
      <p className="mt-1 text-[1.0625rem] leading-snug text-text">{children}</p>
    </div>
  );
}
