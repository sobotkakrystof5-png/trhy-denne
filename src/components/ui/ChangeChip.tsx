import type { ReactNode } from "react";
import { directionOf, formatPercentChange } from "@/lib/format";

/**
 * Štítek změny. Barva sama význam nenese, vždy ji doprovází trojúhelník
 * a znaménko, aby to fungovalo i pro barvoslepé čtenáře a v tisku.
 *
 * `children` nahradí text, třeba komponentou CountUp. Barva a trojúhelník
 * se pořád řídí skutečnou hodnotou `change`.
 */
export function ChangeChip({
  change,
  children,
}: {
  change: number;
  children?: ReactNode;
}) {
  const direction = directionOf(change);
  const fill =
    direction === "up"
      ? "bg-mint"
      : direction === "down"
        ? "bg-rose"
        : "bg-paper";

  return (
    <span
      data-numeric
      className={`inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border-2 border-ink px-2.5 font-display text-sm font-bold leading-none text-ink ${fill}`}
    >
      {direction !== "flat" ? <Triangle up={direction === "up"} /> : null}
      {children ?? formatPercentChange(change)}
    </span>
  );
}

function Triangle({ up }: { up: boolean }) {
  return (
    <svg
      width="10"
      height="9"
      viewBox="0 0 10 9"
      aria-hidden="true"
      focusable="false"
      className={up ? "" : "rotate-180"}
    >
      <path d="M5 0 10 9H0Z" fill="currentColor" />
    </svg>
  );
}
