"use client";

import { useEffect, useRef, useState } from "react";
import { ChangeChip } from "./ui/ChangeChip";
import { buttonClass } from "./ui/Button";
import { Sparkline } from "./Sparkline";
import { SymbolIcon } from "./SymbolIcon";
import type { ShowcaseSymbol } from "@/data/sample";
import { formatPercentChange, formatUsd } from "@/lib/format";
import { isSignificantMove } from "@/lib/plans";
import { ANALYSIS_PREFIX as PREFIX, analysisId } from "@/lib/symbols";

const INITIAL_ROWS = 8;

/**
 * Řádky analýz. Veřejně je popis, čísla a graf. Vysvětlení příčiny se
 * zdroji je jen ve Start a Plus, tady je místo něj zamčený blok.
 *
 * Odkazy "Analýza" z dashboardu jsou obyčejné kotvy #analyza-ticker.
 * Bez JavaScriptu jen doscrollují, s ním navíc rozbalí řádek, i když
 * je zrovna mezi skrytými.
 */
export function AnalysisList({ items }: { items: ShowcaseSymbol[] }) {
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const [showAll, setShowAll] = useState(false);
  const pendingFocus = useRef<string | null>(null);

  useEffect(() => {
    const reveal = (hash: string) => {
      const target = items.find((item) => `#${analysisId(item.ticker)}` === hash);
      if (!target) return false;
      const index = items.indexOf(target);
      if (index >= INITIAL_ROWS) setShowAll(true);
      setOpen((current) => new Set(current).add(target.ticker));
      pendingFocus.current = target.ticker;
      return true;
    };

    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>(
        `a[href^="#${PREFIX}"]`,
      );
      if (!link) return;
      if (reveal(link.getAttribute("href") ?? "")) event.preventDefault();
    };

    if (window.location.hash.startsWith(`#${PREFIX}`)) reveal(window.location.hash);

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [items]);

  // Scroll a fokus až po vykreslení, kdy řádek skutečně existuje.
  useEffect(() => {
    const ticker = pendingFocus.current;
    if (!ticker) return;
    pendingFocus.current = null;
    const row = document.getElementById(analysisId(ticker));
    if (!row) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    row.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
    row.querySelector<HTMLButtonElement>("button[aria-expanded]")?.focus({ preventScroll: true });
    history.replaceState(null, "", `#${analysisId(ticker)}`);
  });

  const toggle = (ticker: string) =>
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(ticker)) next.delete(ticker);
      else next.add(ticker);
      return next;
    });

  const shown = showAll ? items : items.slice(0, INITIAL_ROWS);

  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border-3 border-ink bg-paper shadow-[var(--shadow-hard-lg)]">
      <ul>
        {shown.map((item, index) => (
          <Row
            key={item.ticker}
            item={item}
            first={index === 0}
            open={open.has(item.ticker)}
            onToggle={() => toggle(item.ticker)}
          />
        ))}
      </ul>

      {items.length > INITIAL_ROWS ? (
        <div className="border-t-3 border-ink bg-cream px-5 py-5 md:px-8">
          <button
            type="button"
            onClick={() => setShowAll((value) => !value)}
            aria-expanded={showAll}
            className={buttonClass("secondary", "w-full sm:w-auto")}
          >
            {showAll ? "Zobrazit jen největší pohyby" : `Zobrazit všech ${items.length} položek`}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function Row({
  item,
  first,
  open,
  onToggle,
}: {
  item: ShowcaseSymbol;
  first: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  const id = analysisId(item.ticker);
  const panelId = `${id}-panel`;
  const buttonId = `${id}-button`;
  const { price, change, history } = item.quote;
  const low = Math.min(...history);
  const high = Math.max(...history);

  return (
    <li id={id} className={`scroll-mt-32 ${first ? "" : "border-t-2 border-ink"}`}>
      <h3 className="m-0">
        <button
          id={buttonId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className={`grid w-full cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3 px-4 py-4 text-left font-body transition-colors focus-visible:-outline-offset-[6px] md:grid-cols-[auto_minmax(0,1.4fr)_minmax(0,1fr)_7rem_auto_auto] md:gap-5 md:px-8 ${
            open ? "bg-cream" : "hover:bg-cream"
          }`}
        >
          <SymbolIcon symbol={item} />
          <span className="min-w-0">
            <span className="block truncate font-display text-lg font-bold leading-tight text-ink">
              {item.name}
              <span className="sr-only">,</span>
            </span>
            <span className="block font-display text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-mute">
              {item.ticker}
              <span className="sr-only">,</span>
            </span>
          </span>
          <span className="hidden text-[0.9375rem] text-text md:block">
            {item.sector}
            <span className="sr-only">,</span>
          </span>
          <span data-numeric className="hidden text-right font-display text-lg font-semibold text-ink md:block">
            {formatUsd(price)}
            <span className="sr-only">,</span>
          </span>
          <ChangeChip change={change} />
          {/* Název tlačítka vzniká z viditelného textu (WCAG 2.5.3), skryté
              čárky a dovětek jen oddělí údaje pro čtečku. */}
          <span className="sr-only">. Zobrazit analýzu.</span>
          <span
            aria-hidden="true"
            className="grid size-9 place-items-center rounded-[6px] border-2 border-ink bg-paper"
          >
            <svg
              viewBox="0 0 14 14"
              width="14"
              height="14"
              focusable="false"
              className={`transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-45" : ""}`}
            >
              <path d="M7 1.5v11M1.5 7h11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </span>
        </button>
      </h3>

      <div className="expander" data-open={open ? "" : undefined}>
        <div>
          <div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            className="grid gap-8 border-t-2 border-ink bg-paper px-4 py-7 md:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12"
          >
            <div>
              <p className="max-w-[60ch] text-xl leading-[1.55] text-text">{item.description}</p>
              <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5" data-numeric>
                <Stat label="Poslední cena" value={formatUsd(price)} />
                <Stat label="Změna za den" value={formatPercentChange(change)} />
                <Stat label="Minimum za 30 dní" value={formatUsd(low)} />
                <Stat label="Maximum za 30 dní" value={formatUsd(high)} />
              </dl>
            </div>

            <div className="flex flex-col gap-7">
              <div>
                <Sparkline
                  values={history}
                  strokeWidth={3}
                  className="h-32 md:h-40"
                  label={`Vývoj ceny za 30 obchodních dní, od ${formatUsd(history[0])} do ${formatUsd(price)}.`}
                />
                <p className="label-caps mt-3">30 obchodních dní</p>
              </div>
              {isSignificantMove(change) ? <LockedExplanation /> : <NoMove />}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="label-caps">{label}</dt>
      <dd className="mt-1 font-display text-2xl font-bold tracking-[-0.01em] text-ink">{value}</dd>
    </div>
  );
}

function LockedExplanation() {
  return (
    <div className="rounded-[var(--radius-tile)] border-3 border-dashed border-ink bg-sand p-5 md:p-6">
      <div className="flex items-start gap-3">
        <svg
          viewBox="0 0 20 22"
          width="20"
          height="22"
          aria-hidden="true"
          focusable="false"
          className="mt-0.5 shrink-0 text-ink"
        >
          <rect x="1.5" y="9.5" width="17" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <path d="M5.5 9.5V6.5a4.5 4.5 0 0 1 9 0v3" fill="none" stroke="currentColor" strokeWidth="2.5" />
        </svg>
        <p className="text-[1.0625rem] font-semibold leading-normal text-ink">
          Proč se cena pohnula a odkud to víme, najdete v tarifech Start a Plus.
        </p>
      </div>
      <a href="#cenik" className={buttonClass("secondary", "mt-5 h-12 no-underline")}>
        Porovnat tarify
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden="true" focusable="false">
          <path d="M1 6h13M9.5 1.5 14 6l-4.5 4.5" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </div>
  );
}

function NoMove() {
  return (
    <div className="rounded-[var(--radius-tile)] border-2 border-ink bg-cream p-5 md:p-6">
      <p className="font-display text-lg font-bold text-ink">Bez výrazného pohybu</p>
      <p className="mt-1 text-[0.9375rem] leading-normal text-text">
        V takový den report ukáže čísla a graf bez dalšího komentáře.
      </p>
    </div>
  );
}
