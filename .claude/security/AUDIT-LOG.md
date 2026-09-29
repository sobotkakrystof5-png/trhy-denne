# AUDIT-LOG: co se kdy kontrolovalo

| Datum | Co | Jak | Výsledek |
| --- | --- | --- | --- |
| 2026-09-29 | Hlavičky odpovědi | `curl -I` na `npm run start` lokálně | Všechny hlavičky ze `STATE.md` přítomné. `X-Powered-By` chybí, což je správně. |
| 2026-09-29 | CSP v prohlížeči | Chrome přes Playwright, desktop 1440 a mobil 390 | Žádné porušení CSP, žádná chyba v konzoli. Všechny skripty i stylopis mají nonce. V HTML není žádný `<style>` ani atribut `style`. |
| 2026-09-29 | Kontrast WCAG AA | výpočet poměru jasu pro 15 dvojic z designového systému | Všechny dvojice nad 4,5. Nejnižší je `--gain-ink` na krému (4,81). |
| 2026-09-29 | Tajemství v Gitu | `git diff --cached --name-only` před prvním commitem | Nic citlivého v indexu, `node_modules` ignorované. |

| 2026-09-29 | CSP na prodejní stránce (fáze 2) | Chrome přes Playwright na 360, 390, 768, 1024, 1100, 1280 a 1440 px, celá stránka projetá scrollem i s omezeným pohybem | Žádné porušení CSP, čistá konzole, žádný vodorovný přetok. |
| 2026-09-29 | CSP ve WebKitu | Playwright WebKit přes proxy bez `upgrade-insecure-requests` (viz STATE) | Stránka sama nic neporušuje. Dvě hlášení vznikají jen při snímku obrazovky Playwrightu. |
| 2026-09-29 | `POST /api/subscribe` | curl: bez Origin, cizí Origin, špatný typ, rozbitý JSON, neplatná data, past na roboty, formulář bez JS, tělo 3 kB, GET | 403, 403, 415, 400, 400, 503, 503, 413, 405. Vše podle návrhu. |
| 2026-09-29 | Přístupnost a výkon | Lighthouse 12 lokálně | Mobil: výkon 93, přístupnost 100, postupy 100. Počítač: 100, 100, 100. SEO 60 jen kvůli záměrnému `noindex`. |

**Neověřeno:** veřejná adresa, securityheaders.com, DNS, `npm audit` v CI.
