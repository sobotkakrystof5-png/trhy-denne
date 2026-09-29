/**
 * UKÁZKOVÁ DATA. Nejde o skutečné kurzy a web to musí říkat nahlas,
 * dokud není zapojené datové API (viz memory/memory.md, Otevřené otázky).
 *
 * Ceny a změny jsou zvolené ručně, křivky se generují deterministicky
 * ze semínka podle tickeru. Server i prohlížeč tak dostanou totéž.
 * Jazykový model tato čísla nikdy nepřepisuje ani nedopočítává.
 *
 * Popisy firem jsou stálá fakta, ne denní zprávy. Ukázková data nesmí
 * tvrdit nic o příčinách pohybu skutečných firem.
 *
 * Seznam vitríny patří ve fázi 3 do tabulky showcase_symbols.
 */
export const SAMPLE_DATA_NOTICE = "Ukázková data";
export const SAMPLE_DATA_SENTENCE =
  "Ukázková data. Ceny a změny nejsou skutečné.";

export type SymbolKind = "stock" | "index";

export type Quote = {
  /** Poslední uzavírací cena v USD. */
  price: number;
  /** Změna v procentech za poslední uzavřený obchodní den. */
  change: number;
  /** 30 uzavíracích cen, poslední je `price`. */
  history: number[];
};

export type SymbolInfo = {
  ticker: string;
  name: string;
  kind: SymbolKind;
  /** Text do kroužku, když ikona chybí nebo jde o index. */
  monogram: string;
};

export type ShowcaseSymbol = SymbolInfo & {
  sector: string;
  description: string;
  quote: Quote;
};

type Seed = Omit<ShowcaseSymbol, "quote"> & {
  price: number;
  change: number;
  /** Denní rozptyl náhodné procházky, jen aby křivky nevypadaly stejně. */
  volatility: number;
};

