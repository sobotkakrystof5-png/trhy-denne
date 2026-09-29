"use client";

import { useId, useMemo, useState, useSyncExternalStore } from "react";
import { ChangeChip } from "./ui/ChangeChip";
import { Segmented } from "./ui/Segmented";
import { CountUp } from "./CountUp";
import { Sparkline } from "./Sparkline";
import { SymbolIcon } from "./SymbolIcon";
import { useDrawOnView } from "./useDrawOnView";
import type { ShowcaseSymbol, SymbolInfo } from "@/data/sample";
import { formatPercentChange, formatUsd, plural } from "@/lib/format";
import {
  checkAdd,
  pickerTiers,
  plans,
  type AddCheck,
  type PickerTier,
} from "@/lib/plans";
import { analysisId, matches, type PickerItem } from "@/lib/symbols";

type Stored = { v: 1; tier: PickerTier; selection: string[] };

const MAX_STORED = 100;

/**
 * Nástroj pro výběr položek. Na prodejní stránce žije výběr jen
 * v prohlížeči. Ve fázi 3 tatáž komponenta poběží v /ucet nad uloženým
 * výběrem a limit navíc pohlídá server (checkAdd je sdílená).
 */
export function WatchlistPicker({
  items,
  catalog,
  featuredTicker,
  analysisLinks = false,
  storageKey,
}: {
  items: ShowcaseSymbol[];
  catalog: SymbolInfo[];
  featuredTicker?: string;
  /** Dlaždice vitríny dostanou odkaz na řádek analýzy (prodejní stránka). */
  analysisLinks?: boolean;
  storageKey: string;
}) {
  const ids = useId();
  const drawRef = useDrawOnView<HTMLUListElement>();

  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState<AddCheck | null>(null);

  // Výběr žije v localStorage. Server o něm nic neví, proto při
  // hydrataci platí výchozí stav a uložený se načte hned po ní.
  const stored = useSyncExternalStore(
    subscribeStored,
    () => readStored(storageKey),
    () => DEFAULT_STORED,
  );

  const known = useMemo(() => {
    const map = new Map<string, PickerItem>();
    for (const item of catalog) map.set(item.ticker, item);
    for (const item of items) map.set(item.ticker, item);
    return map;
  }, [items, catalog]);

  const tier = stored.tier;
  const selection = useMemo(
    () => stored.selection.filter((ticker) => known.has(ticker)),
    [stored, known],
  );
  const setSelection = (next: string[]) =>
    writeStored(storageKey, { v: 1, tier, selection: next.slice(0, MAX_STORED) });

  const limit = plans[tier].maxWatchlist;
  const over = Math.max(selection.length - limit, 0);

  const toggle = (ticker: string) => {
    if (selection.includes(ticker)) {
      setSelection(selection.filter((entry) => entry !== ticker));
      setNotice(null);
      return;
    }
    const check = checkAdd(selection.length, tier);
    if (!check.ok) {
      setNotice(check);
      return;
    }
    setSelection([...selection, ticker]);
    setNotice(null);
  };

  const changeTier = (next: PickerTier) => {
    writeStored(storageKey, { v: 1, tier: next, selection });
    setNotice(null);
  };

  const searching = query.trim().length > 0;
  const visible: PickerItem[] = useMemo(() => {
    if (!searching) return items;
    const inShowcase = new Set(items.map((item) => item.ticker));
    return [
      ...items.filter((item) => matches(item, query)),
      ...catalog.filter(
        (item) => !inShowcase.has(item.ticker) && matches(item, query),
      ),
    ];
  }, [searching, items, catalog, query]);

  const featured =
    !searching && featuredTicker && visible[0]?.ticker === featuredTicker && visible.length >= 5;

  return (
    <div>
      <div className="rounded-[var(--radius-card)] border-3 border-ink bg-paper p-5 shadow-[var(--shadow-hard-md)] md:p-7">
        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-6">
          <div>
            <label
              htmlFor={`${ids}-search`}
              className="mb-2 block font-display text-[0.9375rem] font-bold text-ink"
            >
              Hledat ticker nebo název
            </label>
            <input
              id={`${ids}-search`}
              type="search"
              autoComplete="off"
              spellCheck={false}
              placeholder="třeba NVDA nebo Tesla"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-14 w-full rounded-[var(--radius-field)] border-3 border-ink bg-cream px-5 text-lg text-ink placeholder:text-mute focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink"
            />
          </div>
          <Segmented
            legend="Zobrazit jako tarif"
            name={`${ids}-tier`}
            value={tier}
            onChange={changeTier}
            className="md:w-[22rem]"
            options={pickerTiers.map((value) => ({
              value,
              label: (
                <>
                  {plans[value].name}
                  <span aria-hidden="true" className="ml-1.5 opacity-70">
                    {plans[value].maxWatchlist}
                  </span>
                  <span className="sr-only">
                    , {plans[value].maxWatchlist} míst
                    {plans[value].available ? "" : ", připravujeme"}
                  </span>
                </>
              ),
            }))}
          />
        </div>

        <div className="mt-6 border-t-2 border-ink pt-5">
          <SlotCounter limit={limit} taken={selection.length} />
          <p className="mt-3 font-display text-base font-bold text-ink" data-numeric>
            Obsazeno {Math.min(selection.length, limit)} z {limit}{" "}
            {plural(limit, ["místa", "míst", "míst"])}
            {over > 0 ? (
              <span className="font-semibold text-loss-ink">
                , {over} {plural(over, ["položka je", "položky jsou", "položek je"])} nad limit tarifu
              </span>
            ) : null}
          </p>

          {selection.length > 0 ? (
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Můj výběr">
              {selection.map((ticker, index) => {
                const item = known.get(ticker);
                const inactive = index >= limit;
                return (
                  <li key={ticker}>
                    <button
                      type="button"
                      onClick={() => toggle(ticker)}
                      className={`mech inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-ink px-3.5 font-display text-sm font-bold uppercase tracking-[0.06em] ${
                        inactive ? "border-dashed bg-cream text-mute" : "bg-salmon text-ink"
                      }`}
                    >
                      {ticker}
                      <span className="sr-only">
                        {item ? `, ${item.name}` : ""}
                        {inactive ? ", nad limit" : ""}. Odebrat z výběru
                      </span>
                      <CrossIcon />
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-2 text-[0.9375rem] leading-normal text-mute">
              Zatím nic nevybráno. Klikněte na dlaždici, nebo položku najděte
              podle tickeru.
            </p>
          )}

          <div aria-live="polite" className="empty:hidden">
            {notice && !notice.ok ? <LimitNotice tier={tier} check={notice} /> : null}
          </div>
        </div>
      </div>

      <p className="mt-6 flex flex-wrap items-center gap-3 text-[0.9375rem] leading-normal">
        <span className="inline-block -rotate-2 border-2 border-ink bg-salmon px-2.5 py-1 font-display text-[0.8125rem] font-bold uppercase leading-none tracking-[0.08em] text-ink">
          Ukázková data
        </span>
        Ceny a změny nejsou skutečné.
      </p>

      <p aria-live="polite" className="sr-only">
        {searching
          ? `${visible.length} ${plural(visible.length, ["výsledek", "výsledky", "výsledků"])}`
          : ""}
      </p>

      {visible.length > 0 ? (
        <ul
          ref={drawRef}
          className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-6 md:gap-6 lg:grid-cols-12"
        >
          {visible.map((item, index) => (
            <Tile
              key={item.ticker}
              item={item}
              featured={Boolean(featured) && index === 0}
              span={spanFor(index, visible.length, Boolean(featured))}
              selected={selection.includes(item.ticker)}
              analysisHref={item.quote && analysisLinks ? `#${analysisId(item.ticker)}` : undefined}
              onToggle={() => toggle(item.ticker)}
            />
          ))}
        </ul>
      ) : (
        <p className="mt-6 rounded-[var(--radius-tile)] border-3 border-dashed border-ink bg-paper px-6 py-8 text-lg">
          Pro „{query.trim()}“ jsme nic nenašli. Zkuste ticker, třeba AAPL, nebo
          část názvu.
        </p>
      )}
    </div>
  );
}

function Tile({
  item,
  featured,
  span,
  selected,
  analysisHref,
  onToggle,
}: {
  item: PickerItem;
  featured: boolean;
  span: string;
  selected: boolean;
  analysisHref?: string;
  onToggle: () => void;
}) {
  const quote = item.quote;
  const tone = selected
    ? "bg-salmon"
    : !quote
      ? "bg-paper"
      : item.kind === "index"
        ? "bg-mist"
        : "bg-sand";

  const state = selected ? "Ve výběru, odebrat." : "Přidat do výběru.";
  const label = quote
    ? `${item.name}, ${formatPercentChange(quote.change)}. ${state}`
    : `${item.name}, data zatím nejsou. ${state}`;

  return (
    <li
      data-selected={selected ? "" : undefined}
      className={`tile relative flex flex-col rounded-[var(--radius-tile)] border-3 border-ink ${tone} ${span} ${
        featured ? "p-5 md:p-8" : "p-4 md:p-5"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-label={label}
        className="tile-hit absolute inset-0 cursor-pointer rounded-[9px] focus-visible:outline-offset-[6px]"
      />

      <div aria-hidden="true" className="pointer-events-none relative flex h-full flex-col">
        {/* Na mobilu je malá dlaždice úzká, název proto jde pod ikonu,
            jinak by ho šipka v rohu ořízla. */}
        <div
          className={
            featured
              ? `flex items-start gap-3 ${analysisHref ? "pr-12" : ""}`
              : `flex flex-col gap-2 md:flex-row md:items-start md:gap-3 ${analysisHref ? "md:pr-12" : ""}`
          }
        >
          <SymbolIcon symbol={item} size={featured ? "lg" : "md"} />
          <div className="min-w-0">
            <p className="font-display text-[0.8125rem] font-semibold uppercase leading-tight tracking-[0.14em] text-ink">
              {item.ticker}
            </p>
            <p
              className={`font-display font-bold leading-tight text-ink ${
                featured ? "mt-1 text-[1.75rem] tracking-[-0.01em]" : "text-lg"
              }`}
            >
              {item.name}
            </p>
          </div>
        </div>

        {quote ? (
          <>
            <div
              className={`flex flex-wrap items-center justify-between gap-x-3 gap-y-2 ${
                featured ? "mt-6" : "mt-4"
              }`}
            >
              <span
                data-numeric
                className={`font-display font-bold text-ink ${
                  featured ? "text-[2rem] leading-none tracking-[-0.02em]" : "text-lg"
                }`}
              >
                {formatUsd(quote.price)}
              </span>
              <ChangeChip change={quote.change}>
                {featured ? <CountUp value={quote.change} /> : undefined}
              </ChangeChip>
            </div>
            <div className={featured ? "mt-6 flex flex-1 flex-col justify-end" : "mt-4"}>
              <Sparkline
                values={quote.history}
                strokeWidth={featured ? 3 : 2.5}
                className={featured ? "h-28 md:h-44" : "h-10"}
              />
              {featured ? (
                <p className="label-caps mt-3 text-ink">30 obchodních dní</p>
              ) : null}
            </div>
          </>
        ) : (
          <p className="mt-4 text-[0.9375rem] leading-normal text-ink">
            Data budou k dispozici po přidání do výběru.
          </p>
        )}
      </div>

      {analysisHref ? (
        <a
          href={analysisHref}
          aria-label={`Zobrazit analýzu: ${item.name}`}
          title="Analýza"
          className="absolute right-2.5 top-2.5 z-10 grid size-11 place-items-center rounded-[6px] border-2 border-ink bg-paper text-ink hover:bg-cream"
        >
          <ArrowDownIcon />
        </a>
      ) : null}

      {selected ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -left-3 -top-3 z-10 grid size-8 -rotate-6 place-items-center rounded-full border-2 border-ink bg-ink text-salmon"
        >
          <svg viewBox="0 0 16 16" width="16" height="16" focusable="false">
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
      ) : null}
    </li>
  );
}

function SlotCounter({ limit, taken }: { limit: number; taken: number }) {
  const size = limit <= 5 ? "size-7" : limit <= 25 ? "size-4" : "size-2.5";
  return (
    <div aria-hidden="true" className={`flex flex-wrap ${limit <= 5 ? "gap-2" : "gap-1"}`}>
      {Array.from({ length: limit }, (_, index) => (
        <span
          key={index}
          className={`${size} rounded-[3px] border-2 ${
            index < taken ? "border-salmon bg-ink" : "border-ink bg-paper"
          }`}
        />
      ))}
    </div>
  );
}

function LimitNotice({
  tier,
  check,
}: {
  tier: PickerTier;
  check: Extract<AddCheck, { ok: false }>;
}) {
  const current = plans[tier];
  const upgrade = check.upgrade ? plans[check.upgrade] : null;
  const places = (count: number) =>
    `${count} ${plural(count, ["místo", "místa", "míst"])}`;

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-[var(--radius-field)] border-3 border-ink bg-sand px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[0.9375rem] font-semibold leading-normal text-ink">
        Tarif {current.name} má {places(check.limit)} a všechna jsou obsazená.{" "}
        {upgrade
          ? upgrade.available
            ? `${upgrade.name} jich má ${upgrade.maxWatchlist}.`
            : `${upgrade.name}, který připravujeme, jich bude mít ${upgrade.maxWatchlist}.`
          : "Víc míst zatím žádný tarif nemá."}
      </p>
      <a
        href="#cenik"
        className="shrink-0 font-display text-sm font-bold uppercase tracking-[0.08em] text-ink underline underline-offset-4"
      >
        Porovnat tarify
      </a>
    </div>
  );
}

/**
 * Rozpětí dlaždic tak, aby žádná řada nekončila prázdnou buňkou.
 * Třídy jsou vypsané celé, jinak by je Tailwind při buildu nenašel.
 */
function spanFor(index: number, count: number, featured: boolean): string {
  if (featured && index === 0) return "col-span-2 md:col-span-6 lg:col-span-6 lg:row-span-2";

  const j = featured ? index - 1 : index;
  const m = featured ? count - 1 : count;
  const classes: string[] = [];

  if (m % 2 === 1 && j === m - 1) classes.push("col-span-2");

  const mdRest = m % 3;
  if (mdRest === 1 && j === m - 1) classes.push("md:col-span-6");
  else if (mdRest === 2 && j >= m - 2) classes.push("md:col-span-3");
  else classes.push("md:col-span-2");

  // Na počítači první čtyři dlaždice vyplní čtverec vedle hlavního indexu.
  const k = featured ? j - 4 : j;
  const r = featured ? m - 4 : m;
  const lgRest = r % 4;
  if (featured && j < 4) classes.push("lg:col-span-3");
  else if (lgRest === 1 && k === r - 1) classes.push("lg:col-span-12");
  else if (lgRest === 2 && k >= r - 2) classes.push("lg:col-span-6");
  else if (lgRest === 3 && k >= r - 3) classes.push("lg:col-span-4");
  else classes.push("lg:col-span-3");

  return classes.join(" ");
}

/*
 * Malé úložiště nad localStorage pro useSyncExternalStore. Když prohlížeč
 * úložiště nepovolí (soukromý režim, plný disk), výběr žije v paměti
 * a platí do obnovení stránky.
 */
const DEFAULT_STORED: Stored = { v: 1, tier: "start", selection: [] };
const memory = new Map<string, Stored>();
const snapshots = new Map<string, { raw: string | null; value: Stored }>();
const listeners = new Set<() => void>();

function subscribeStored(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function readStored(key: string): Stored {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    return memory.get(key) ?? DEFAULT_STORED;
  }
  // useSyncExternalStore chce pro stejná data stejný objekt.
  const cached = snapshots.get(key);
  if (cached && cached.raw === raw) return cached.value;
  const value = parseStored(raw) ?? memory.get(key) ?? DEFAULT_STORED;
  snapshots.set(key, { raw, value });
  return value;
}

function parseStored(raw: string | null): Stored | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Partial<Stored>;
    if (data.v !== 1) return null;
    const tier = pickerTiers.find((value) => value === data.tier) ?? "start";
    const selection = Array.isArray(data.selection)
      ? [
          ...new Set(
            data.selection.filter((ticker): ticker is string => typeof ticker === "string"),
          ),
        ].slice(0, MAX_STORED)
      : [];
    return { v: 1, tier, selection };
  } catch {
    return null;
  }
}

function writeStored(key: string, value: Stored) {
  memory.set(key, value);
  let raw: string | null = null;
  try {
    raw = JSON.stringify(value);
    window.localStorage.setItem(key, raw);
  } catch {
    try {
      raw = window.localStorage.getItem(key);
    } catch {
      raw = null;
    }
  }
  snapshots.set(key, { raw, value });
  listeners.forEach((listener) => listener());
}

function CrossIcon() {
  return (
    <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true" focusable="false">
      <path d="M2 2l8 8M10 2 2 10" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg viewBox="0 0 12 14" width="12" height="14" aria-hidden="true" focusable="false">
      <path
        d="M6 1v11M1.5 7.5 6 12l4.5-4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
