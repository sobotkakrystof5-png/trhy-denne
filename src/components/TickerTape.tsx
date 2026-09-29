import { directionOf, formatPercentChange } from "@/lib/format";
import { SAMPLE_DATA_NOTICE, sampleTicker, type TickerItem } from "@/data/sample";
import { TickerTrack } from "./TickerTrack";

/**
 * Kurzovní pás pod hlavičkou. Je to podpisový prvek webu, ne ozdoba:
 * běží, protože běží kurzy. Kdyby přestal nést data, patří pryč.
 *
 * Pás není odkaz a pro čtečky se vykresluje jako skrytý seznam, aby
 * nemusely procházet zdvojený běžící řetěz.
 */
export function TickerTape({ items = sampleTicker }: { items?: TickerItem[] }) {
  return (
    <section
      aria-label="Přehled změn za poslední uzavřený obchodní den"
      className="relative flex h-11 border-y-3 border-ink bg-cream"
    >
      <p className="sr-only">
        {SAMPLE_DATA_NOTICE}. Změny za poslední uzavřený obchodní den:{" "}
        {items
          .map((item) => `${item.symbol} ${formatPercentChange(item.change)}`)
          .join(", ")}
        .
      </p>

      {/* Štítek stojí, protože to je varování, ne obsah pásu. Na mobilu
          se zkracuje, jinak by sežral třetinu šířky. Plné znění přečte
          čtečka ze skrytého odstavce výše, proto je tady aria-hidden. */}
      <p
        aria-hidden="true"
        className="z-10 flex shrink-0 items-center border-r-3 border-ink bg-salmon px-2.5 font-display text-[0.6875rem] font-bold uppercase tracking-[0.1em] leading-none text-ink sm:px-3 sm:text-[0.8125rem] sm:tracking-[0.12em]"
      >
        <span className="sm:hidden">Ukázka</span>
        <span className="hidden sm:inline">{SAMPLE_DATA_NOTICE}</span>
      </p>

      <div
        className="ticker-viewport relative flex-1"
        aria-hidden="true"
      >
        <TickerTrack>
          <TickerChain items={items} />
          <TickerChain items={items} />
        </TickerTrack>
      </div>
    </section>
  );
}

function TickerChain({ items }: { items: TickerItem[] }) {
  return (
    <div className="flex items-center">
      {items.map((item, index) => (
        <div key={`${item.symbol}-${index}`} className="flex items-center">
          <TickerEntry item={item} />
          <Diamond />
        </div>
      ))}
    </div>
  );
}

function TickerEntry({ item }: { item: TickerItem }) {
  const direction = directionOf(item.change);
  const tone =
    direction === "up"
      ? "text-gain-ink"
      : direction === "down"
        ? "text-loss-ink"
        : "text-mute";

  return (
    <p
      data-numeric
      className="flex items-center gap-2 whitespace-nowrap px-4 font-display text-sm font-semibold uppercase tracking-[0.08em] leading-none"
    >
      <span className="text-ink">{item.symbol}</span>
      <span className={tone}>{formatPercentChange(item.change)}</span>
      {direction !== "flat" ? (
        <span className={tone}>{direction === "up" ? "▲" : "▼"}</span>
      ) : null}
    </p>
  );
}

/** Kosočtverec. Svislé linky mezi položkami jsem vypustil, viz sebekritika. */
function Diamond() {
  return <span className="size-1.5 rotate-45 bg-rule" />;
}
