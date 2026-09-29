const MINUS = "−"; // skutečné minus, ne spojovník
const NBSP = " "; // pevná mezera před jednotkou

const percentFormatter = new Intl.NumberFormat("cs-CZ", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const priceFormatter = new Intl.NumberFormat("cs-CZ", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Intl vrací u záporných čísel spojovník. Zadání chce skutečné minus,
 * tak ho vyměníme až po formátování, ne ručním skládáním řetězce.
 */
function withRealMinus(value: string): string {
  return value.replace("-", MINUS);
}

/** Změna v procentech se znaménkem: "+1,84 %" nebo "−0,42 %". */
export function formatPercentChange(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${withRealMinus(percentFormatter.format(value))}${NBSP}%`;
}

/** Cena bez měny. Měnu doplňuje volající, protože se liší podle trhu. */
export function formatPrice(value: number): string {
  return withRealMinus(priceFormatter.format(value));
}

export type Direction = "up" | "down" | "flat";

export function directionOf(change: number): Direction {
  if (change > 0) return "up";
  if (change < 0) return "down";
  return "flat";
}
