/**
 * UKÁZKOVÁ DATA. Nejde o skutečné kurzy a web to musí říkat nahlas,
 * dokud není zapojené datové API (viz memory/memory.md, Otevřené otázky).
 * Hodnoty jsou deterministické, aby se web mezi buildy nehýbal.
 *
 * Jazykový model tato čísla nikdy nepřepisuje ani nedopočítává.
 */
export const SAMPLE_DATA_NOTICE = "Ukázková data";

export type TickerItem = {
  symbol: string;
  /** Změna v procentech za poslední uzavřený obchodní den. */
  change: number;
  kind: "stock" | "index";
};

export const sampleTicker: TickerItem[] = [
  { symbol: "SPY", change: 0.38, kind: "index" },
  { symbol: "QQQ", change: 0.71, kind: "index" },
  { symbol: "NVDA", change: 1.84, kind: "stock" },
  { symbol: "AAPL", change: -0.42, kind: "stock" },
  { symbol: "MSFT", change: 0.16, kind: "stock" },
  { symbol: "TSLA", change: -2.13, kind: "stock" },
  { symbol: "AMZN", change: 0.94, kind: "stock" },
  { symbol: "META", change: -0.57, kind: "stock" },
  { symbol: "GOOGL", change: 1.22, kind: "stock" },
  { symbol: "AMD", change: -1.06, kind: "stock" },
  { symbol: "AVGO", change: 2.41, kind: "stock" },
  { symbol: "NFLX", change: 0.0, kind: "stock" },
];
