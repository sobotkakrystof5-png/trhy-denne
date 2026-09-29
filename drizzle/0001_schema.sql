CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "market_calendar" (
	"cal_date" date PRIMARY KEY NOT NULL,
	"is_trading_day" boolean NOT NULL,
	"note" text
);
--> statement-breakpoint
CREATE TABLE "market_daily" (
	"report_date" date PRIMARY KEY NOT NULL,
	"sp500_change_pct" numeric,
	"top_gainers" jsonb,
	"top_losers" jsonb,
	"summary_text" text,
	"sources" jsonb,
	"report_ready" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "outbox" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"report_date" date,
	"report_type" text,
	"html_body" text,
	"status" text DEFAULT 'pending',
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "outbox_user_id_report_date_report_type_unique" UNIQUE("user_id","report_date","report_type")
);
--> statement-breakpoint
CREATE TABLE "plan_limits" (
	"tier" text PRIMARY KEY NOT NULL,
	"max_watchlist" integer NOT NULL,
	"reports_per_day" integer NOT NULL,
	"archive_days" integer,
	"move_threshold_pct" numeric DEFAULT '3.0' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "price_history" (
	"ticker" text NOT NULL,
	"trade_date" date NOT NULL,
	"close" numeric NOT NULL,
	CONSTRAINT "price_history_ticker_trade_date_pk" PRIMARY KEY("ticker","trade_date")
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"count" integer NOT NULL,
	"reset_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "send_log" (
	"user_id" uuid NOT NULL,
	"report_date" date NOT NULL,
	"report_type" text NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "send_log_user_id_report_date_report_type_pk" PRIMARY KEY("user_id","report_date","report_type")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "showcase_symbols" (
	"ticker" text PRIMARY KEY NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stripe_events" (
	"event_id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscription_confirmations" (
	"token_hash" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "symbols" (
	"ticker" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"kind" text NOT NULL,
	"exchange" text,
	"currency" text DEFAULT 'USD',
	"sector" text,
	"in_sp500" boolean DEFAULT false,
	"active" boolean DEFAULT true,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "symbols_kind_check" CHECK ("symbols"."kind" in ('stock', 'etf', 'index'))
);
--> statement-breakpoint
CREATE TABLE "ticker_daily" (
	"report_date" date NOT NULL,
	"ticker" text NOT NULL,
	"price" numeric,
	"change_pct" numeric,
	"significant" boolean DEFAULT false NOT NULL,
	"summary_kind" text DEFAULT 'template' NOT NULL,
	"summary_text" text,
	"sources" jsonb,
	CONSTRAINT "ticker_daily_report_date_ticker_pk" PRIMARY KEY("report_date","ticker")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"email_confirmed_at" timestamp with time zone,
	"consent_at" timestamp with time zone,
	"consent_ip" "inet",
	"consent_text_version" text,
	"digital_content_waiver_at" timestamp with time zone,
	"stripe_customer_id" text,
	"tier" text DEFAULT 'free' NOT NULL,
	"requested_tier" text,
	"status" text DEFAULT 'active' NOT NULL,
	"current_period_end" timestamp with time zone,
	"unsubscribed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_stripe_customer_id_unique" UNIQUE("stripe_customer_id")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "watchlist" (
	"user_id" uuid NOT NULL,
	"ticker" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "watchlist_user_id_ticker_pk" PRIMARY KEY("user_id","ticker")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outbox" ADD CONSTRAINT "outbox_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_ticker_symbols_ticker_fk" FOREIGN KEY ("ticker") REFERENCES "public"."symbols"("ticker") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "send_log" ADD CONSTRAINT "send_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "showcase_symbols" ADD CONSTRAINT "showcase_symbols_ticker_symbols_ticker_fk" FOREIGN KEY ("ticker") REFERENCES "public"."symbols"("ticker") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_confirmations" ADD CONSTRAINT "subscription_confirmations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticker_daily" ADD CONSTRAINT "ticker_daily_ticker_symbols_ticker_fk" FOREIGN KEY ("ticker") REFERENCES "public"."symbols"("ticker") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_tier_plan_limits_tier_fk" FOREIGN KEY ("tier") REFERENCES "public"."plan_limits"("tier") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_requested_tier_plan_limits_tier_fk" FOREIGN KEY ("requested_tier") REFERENCES "public"."plan_limits"("tier") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watchlist" ADD CONSTRAINT "watchlist_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watchlist" ADD CONSTRAINT "watchlist_ticker_symbols_ticker_fk" FOREIGN KEY ("ticker") REFERENCES "public"."symbols"("ticker") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_user_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subscription_confirmations_user_idx" ON "subscription_confirmations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "symbols_name_trgm" ON "symbols" USING gin ("name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "symbols_ticker_trgm" ON "symbols" USING gin ("ticker" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "verifications_identifier_idx" ON "verifications" USING btree ("identifier");