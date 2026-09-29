/**
 * Seed katalogu a vitríny z ukázkových dat (zadání, krok 14).
 * Spuštění: node scripts/seed.mts (Node 24 umí TypeScript bez sestavení).
 *
 * Opakovatelné: položky se aktualizují, vitrína se přepíše. Až poběží
 * W9, bude katalog obnovovat ono a tento skript zůstane jen pro vývoj.
 * plan_limits tu není, ta je v migraci 0002.
 */
import pg from "pg";
import { catalog, showcase } from "../src/data/sample.ts";

try {
  process.loadEnvFile(".env.local");
} catch {
  // proměnná může přijít z prostředí
}

const url = process.env.DATABASE_URL;
if (!url) throw new Error("Chybí DATABASE_URL.");

// SPY a QQQ jsou fondy, které indexy kopírují. Web je ukazuje jako indexy
// a říká to (otevřená otázka 3). V katalogu je pravda: etf.
const kindFor = (ticker: string, kind: string) =>
  ticker === "SPY" || ticker === "QQQ" ? "etf" : kind;

const rows = [
  ...showcase.map((item) => ({
    ticker: item.ticker,
    name: item.name,
    kind: kindFor(item.ticker, item.kind),
    sector: item.sector,
  })),
  ...catalog.map((item) => ({ ticker: item.ticker, name: item.name, kind: item.kind, sector: null })),
];

const client = new pg.Client({ connectionString: url });
await client.connect();
try {
  await client.query("begin");
  for (const row of rows) {
    await client.query(
      `insert into symbols (ticker, name, kind, sector, exchange, currency, active, updated_at)
       values ($1, $2, $3, $4, null, 'USD', true, now())
       on conflict (ticker) do update
       set name = excluded.name, kind = excluded.kind, sector = excluded.sector, updated_at = now()`,
      [row.ticker, row.name, row.kind, row.sector],
    );
  }
  await client.query("delete from showcase_symbols");
  for (const [position, item] of showcase.entries()) {
    await client.query("insert into showcase_symbols (ticker, position) values ($1, $2)", [
      item.ticker,
      position + 1,
    ]);
  }
  await client.query("commit");
  console.log(`Seed hotový: ${rows.length} položek v katalogu, ${showcase.length} ve vitríně.`);
} catch (error) {
  await client.query("rollback");
  throw error;
} finally {
  await client.end();
}
