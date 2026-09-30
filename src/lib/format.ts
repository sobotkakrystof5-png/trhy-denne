// Escape sekvence schválně: znaky samotné se při úpravách snadno
// potichu změní na spojovník a obyčejnou mezeru.
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

const decimalFormatter = new Intl.NumberFormat("cs-CZ", {
  maximumFractionDigits: 1,
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

/** Cena v dolarech po česku: "412,55 $". */
export function formatUsd(value: number): string {
  return `${formatPrice(value)}${NBSP}$`;
}

/** Číslo s nejvýš jedním desetinným místem: "105" nebo "12,6". */
export function formatDecimal(value: number): string {
  return decimalFormatter.format(value);
}

const dateFormatter = new Intl.DateTimeFormat("cs-CZ", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** Datum po česku: "14. října 2026". */
export function formatDate(value: Date): string {
  return dateFormatter.format(value);
}

export type Direction = "up" | "down" | "flat";

export function directionOf(change: number): Direction {
  if (change > 0) return "up";
  if (change < 0) return "down";
  return "flat";
}

/**
 * Česká množná čísla: [1, 2 až 4, 5 a víc]. Desetinná čísla berou
 * tvar pro 2 až 4 ("12,6 hodiny").
 */
export function plural(
  count: number,
  forms: readonly [one: string, few: string, many: string],
): string {
  if (!Number.isInteger(count)) return forms[1];
  const abs = Math.abs(count);
  if (abs === 1) return forms[0];
  if (abs >= 2 && abs <= 4) return forms[1];
  return forms[2];
}
