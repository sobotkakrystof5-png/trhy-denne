-- Limity tarifů ze zadání 5.2. Jsou to konfigurační data, na kterých stojí
-- cizí klíč users.tier, proto patří do migrace, ne do seedu ukázkových dat.
-- Práh 3.0 je návrh (otevřená otázka 6), změna jde přes novou migraci.
INSERT INTO plan_limits (tier, max_watchlist, reports_per_day, archive_days, move_threshold_pct) VALUES
  ('free', 0, 0, 0, 3.0),
  ('start', 5, 1, 0, 3.0),
  ('plus', 25, 2, 90, 3.0),
  ('pro', 100, 3, NULL, 3.0)
ON CONFLICT (tier) DO NOTHING;
