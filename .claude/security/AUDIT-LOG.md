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
| 2026-09-29 | Odběr a potvrzení (fáze 3) | curl proti `npm run dev` s lokální databází | Bez Origin 403, neplatná data 400, platný požadavek 200 a řádek s IP, verzí souhlasu a e-mailem malými písmeny, past na roboty 200 bez zápisu, formulář bez JS 303 na `/dekujeme`. V databázi jen hash tokenu. GET potvrzení nic nezmění, POST potvrdí, druhé použití odmítnuto. |
| 2026-09-29 | Přihlášení a účet (fáze 3) | Chrome přes Playwright, 17 kontrol | Cizí adresa nedostane odkaz a vidí stejný text. Token v `verifications` jen jako hash. Otevření odkazu relaci nevytvoří, tlačítko ano. Cookie `HttpOnly` a `SameSite=Lax`. Použitý odkaz odmítnut. Free nemůže přidat nic, Start přesně 5. Hledání přes API. Odhlášení zruší přístup k `/ucet`. Mobil 390 px bez přetoku. |
| 2026-09-29 | Souběžné přidání do výběru (zadání 5.7) | 10 současných transakcí přímo na Postgresu, stejné kroky jako `addToWatchlist`, s pauzou 50 ms mezi počítáním a vložením | **Bez zámku: 10 z 10 prošlo, 14 položek při limitu 5.** Se `SELECT … FOR UPDATE`: 1 prošla, 9 odmítnuto, 5 položek. Opakováno 2×. Log Postgresu potvrzuje, že aplikace posílá `begin`, `select … for update`, `commit`. |
| 2026-09-29 | Souběh přes HTTP | 10 současných `PUT /api/watchlist` na dev server | 1× 200, 9× 409. **Nedokazuje nic:** stejný výsledek dal i pokus bez zámku, protože lokální proxy Neonu řadí WebSocket spojení za sebe. Skutečný test přes HTTP půjde až proti Neonu. |
| 2026-09-29 | CSP na nových stránkách | Playwright proti produkčnímu buildu (`next start`): `/prihlaseni`, `/prihlaseni/overit`, `/potvrzeni` ve třech stavech, `/dekujeme`, `/ucet` | Žádné porušení CSP ani chyba v konzoli. Ve vývojovém režimu hlásí porušení `style-src-elem` jen `next-devtools` (dohledáno přes `securitypolicyviolation`), na všech stránkách včetně `/`, v produkci není. |
| 2026-09-29 | `npm audit` po fázi 3 | lokálně | 4 moderate v `drizzle-kit` (starý `esbuild` přes `@esbuild-kit`, týká se jen vývojového serveru esbuild, který se nepoužívá). Žádné high, CI (`--audit-level=high`) projde. |

**Neověřeno ve fázi 3:** WebKit na nových stránkách, Lighthouse na nových stránkách, skutečné odeslání přes Resend, Neon.

**Neověřeno:** veřejná adresa, securityheaders.com, DNS, `npm audit` v CI.