const seeds: Seed[] = [
  {
    ticker: "SPY",
    name: "S&P 500",
    kind: "index",
    monogram: "SPX",
    sector: "Široký trh",
    description:
      "Index 500 velkých amerických firem vážený tržní hodnotou. Zatím ho ukazujeme přes fond SPY, který index kopíruje. Cena fondu je jiné číslo než hodnota indexu.",
    price: 668.41,
    change: 0.38,
    volatility: 0.007,
  },
  {
    ticker: "QQQ",
    name: "Nasdaq-100",
    kind: "index",
    monogram: "NDX",
    sector: "100 nefinančních firem",
    description:
      "Index sta největších nefinančních firem obchodovaných na burze Nasdaq. Zatím ho ukazujeme přes fond QQQ, jeho cena je jiné číslo než hodnota indexu.",
    price: 596.12,
    change: 0.71,
    volatility: 0.01,
  },
  {
    ticker: "SPCX",
    name: "SpaceX",
    kind: "stock",
    monogram: "SPCX",
    sector: "Kosmonautika",
    description:
      "Vyvíjí a provozuje rakety Falcon 9 a Falcon Heavy, kosmické lodě Dragon a satelitní internet Starlink.",
    price: 142.3,
    change: 2.87,
    volatility: 0.028,
  },
  {
    ticker: "TSLA",
    name: "Tesla",
    kind: "stock",
    monogram: "TSLA",
    sector: "Automobily",
    description:
      "Vyrábí elektromobily, bateriová úložiště energie a solární systémy.",
    price: 412.55,
    change: -3.18,
    volatility: 0.03,
  },
  {
    ticker: "BRK.B",
    name: "Berkshire Hathaway",
    kind: "stock",
    monogram: "BRK",
    sector: "Finance",
    description:
      "Holding, který vlastní pojišťovny, železnici BNSF, energetické firmy a desítky dalších podniků. Drží také velké podíly v kótovaných firmách.",
    price: 491.2,
    change: 0.12,
    volatility: 0.007,
  },
  {
    ticker: "AAPL",
    name: "Apple",
    kind: "stock",
    monogram: "AAPL",
    sector: "Technologie",
    description:
      "Navrhuje iPhone, Mac, iPad a hodinky Apple Watch a provozuje služby jako App Store, iCloud a Apple Music.",
    price: 254.63,
    change: -0.42,
    volatility: 0.012,
  },
  {
    ticker: "MSFT",
    name: "Microsoft",
    kind: "stock",
    monogram: "MS",
    sector: "Technologie",
    description:
      "Vyvíjí Windows a kancelářský balík Microsoft 365, provozuje cloud Azure a vlastní herní divizi Xbox a síť LinkedIn.",
    price: 511.47,
    change: 0.16,
    volatility: 0.011,
  },
  {
    ticker: "NVDA",
    name: "NVIDIA",
    kind: "stock",
    monogram: "NVDA",
    sector: "Polovodiče",
    description:
      "Navrhuje grafické procesory a čipy pro datová centra, na kterých běží trénování a provoz umělé inteligence.",
    price: 183.92,
    change: 1.84,
    volatility: 0.021,
  },
  {
    ticker: "AMZN",
    name: "Amazon",
    kind: "stock",
    monogram: "AMZ",
    sector: "Obchod a cloud",
    description:
      "Provozuje internetový obchod a cloudovou platformu Amazon Web Services. Patří mu také předplatné Prime a reklamní byznys.",
    price: 229.41,
    change: 0.94,
    volatility: 0.015,
  },
  {
    ticker: "GOOGL",
    name: "Alphabet",
    kind: "stock",
    monogram: "GOOG",
    sector: "Internet a reklama",
    description:
      "Mateřská firma Googlu. Vlastní vyhledávač, YouTube, operační systém Android a službu Google Cloud.",
    price: 246.1,
    change: 1.22,
    volatility: 0.015,
  },
  {
    ticker: "META",
    name: "Meta Platforms",
    kind: "stock",
    monogram: "META",
    sector: "Internet a reklama",
    description:
      "Provozuje Facebook, Instagram, WhatsApp a Messenger a vyvíjí headsety pro virtuální realitu.",
    price: 742.85,
    change: -0.57,
    volatility: 0.017,
  },
  {
    ticker: "AVGO",
    name: "Broadcom",
    kind: "stock",
    monogram: "AVGO",
    sector: "Polovodiče",
    description:
      "Navrhuje polovodiče pro sítě, datová centra a telefony a prodává podnikový software, mimo jiné VMware.",
    price: 341.76,
    change: 2.41,
    volatility: 0.021,
  },
  {
    ticker: "NFLX",
    name: "Netflix",
    kind: "stock",
    monogram: "NFLX",
    sector: "Média",
    description:
      "Streamovací služba s filmy, seriály a vlastní tvorbou, dostupná ve většině zemí světa.",
    price: 1204.3,
    change: 0,
    volatility: 0.016,
  },
  {
    ticker: "AMD",
    name: "AMD",
    kind: "stock",
    monogram: "AMD",
    sector: "Polovodiče",
    description:
      "Navrhuje procesory Ryzen a EPYC, grafické karty Radeon a akcelerátory pro datová centra.",
    price: 163.08,
    change: 3.41,
    volatility: 0.026,
  },
  {
    ticker: "PLTR",
    name: "Palantir",
    kind: "stock",
    monogram: "PLTR",
    sector: "Software",
    description:
      "Vyvíjí software pro analýzu velkých objemů dat. Mezi zákazníky má vládní instituce i soukromé firmy.",
    price: 178.54,
    change: 4.62,
    volatility: 0.031,
  },
  {
    ticker: "JPM",
    name: "JPMorgan Chase",
    kind: "stock",
    monogram: "JPM",
    sector: "Banky",
    description:
      "Největší americká banka podle aktiv. Zahrnuje retailové bankovnictví Chase, investiční bankovnictví a správu majetku.",
    price: 309.66,
    change: -0.28,
    volatility: 0.01,
  },
  {
    ticker: "V",
    name: "Visa",
    kind: "stock",
    monogram: "V",
    sector: "Platby",
    description:
      "Provozuje platební síť, přes kterou banky vydávají karty a obchodníci přijímají platby. Sama úvěry neposkytuje.",
    price: 343.19,
    change: 0.33,
    volatility: 0.009,
  },
  {
    ticker: "LLY",
    name: "Eli Lilly",
    kind: "stock",
    monogram: "LLY",
    sector: "Farmacie",
    description:
      "Farmaceutická firma. Vyrábí léky na cukrovku a obezitu, onkologické přípravky a léky na imunitní onemocnění.",
    price: 812.4,
    change: -1.74,
    volatility: 0.016,
  },
  {
    ticker: "WMT",
    name: "Walmart",
    kind: "stock",
    monogram: "WMT",
    sector: "Maloobchod",
    description:
      "Provozuje síť hypermarketů, velkoobchodní kluby Sam's Club a internetový obchod.",
    price: 102.88,
    change: 0.51,
    volatility: 0.009,
  },
  {
    ticker: "XOM",
    name: "Exxon Mobil",
    kind: "stock",
    monogram: "XOM",
    sector: "Energetika",
    description:
      "Těží ropu a zemní plyn, zpracovává je v rafineriích a vyrábí petrochemické produkty.",
    price: 113.27,
    change: -0.93,
    volatility: 0.012,
  },
];

