"use client";

import Link from "next/link";
import {
  useEffect,
  useId,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
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
  defaultLimits,
  pickerTiers,
  plans,
  type AddCheck,
  type Limits,
  type PickerTier,
  type Tier,
} from "@/lib/plans";
import { analysisId, matches, monogramFor, uiKind, type PickerItem } from "@/lib/symbols";

type Stored = { v: 1; tier: PickerTier; selection: string[] };

const MAX_STORED = 100;

/**
 * Nástroj pro výběr položek ve dvou podobách se stejným vzhledem:
 *
 * - WatchlistPicker: ukázka na prodejní stránce, výběr žije jen
 *   v prohlížeči a tarif se dá přepínat,
 * - AccountWatchlist: účet, výběr je v databázi, tarif je skutečný
 *   a limit hlídá server v transakci. UI volá stejné checkAdd jen proto,
 *   aby zbytečně neposílalo požadavek, o kterém ví, že neprojde.
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
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState<AddCheck | null>(null);

  // Výběr žije v localStorage. Server o něm nic neví, proto při
  // hydrataci platí výchozí stav a uložený se načte hned po ní.
  const stored = useSyncExternalStore(
    subscribeStored,
    () => readStored(storageKey),
    () => DEFAULT_STORED,
  );

  const known = useKnown(items, catalog);
  const tier = stored.tier;
  const selection = useMemo(
    () => stored.selection.filter((ticker) => known.has(ticker)),
    [stored, known],
  );
  const setSelection = (next: string[]) =>
    writeStored(storageKey, { v: 1, tier, selection: next.slice(0, MAX_STORED) });

  const limit = defaultLimits[tier];

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

  return (
    <PickerView
      ids={ids}
      query={query}
      onQuery={setQuery}
      searching={searching}
      visible={visible}
      featuredTicker={featuredTicker}
      analysisLinks={analysisLinks}
      known={known}
      tier={tier}
      limit={limit}
      selection={selection}
      isInactive={(_, index) => index >= limit}
      activeCount={Math.min(selection.length, limit)}
      notice={notice}
      onToggle={toggle}
      tierControl={
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
      }
    />
  );
}

export type AccountEntry = { ticker: string; active: boolean };

type SearchHit = { ticker: string; name: string; kind: string; hasData: boolean };

export function AccountWatchlist({
  items,
  selectedInfo,
  tier,
  limits,
  initial,
  paymentsLive,
}: {
  /** Vitrína s ukázkovými daty. */
  items: ShowcaseSymbol[];
  /** Názvy položek z výběru, které ve vitríně nejsou. */
  selectedInfo: SymbolInfo[];
  tier: Tier;
  /** Z tabulky plan_limits. */
  limits: Limits;
  initial: AccountEntry[];
  /** Běží platby? Rozhoduje, jestli upozornění na limit smí nabídnout přechod. */
  paymentsLive: boolean;
}) {
  const ids = useId();
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState<AddCheck | null>(null);
  const [entries, setEntries] = useState(initial);
  const [pending, setPending] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [results, setResults] = useState<{ q: string; items: PickerItem[] } | null>(null);
  const [seen, setSeen] = useState<PickerItem[]>([]);

  const extra = useMemo(() => [...selectedInfo, ...seen], [selectedInfo, seen]);
  const known = useKnown(items, extra);
  const limit = limits[tier];
  const selection = entries.map((entry) => entry.ticker);
  const inactive = new Set(entries.filter((entry) => !entry.active).map((entry) => entry.ticker));
  const activeCount = entries.length - inactive.size;

  // Katalog má tisíce položek, hledá se na serveru. Výsledek se váže
  // k dotazu, takže starší odpověď nepřepíše novější.
  const trimmed = query.trim();
  useEffect(() => {
    if (!trimmed) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/symbols/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(String(response.status));
        const data = (await response.json()) as { items: SearchHit[] };
        const found = data.items.map((hit): PickerItem => {
          const showcaseItem = items.find((item) => item.ticker === hit.ticker);
          return (
            showcaseItem ?? {
              ticker: hit.ticker,
              name: hit.name,
              kind: uiKind(hit.kind),
              monogram: monogramFor(hit.ticker),
            }
          );
        });
        setResults({ q: trimmed, items: found });
        setSeen((previous) => [...previous, ...found].slice(-200));
      } catch (error) {
        if (!controller.signal.aborted) {
          setResults({ q: trimmed, items: [] });
          setFailure("Hledání teď nefunguje. Zkuste to za chvíli znovu.");
          console.error(error);
        }
      }
    }, 200);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed, items]);

  const searching = trimmed.length > 0;
  const visible = searching ? (results?.q === trimmed ? results.items : null) : items;

  const toggle = async (ticker: string) => {
    if (pending) return;
    const selected = selection.includes(ticker);
    if (!selected) {
      const check = checkAdd(activeCount, tier, limits);
      if (!check.ok) {
        setNotice(check);
        return;
      }
    }

    setPending(ticker);
    setFailure(null);
    try {
      const response = await fetch("/api/watchlist", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ op: selected ? "remove" : "add", ticker }),
      });
      const data = (await response.json().catch(() => null)) as {
        items?: AccountEntry[];
        limit?: number;
        upgrade?: Tier | null;
      } | null;
      if (data?.items) setEntries(data.items);

      if (response.ok) setNotice(null);
      else if (response.status === 409 && data)
        setNotice({ ok: false, limit: data.limit ?? limit, upgrade: data.upgrade ?? null });
      else if (response.status === 401)
        setFailure("Přihlášení vypršelo. Obnovte stránku a přihlaste se znovu.");
      else if (response.status === 429)
        setFailure("Změn bylo za chvíli moc. Počkejte minutu a zkuste to znovu.");
      else setFailure("Změnu se nepodařilo uložit. Zkuste to znovu.");
    } catch {
      setFailure("Spojení se serverem se nepovedlo. Zkontrolujte připojení a zkuste to znovu.");
    } finally {
      setPending(null);
    }
  };

  return (
    <PickerView
      ids={ids}
      query={query}
      onQuery={(value) => {
        setQuery(value);
        setFailure(null);
      }}
      searching={searching}
      visible={visible}
      featuredTicker={undefined}
      analysisLinks={false}
      known={known}
      tier={tier}
      limit={limit}
      selection={selection}
      isInactive={(ticker) => inactive.has(ticker)}
      activeCount={activeCount}
      notice={notice}
      failure={failure}
      pending={pending}
      onToggle={toggle}
      account
      paymentsLive={paymentsLive}
      tierControl={
        <div className="md:w-[22rem]">
          <p className="mb-2 font-display text-[0.9375rem] font-bold text-ink">Váš tarif</p>
          <p className="flex h-14 items-center rounded-[var(--radius-field)] border-3 border-ink bg-cream px-5 font-display text-lg font-bold text-ink">
            {plans[tier].name}
            <span className="ml-2 font-semibold text-mute" data-numeric>
              {limit > 0 ? `${limit} ${plural(limit, ["místo", "místa", "míst"])}` : "bez vlastního výběru"}
            </span>
          </p>
        </div>
      }
    />
  );
}

