/**
 * Schéma databáze. Odvozené z SQL v PROJECT-BRIEF.md, sekce 5.2.
 * Odchylky od zadání jsou zapsané v memory/memory.md (fáze 3):
 *
 * - `users` nese navíc sloupce, které vyžaduje Better Auth (name,
 *   email_verified, image, updated_at). Přihlášení čte tutéž tabulku,
 *   žádná druhá tabulka uživatelů nevzniká.
 * - `users.requested_tier`: web slibuje "poznamenáme si zájem o tarif".
 * - `sessions`, `accounts`, `verifications`: tabulky Better Auth.
 * - `rate_limits`: omezení počtu požadavků bez další služby.
 *
 * Migrace dělá jen drizzle-kit (npx drizzle-kit generate, migrate).
 */
import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  inet,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

const timestamptz = (name: string) => timestamp(name, { withTimezone: true });

/** Limity a chování podle tarifu. Jediné místo pravdy pro UI i server. */
export const planLimits = pgTable("plan_limits", {
  tier: text("tier").primaryKey(),
  maxWatchlist: integer("max_watchlist").notNull(),
  reportsPerDay: integer("reports_per_day").notNull(),
  /** NULL znamená celý archiv. */
  archiveDays: integer("archive_days"),
  moveThresholdPct: numeric("move_threshold_pct").notNull().default("3.0"),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** Vyžaduje Better Auth. Jméno nesbíráme, zůstává prázdné. */
  name: text("name").notNull().default(""),
  /** Vždy malými písmeny. */
  email: text("email").notNull().unique(),
  /** Better Auth: adresa prokázaná odkazem (potvrzení nebo přihlášení). */
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  /** Double opt-in. Do potvrzení se nic neposílá. */
  emailConfirmedAt: timestamptz("email_confirmed_at"),
  consentAt: timestamptz("consent_at"),
  consentIp: inet("consent_ip"),
  consentTextVersion: text("consent_text_version"),
  /** Souhlas s okamžitým poskytnutím digitálního obsahu (fáze 4). */
  digitalContentWaiverAt: timestamptz("digital_content_waiver_at"),
  stripeCustomerId: text("stripe_customer_id").unique(),
  tier: text("tier")
    .notNull()
    .default("free")
    .references(() => planLimits.tier),
  /** Tarif, o který projevil zájem ve formuláři, dokud platby neběží. */
  requestedTier: text("requested_tier").references(() => planLimits.tier),
  /** active / past_due / canceled */
  status: text("status").notNull().default("active"),
  currentPeriodEnd: timestamptz("current_period_end"),
  unsubscribedAt: timestamptz("unsubscribed_at"),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  updatedAt: timestamptz("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

/** Katalog položek (akcie, ETF, indexy). Obnovuje ho W9. */
export const symbols = pgTable(
  "symbols",
  {
    ticker: text("ticker").primaryKey(),
    name: text("name").notNull(),
    kind: text("kind").notNull(),
    exchange: text("exchange"),
    currency: text("currency").default("USD"),
    sector: text("sector"),
    inSp500: boolean("in_sp500").default(false),
    active: boolean("active").default(true),
    updatedAt: timestamptz("updated_at").defaultNow(),
  },
  (table) => [
    check("symbols_kind_check", sql`${table.kind} in ('stock', 'etf', 'index')`),
    index("symbols_name_trgm").using("gin", table.name.op("gin_trgm_ops")),
    index("symbols_ticker_trgm").using("gin", table.ticker.op("gin_trgm_ops")),
  ],
);

/** Vlastní výběr. Limit se hlídá v transakci (zadání 5.7). */
export const watchlist = pgTable(
  "watchlist",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    ticker: text("ticker")
      .notNull()
      .references(() => symbols.ticker),
    /** false = přebytek po snížení tarifu. */
    active: boolean("active").notNull().default(true),
    addedAt: timestamptz("added_at").notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.ticker] })],
);

/** Vitrína na webu. Vždy čerstvá data, i když ji nikdo nesleduje. */
export const showcaseSymbols = pgTable("showcase_symbols", {
  ticker: text("ticker")
    .primaryKey()
    .references(() => symbols.ticker),
  position: integer("position").notNull(),
});