const HISTORY_DAYS = 30;

/** Malý deterministický generátor (mulberry32). */
function mulberry32(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

const round2 = (value: number) => Math.round(value * 100) / 100;

/**
 * Náhodná procházka se přeškáluje tak, aby předposlední bod byl
 * předchozí uzavírací cena a poslední bod aktuální cena. Změna na
 * štítku a sklon konce křivky si tak nikdy neodporují.
 */
function buildHistory(seed: Seed): number[] {
  const random = mulberry32(hashString(seed.ticker));
  const walk = [1];
  for (let i = 1; i < HISTORY_DAYS - 1; i++) {
    // Součet dvou rovnoměrných čísel dá měkčí rozdělení bez extrémů.
    const shock = (random() + random() - 1) * seed.volatility * 1.6;
    walk.push(walk[i - 1] * (1 + shock));
  }
  const previousClose = seed.price / (1 + seed.change / 100);
  const scale = previousClose / walk[walk.length - 1];
  return [...walk.map((point) => round2(point * scale)), seed.price];
}

export const showcase: ShowcaseSymbol[] = seeds.map(
  ({ price, change, volatility, ...info }) => ({
    ...info,
    quote: {
      price,
      change,
      history: buildHistory({ ...info, price, change, volatility }),
    },
  }),
);

/**
 * Katalog mimo vitrínu. Pro tyto položky ukázková data nejsou, stejně
 * jako na ostrém webu nebudou čerstvá data pro nic, co nikdo nesleduje.
 * Ve fázi 3 tento seznam nahradí tabulka symbols.
 */
export const catalog: SymbolInfo[] = [
  ["KO", "Coca-Cola"],
  ["PEP", "PepsiCo"],
  ["MCD", "McDonald's"],
  ["DIS", "Walt Disney"],
  ["NKE", "Nike"],
  ["INTC", "Intel"],
  ["ORCL", "Oracle"],
  ["CRM", "Salesforce"],
  ["ADBE", "Adobe"],
  ["CSCO", "Cisco Systems"],
  ["IBM", "IBM"],
  ["QCOM", "Qualcomm"],
  ["PFE", "Pfizer"],
  ["JNJ", "Johnson & Johnson"],
  ["UNH", "UnitedHealth Group"],
  ["MRK", "Merck & Co."],
  ["BAC", "Bank of America"],
  ["GS", "Goldman Sachs"],
  ["MS", "Morgan Stanley"],
  ["MA", "Mastercard"],
  ["PYPL", "PayPal"],
  ["COST", "Costco"],
  ["HD", "Home Depot"],
  ["SBUX", "Starbucks"],
  ["BA", "Boeing"],
  ["CAT", "Caterpillar"],
  ["CVX", "Chevron"],
  ["UBER", "Uber Technologies"],
  ["T", "AT&T"],
  ["VZ", "Verizon"],
].map(([ticker, name]) => ({
  ticker,
  name,
  kind: "stock" as const,
  // Stejné pravidlo jako monogramFor v lib/symbols.ts. Tento soubor nic
  // neimportuje, aby ho mohl číst i seed (node scripts/seed.mts).
  monogram: ticker.length > 3 ? ticker.slice(0, 2) : ticker,
}));

export type TickerItem = Pick<SymbolInfo, "ticker" | "kind"> & {
  change: number;
};

/** Kurzovní pás bere stejná čísla jako dashboard, aby si web neodporoval. */
export const sampleTicker: TickerItem[] = showcase.map((item) => ({
  ticker: item.ticker,
  kind: item.kind,
  change: item.quote.change,
}));
