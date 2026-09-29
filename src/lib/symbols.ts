import type { Quote, SymbolInfo } from "@/data/sample";

/** Položka pro výběr. Bez `quote` pro ni zatím nejsou čerstvá data. */
export type PickerItem = SymbolInfo & { quote?: Quote };

/** Bez diakritiky a velikosti písmen, aby "nvidia" našlo "NVIDIA". */
export function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

/**
 * Hledání v katalogu. Ticker se porovnává od začátku, název kdekoli.
 * Ve fázi 3 to převezme GET /api/symbols/search nad trigramovým indexem.
 */
export function matches(item: SymbolInfo, query: string): boolean {
  const needle = normalize(query);
  if (!needle) return true;
  return (
    normalize(item.ticker).startsWith(needle) ||
    normalize(item.name).includes(needle)
  );
}

export const ANALYSIS_PREFIX = "analyza-";

/** Id řádku analýzy. Dashboard na něj odkazuje obyčejnou kotvou. */
export function analysisId(ticker: string): string {
  return `${ANALYSIS_PREFIX}${ticker.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}