function useKnown(items: PickerItem[], extra: PickerItem[]) {
  return useMemo(() => {
    const map = new Map<string, PickerItem>();
    for (const item of extra) map.set(item.ticker, item);
    for (const item of items) map.set(item.ticker, item);
    return map;
  }, [items, extra]);
}

function PickerView({
  ids,
  query,
  onQuery,
  searching,
  visible,
  featuredTicker,
  analysisLinks,
  known,
  tier,
  limit,
  selection,
  isInactive,
  activeCount,
  notice,
  failure = null,
  pending = null,
  onToggle,
  tierControl,
  account = false,
  paymentsLive = false,
}: {
  ids: string;
  query: string;
  onQuery: (value: string) => void;
  searching: boolean;
  /** null = výsledky hledání se teprve načítají. */
  visible: PickerItem[] | null;
  featuredTicker?: string;
  analysisLinks: boolean;
  known: Map<string, PickerItem>;
  tier: Tier;
  limit: number;
  selection: string[];
  isInactive: (ticker: string, index: number) => boolean;
  activeCount: number;
  notice: AddCheck | null;
  failure?: string | null;
  pending?: string | null;
  onToggle: (ticker: string) => void;
  tierControl: ReactNode;
  account?: boolean;
  paymentsLive?: boolean;
}) {
  const drawRef = useDrawOnView<HTMLUListElement>();
  const over = selection.length - activeCount;

  const featured =
    !searching &&
    featuredTicker &&
    visible?.[0]?.ticker === featuredTicker &&
    visible.length >= 5;

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
              maxLength={40}
              placeholder="třeba NVDA nebo Tesla"
              value={query}
              onChange={(event) => onQuery(event.target.value)}
              className="h-14 w-full rounded-[var(--radius-field)] border-3 border-ink bg-cream px-5 text-lg text-ink placeholder:text-mute focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink"
            />
          </div>
          {tierControl}
        </div>

        <div className="mt-6 border-t-2 border-ink pt-5">
          {limit > 0 ? (
            <>
              <SlotCounter limit={limit} taken={activeCount} />
              <p className="mt-3 font-display text-base font-bold text-ink" data-numeric>
                Obsazeno {activeCount} z {limit}{" "}
                {plural(limit, ["místa", "míst", "míst"])}
                {over > 0 ? (
                  <span className="font-semibold text-loss-ink">
                    , {over} {plural(over, ["položka je", "položky jsou", "položek je"])} nad limit tarifu
                  </span>
                ) : null}
              </p>
            </>
          ) : (
            <p className="font-display text-base font-bold text-ink">
              Tarif {plans[tier].name} vlastní výběr nemá. Každou neděli dostáváte
              tři největší pohyby týdne.
            </p>
          )}

          {selection.length > 0 ? (
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Můj výběr">
              {selection.map((ticker, index) => {
                const item = known.get(ticker);
                const inactive = isInactive(ticker, index);
                return (
                  <li key={ticker}>
                    <button
                      type="button"
                      onClick={() => onToggle(ticker)}
                      disabled={pending === ticker}
                      className={`mech inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-ink px-3.5 font-display text-sm font-bold uppercase tracking-[0.06em] disabled:opacity-50 ${
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
          ) : limit > 0 ? (
            <p className="mt-2 text-[0.9375rem] leading-normal text-mute">
              Zatím nic nevybráno. Klikněte na dlaždici, nebo položku najděte
              podle tickeru.
            </p>
          ) : null}

          <div aria-live="polite" className="empty:hidden">
            {notice && !notice.ok ? (
              <LimitNotice
                tier={tier}
                check={notice}
                account={account}
                paymentsLive={paymentsLive}
              />
            ) : failure ? (
              <p className="mt-4 rounded-[var(--radius-field)] border-3 border-loss-ink bg-paper px-5 py-4 text-[0.9375rem] font-semibold leading-normal text-loss-ink">
                {failure}
              </p>
            ) : null}
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
          ? visible
            ? `${visible.length} ${plural(visible.length, ["výsledek", "výsledky", "výsledků"])}`
            : "Hledám"
          : ""}
      </p>

      {visible === null ? (
        <p className="mt-6 rounded-[var(--radius-tile)] border-3 border-dashed border-ink bg-paper px-6 py-8 text-lg text-mute">
          Hledám „{query.trim()}“.
        </p>
      ) : visible.length > 0 ? (
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
              busy={pending === item.ticker}
              analysisHref={item.quote && analysisLinks ? `#${analysisId(item.ticker)}` : undefined}
              onToggle={() => onToggle(item.ticker)}
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
  busy,
  analysisHref,
  onToggle,
}: {
  item: PickerItem;
  featured: boolean;
  span: string;
  selected: boolean;
  busy: boolean;
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
      aria-busy={busy || undefined}
      className={`tile relative flex flex-col rounded-[var(--radius-tile)] border-3 border-ink ${tone} ${span} ${
        featured ? "p-5 md:p-8" : "p-4 md:p-5"
      } ${busy ? "opacity-60" : ""}`}
    >
      <button
        type="button"
        onClick={onToggle}
        disabled={busy}
        aria-label={label}
        className="tile-hit absolute inset-0 cursor-pointer rounded-[9px] focus-visible:outline-offset-[6px] disabled:cursor-wait"
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
  account,
  paymentsLive,
}: {
  tier: Tier;
  check: Extract<AddCheck, { ok: false }>;
  account: boolean;
  paymentsLive: boolean;
}) {
  const current = plans[tier];
  const upgrade = check.upgrade ? plans[check.upgrade] : null;
  const places = (count: number) =>
    `${count} ${plural(count, ["místo", "místa", "míst"])}`;

  const situation =
    check.limit === 0
      ? `Tarif ${current.name} vlastní výběr nemá.`
      : `Tarif ${current.name} má ${places(check.limit)} a všechna jsou obsazená.`;
  // "jich" se smí vztahovat jen k místům, která předchozí věta zmínila.
  // U Free žádná nezmínila, proto celé "5 míst".
  const offer = !upgrade
    ? "Víc míst zatím žádný tarif nemá."
    : check.limit === 0
      ? upgrade.available
        ? `${upgrade.name} má ${places(upgrade.maxWatchlist)}.`
        : `${upgrade.name}, který připravujeme, bude mít ${places(upgrade.maxWatchlist)}.`
      : upgrade.available
        ? `${upgrade.name} jich má ${upgrade.maxWatchlist}.`
        : `${upgrade.name}, který připravujeme, jich bude mít ${upgrade.maxWatchlist}.`;

  // V účtu se dá tarif změnit jen tehdy, když platby opravdu běží.
  const canUpgradeHere = account && paymentsLive && Boolean(upgrade?.available);

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-[var(--radius-field)] border-3 border-ink bg-sand px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[0.9375rem] font-semibold leading-normal text-ink">
        {situation} {offer}
        {account && upgrade && !paymentsLive ? " Placené tarify zatím nespouštíme." : ""}
      </p>
      <Link
        href={canUpgradeHere ? "#tarif" : "/#cenik"}
        className="shrink-0 font-display text-sm font-bold uppercase tracking-[0.08em] text-ink underline underline-offset-4"
      >
        {canUpgradeHere ? "Změnit tarif" : "Porovnat tarify"}
      </Link>
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
