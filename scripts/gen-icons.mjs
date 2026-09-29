/**
 * Vygeneruje src/data/icons.generated.ts z balíčku simple-icons.
 * Balíček je jen vývojová závislost, do prohlížeče jde jen pár cest SVG.
 *
 * Loga jsou ochranné známky svých vlastníků (viz Otevřené otázky), proto
 * je drží jediná komponenta SymbolIcon a dají se kdykoli vypnout.
 * Spuštění: node scripts/gen-icons.mjs
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import * as icons from "simple-icons";

// Ticker -> exportní název ikony. Co tu chybí, dostane monogram.
const map = {
  SPCX: "siSpacex",
  TSLA: "siTesla",
  AAPL: "siApple",
  NVDA: "siNvidia",
  GOOGL: "siGoogle",
  META: "siMeta",
  AVGO: "siBroadcom",
  NFLX: "siNetflix",
  AMD: "siAmd",
  PLTR: "siPalantir",
  V: "siVisa",
};

const entries = Object.entries(map).map(([ticker, key]) => {
  const icon = icons[key];
  if (!icon) throw new Error(`simple-icons nemá ${key} pro ${ticker}`);
  return `  ${JSON.stringify(ticker)}: { title: ${JSON.stringify(icon.title)}, path: ${JSON.stringify(icon.path)} },`;
});

const output = `// Vygenerováno skriptem scripts/gen-icons.mjs, ručně neupravovat.
// Zdroj: simple-icons (CC0). Loga jsou ochranné známky svých vlastníků.

export type IconData = { title: string; path: string };

export const symbolIcons: Record<string, IconData> = {
${entries.join("\n")}
};
`;

const target = fileURLToPath(new URL("../src/data/icons.generated.ts", import.meta.url));
writeFileSync(target, output);
console.log(`Zapsáno ${entries.length} ikon do ${target}`);
