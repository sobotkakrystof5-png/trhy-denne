import "server-only";
import { neon, neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle as drizzleHttp } from "drizzle-orm/neon-http";
import { drizzle as drizzlePool, type NeonDatabase } from "drizzle-orm/neon-serverless";
import { env } from "@/lib/env";
import * as schema from "./schema";

/**
 * Dva ovladače podle AGENTS.md: HTTP na jednoduché dotazy (jeden požadavek,
 * žádné spojení), Pool přes WebSocket jen na transakce se zámkem.
 */

/**
 * Lokální vývoj: docker-compose.yml, proxy napodobuje Neon na portu 4444.
 * Návod Neonu používá db.localtest.me, ten ale některé DNS nepřeloží.
 * Proxy port z adresy ignoruje, jde vždy na svůj Postgres.
 */
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "db.localtest.me"]);

function connectionString(): string {
  const url = env().DATABASE_URL;
  if (!url) throw new DatabaseNotConfiguredError();
  if (LOCAL_HOSTS.has(new URL(url).hostname)) {
    neonConfig.fetchEndpoint = (host) => `http://${host}:4444/sql`;
    neonConfig.wsProxy = (host) => `${host}:4444/v2`;
    neonConfig.useSecureWebSocket = false;
    neonConfig.pipelineTLS = false;
    neonConfig.pipelineConnect = false;
  }
  return url;
}

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super("DATABASE_URL není nastavená.");
    this.name = "DatabaseNotConfiguredError";
  }
}

let httpDb: ReturnType<typeof createHttpDb> | null = null;

function createHttpDb() {
  return drizzleHttp({ client: neon(connectionString()), schema });
}

export function db() {
  httpDb ??= createHttpDb();
  return httpDb;
}

export type Tx = Parameters<Parameters<NeonDatabase<typeof schema>["transaction"]>[0]>[0];

/**
 * Transakce přes Pool. Spojení se otevře a zavře v rámci jednoho volání,
 * protože WebSocket v serverless funkci nesmí přežít požadavek.
 */
export async function withTransaction<T>(run: (tx: Tx) => Promise<T>): Promise<T> {
  const pool = new Pool({ connectionString: connectionString() });
  // Chyba nečinného spojení by jinak jako neodchycená událost shodila proces.
  pool.on("error", (error: Error) => console.error("[db] pool", error));
  try {
    return await drizzlePool({ client: pool, schema }).transaction(run);
  } finally {
    await pool.end();
  }
}

export { schema };