export const priceHistory = pgTable(
  "price_history",
  {
    ticker: text("ticker")
      .notNull()
      .references(() => symbols.ticker),
    tradeDate: date("trade_date").notNull(),
    close: numeric("close").notNull(),
  },
  (table) => [primaryKey({ columns: [table.ticker, table.tradeDate] })],
);

export const marketDaily = pgTable("market_daily", {
  reportDate: date("report_date").primaryKey(),
  sp500ChangePct: numeric("sp500_change_pct"),
  topGainers: jsonb("top_gainers"),
  topLosers: jsonb("top_losers"),
  summaryText: text("summary_text"),
  sources: jsonb("sources"),
  reportReady: boolean("report_ready").default(false),
  createdAt: timestamptz("created_at").defaultNow(),
});

export const tickerDaily = pgTable(
  "ticker_daily",
  {
    reportDate: date("report_date").notNull(),
    ticker: text("ticker")
      .notNull()
      .references(() => symbols.ticker),
    price: numeric("price"),
    changePct: numeric("change_pct"),
    /** Pohyb nad prahem. */
    significant: boolean("significant").notNull().default(false),
    /** template / llm */
    summaryKind: text("summary_kind").notNull().default("template"),
    summaryText: text("summary_text"),
    sources: jsonb("sources"),
  },
  (table) => [primaryKey({ columns: [table.reportDate, table.ticker] })],
);

/** Obchodní dny, svátky a zkrácené seance. */
export const marketCalendar = pgTable("market_calendar", {
  calDate: date("cal_date").primaryKey(),
  isTradingDay: boolean("is_trading_day").notNull(),
  note: text("note"),
});

/** Double opt-in. Token se ukládá jen jako hash. */
export const subscriptionConfirmations = pgTable(
  "subscription_confirmations",
  {
    tokenHash: text("token_hash").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamptz("expires_at").notNull(),
    usedAt: timestamptz("used_at"),
  },
  (table) => [index("subscription_confirmations_user_idx").on(table.userId)],
);

/** Fronta e-mailů k odeslání (plní n8n). */
export const outbox = pgTable(
  "outbox",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id),
    reportDate: date("report_date"),
    /** morning / afternoon / weekly / weekly_outlook */
    reportType: text("report_type"),
    htmlBody: text("html_body"),
    /** pending / sent / failed */
    status: text("status").default("pending"),
    createdAt: timestamptz("created_at").defaultNow(),
  },
  (table) => [unique().on(table.userId, table.reportDate, table.reportType)],
);

/** Log odeslání (idempotence). */
export const sendLog = pgTable(
  "send_log",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    reportDate: date("report_date").notNull(),
    reportType: text("report_type").notNull(),
    sentAt: timestamptz("sent_at").defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.reportDate, table.reportType] })],
);

/** Idempotence webhooků Stripe (fáze 4). */
export const stripeEvents = pgTable("stripe_events", {
  eventId: text("event_id").primaryKey(),
  type: text("type").notNull(),
  processedAt: timestamptz("processed_at").defaultNow(),
});

/**
 * Omezení počtu požadavků. Klíč je hash (rozsah a IP nebo e-mail), takže
 * tabulka sama osobní údaje nenese.
 */
export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  resetAt: timestamptz("reset_at").notNull(),
});

/* Tabulky Better Auth. Názvy polí jsou jeho, sloupce v snake_case. */

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamptz("expires_at").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamptz("created_at").notNull().defaultNow(),
    updatedAt: timestamptz("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("sessions_user_idx").on(table.userId)],
);

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamptz("access_token_expires_at"),
    refreshTokenExpiresAt: timestamptz("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamptz("created_at").notNull().defaultNow(),
    updatedAt: timestamptz("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("accounts_user_idx").on(table.userId)],
);

/** Tokeny přihlašovacích odkazů. Identifier je hash tokenu (storeToken: "hashed"). */
export const verifications = pgTable(
  "verifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamptz("expires_at").notNull(),
    createdAt: timestamptz("created_at").notNull().defaultNow(),
    updatedAt: timestamptz("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("verifications_identifier_idx").on(table.identifier)],
);
