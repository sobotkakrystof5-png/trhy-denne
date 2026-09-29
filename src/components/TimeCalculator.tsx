"use client";

import { useId, useState } from "react";
import { formatDecimal, plural } from "@/lib/format";

const TRADING_DAYS = 252;
const REPORT_MINUTES = 3;
const MIN = 10;
const MAX = 90;
const DEFAULT = 25;

const hoursPerYear = (minutes: number) => (minutes * TRADING_DAYS) / 60;
const hoursWord = (hours: number) => plural(hours, ["hodina", "hodiny", "hodin"]);

/**
 * Kalkulačka času. Server vykreslí výsledek pro výchozí hodnotu, takže
 * číslo je vidět i bez JavaScriptu. Nativní jezdec řeší klávesnici.
 */
export function TimeCalculator() {
  const id = useId();
  const [minutes, setMinutes] = useState(DEFAULT);
  const hours = hoursPerYear(minutes);
  const withReport = hoursPerYear(REPORT_MINUTES);

  return (
    <div className="rounded-[var(--radius-card)] border-3 border-ink bg-paper p-6 shadow-[var(--shadow-hard-lg)] md:p-9">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={`${id}-minutes`} className="font-display text-lg font-bold text-ink">
          Minut denně nad zprávami a grafy
        </label>
        <span data-numeric className="font-display text-2xl font-bold text-ink">
          {minutes}
        </span>
      </div>

      <input
        id={`${id}-minutes`}
        type="range"
        min={MIN}
        max={MAX}
        step={5}
        value={minutes}
        onChange={(event) => setMinutes(Number(event.target.value))}
        aria-valuetext={`${minutes} minut denně`}
        className="range mt-4"
      />
      <div aria-hidden="true" className="label-caps mt-2 flex justify-between">
        <span>{MIN} min</span>
        <span>{MAX} min</span>
      </div>

      <output
        htmlFor={`${id}-minutes`}
        aria-live="polite"
        className="mt-8 flex flex-wrap items-baseline gap-x-4 border-t-2 border-ink pt-7"
      >
        <span
          data-numeric
          className="font-display text-[clamp(3.5rem,9vw,6.5rem)] font-bold leading-none tracking-[-0.03em] text-ink"
        >
          {formatDecimal(hours)}
        </span>
        <span className="font-display text-2xl font-bold text-ink">
          {hoursWord(hours)} ročně
        </span>
      </output>

      <p className="mt-5 text-lg">
        S reportem je to {formatDecimal(withReport)} {hoursWord(withReport)} ročně.
      </p>
      <p className="mt-3 text-[0.9375rem] leading-normal text-mute">
        Počítáme s {TRADING_DAYS} obchodními dny v roce a třemi minutami na
        přečtení reportu.
      </p>
    </div>
  );
}
