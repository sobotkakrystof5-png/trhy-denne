# AUDIT-LOG: co se kdy kontrolovalo

| Datum | Co | Jak | Výsledek |
| --- | --- | --- | --- |
| 2026-09-29 | Hlavičky odpovědi | `curl -I` na `npm run start` lokálně | Všechny hlavičky ze `STATE.md` přítomné. `X-Powered-By` chybí, což je správně. |
| 2026-09-29 | CSP v prohlížeči | Chrome přes Playwright, desktop 1440 a mobil 390 | Žádné porušení CSP, žádná chyba v konzoli. Všechny skripty i stylopis mají nonce. V HTML není žádný `<style>` ani atribut `style`. |
| 2026-09-29 | Kontrast WCAG AA | výpočet poměru jasu pro 15 dvojic z designového systému | Všechny dvojice nad 4,5. Nejnižší je `--gain-ink` na krému (4,81). |
| 2026-09-29 | Tajemství v Gitu | `git diff --cached --name-only` před prvním commitem | Nic citlivého v indexu, `node_modules` ignorované. |

**Neověřeno:** veřejná adresa, securityheaders.com, DNS, `npm audit` v CI.
