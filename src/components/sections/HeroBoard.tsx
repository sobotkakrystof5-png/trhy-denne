import { showcase } from "@/data/sample";
import { formatUsd } from "@/lib/format";
import { Sparkline } from "../Sparkline";
import { SymbolIcon } from "../SymbolIcon";
import { Badge } from "../ui/Badge";
import { ChangeChip } from "../ui/ChangeChip";

const BOARD = ["SPY", "SPCX", "TSLA", "NVDA", "BRK.B"];

/**
 * Tabule v rámu. Nejde o obrázek rozhraní, ale o tytéž komponenty a data,
 * jaké má dashboard níž. Proto nese i stejné označení ukázkových dat.
 */
export function HeroBoard() {
  const rows = BOARD.map((ticker) => showcase.find((item) => item.ticker === ticker)).filter(
    (item) => item !== undefined,
  );

  return (
    <figure className="overflow-hidden rounded-[var(--radius-frame)] border-3 border-ink bg-paper shadow-[var(--shadow-hard-lg)]">
      <figcaption className="flex items-center justify-between gap-4 border-b-3 border-ink bg-cream px-5 py-4 md:px-6">
        <span className="font-display text-xl font-bold text-ink">Dnešní přehled</span>
        <Badge tone="salmon">Ukázková data</Badge>
      </figcaption>

      <ul>
        {rows.map((item) => (
          <li
            key={item.ticker}
            className="hero-row grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-t-2 border-ink px-4 py-3.5 first:border-t-0 sm:grid-cols-[auto_minmax(0,1fr)_4.5rem_auto] sm:gap-4 md:px-6"
          >
            <SymbolIcon symbol={item} />
            <div className="min-w-0">
              <p className="truncate font-display text-lg font-bold leading-tight text-ink">
                {item.name}
              </p>
              <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-mute">
                {item.ticker}
              </p>
            </div>
            <div className="hidden sm:block">
              <Sparkline values={item.quote.history} className="h-8" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span data-numeric className="font-display text-[0.9375rem] font-semibold text-ink">
                {formatUsd(item.quote.price)}
              </span>
              <ChangeChip change={item.quote.change} />
            </div>
          </li>
        ))}
      </ul>
    </figure>
  );
}
