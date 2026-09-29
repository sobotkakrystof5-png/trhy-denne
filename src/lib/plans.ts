/**
 * Tarify a jejich limity. Hodnoty zrcadlí seed tabulky plan_limits
 * z PROJECT-BRIEF.md, sekce 5.2. Od fáze 3 je zdrojem pravdy databáze
 * a tento soubor zůstane jen jako seed a typy.
 *
 * checkAdd používá UI i server. Limit se tak hlídá jedním kódem a
 * dashboard nemůže slíbit něco, co pak server odmítne.
 */
export type Tier = "free" | "start" | "plus" | "pro";

export type Plan = {
  tier: Tier;
  name: string;
  priceCzk: number;
  maxWatchlist: number;
  /** Pro se podle plánu staví později, web to musí říkat otevřeně. */
  available: boolean;
};

export const plans: Record<Tier, Plan> = {
  free: { tier: "free", name: "Free", priceCzk: 0, maxWatchlist: 0, available: true },
  start: { tier: "start", name: "Start", priceCzk: 79, maxWatchlist: 5, available: true },
  plus: { tier: "plus", name: "Plus", priceCzk: 129, maxWatchlist: 25, available: true },
  pro: { tier: "pro", name: "Pro", priceCzk: 249, maxWatchlist: 100, available: false },
};

const order: Tier[] = ["free", "start", "plus", "pro"];

/** Tarify, které mají vlastní výběr položek. Free žádný nemá. */
export const pickerTiers = ["start", "plus", "pro"] as const satisfies Tier[];
export type PickerTier = (typeof pickerTiers)[number];

export const tiers = order;

export function isTier(value: unknown): value is Tier {
  return typeof value === "string" && (order as string[]).includes(value);
}

/**
 * Počet míst podle tarifu. V účtu a na serveru pochází z tabulky
 * plan_limits. Výchozí hodnoty (seed) platí jen pro ukázku na prodejní
 * stránce, která databázi nepotřebuje.
 */
export type Limits = Record<Tier, number>;

export const defaultLimits: Limits = {
  free: plans.free.maxWatchlist,
  start: plans.start.maxWatchlist,
  plus: plans.plus.maxWatchlist,
  pro: plans.pro.maxWatchlist,
};

/** Nejbližší vyšší tarif s víc místy, nebo null, když už žádný není. */
export function nextTierWithMoreRoom(tier: Tier, limits: Limits = defaultLimits): Tier | null {
  const limit = limits[tier];
  const higher = order
    .slice(order.indexOf(tier) + 1)
    .find((candidate) => limits[candidate] > limit);
  return higher ?? null;
}

export type AddCheck =
  | { ok: true }
  | { ok: false; limit: number; upgrade: Tier | null };

/** Smí uživatel s `activeCount` položkami přidat další? */
export function checkAdd(activeCount: number, tier: Tier, limits: Limits = defaultLimits): AddCheck {
  const limit = limits[tier];
  if (activeCount < limit) return { ok: true };
  return { ok: false, limit, upgrade: nextTierWithMoreRoom(tier, limits) };
}

/**
 * Práh výrazného pohybu v procentech. Je to NÁVRH ze zadání (sekce 13,
 * otázka 6), ne rozhodnutí. Web proto konkrétní číslo nikde neslibuje.
 */
export const MOVE_THRESHOLD_PCT = 3;

export function isSignificantMove(change: number): boolean {
  return Math.abs(change) >= MOVE_THRESHOLD_PCT;
}
