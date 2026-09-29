import { defineConfig } from "drizzle-kit";

// drizzle-kit sám .env.local nenačte. Na Vercelu a v CI proměnná přijde z prostředí.
try {
  process.loadEnvFile(".env.local");
} catch {
  // soubor nemusí existovat
}

if (!process.env.DATABASE_URL) {
  throw new Error("Chybí DATABASE_URL (viz .env.example).");
}

/**
 * Migrace jdou přes ovladač pg (vývojová závislost) přímým spojením,
 * lokálně i proti Neonu. Aplikace sama používá @neondatabase/serverless.
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL },
  strict: true,
  verbose: true,
});
