<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md: technický popis projektu Trhy denně

Fakta pro jakéhokoli AI asistenta (Claude Code, Cursor, Codex). Žádná pravidla tónu a chování, ta jsou v `CLAUDE.md`. Aktuální stav je v `memory/memory.md`. Zadání je v `PROJECT-BRIEF.md`.

Blok `nextjs-agent-rules` nahoře pochází z `create-next-app` a `next dev` ho obnovuje. Nech ho na místě.

## Přehled

- **Název:** Trhy denně (pracovní, drží ho jediný soubor `src/lib/site.ts`)
- **Typ:** placený newsletter o amerických akciích a indexech s vlastním výběrem položek. Prodejní stránka, registrace, účet, předplatné
- **Stav:** viz `memory/memory.md`, sekce Aktuální stav
- **Jazyk webu a kódu komentářů:** čeština. Identifikátory v kódu anglicky
- **Stack:** Next.js (App Router) 16.3.7 (Turbopack), React 19.2.8, TypeScript, Tailwind CSS v4, Motion, Drizzle ORM 0.45 (+ `drizzle-kit`, `pg` jen pro migrace a seed), `@neondatabase/serverless`, Zod 4, Better Auth 1.7 (magic link), Resend a React Email, `stripe` 22.6.2 (verze API `2026-08-26.dahlia` zabudovaná v SDK, neurčuje se v kódu), PostHog (`posthog-js`, fáze 5), `simple-icons`, písma `@fontsource-variable/space-grotesk` (nadpisy, popisky, tlačítka, čísla) a `@fontsource-variable/montserrat` (text), potvrzené uživatelem. Motion je nainstalovaný, ale nepoužitý (viz Klíčové technické fakty)
- **Hosting:** Vercel. **Databáze:** Neon Postgres. **Automatizace:** n8n (mimo tento repozitář)
- **Příkazy:** `npm run dev`, `npm run build`, `npm run lint`, `node scripts/gen-icons.mjs` (znovu vygeneruje ikony), `npm run db:up` (lokální Postgres a proxy Neonu v Dockeru), `npm run db:generate` a `npm run db:migrate` (migrace přes drizzle-kit), `npm run db:seed` (katalog a vitrína z ukázkových dat), `npm run stripe:setup` (produkty, ceny a nastavení portálu v sandboxu, opakovatelné)

## Struktura repozitáře (cílový stav)

```
.
├── CLAUDE.md                    chování a proces
├── AGENTS.md                    tento soubor
├── PROJECT-BRIEF.md             zadání
├── memory/
│   ├── index.md                 mapa
│   ├── pravidla.md              pravidla vedení paměti
│   └── memory.md                aktuální stav, rozhodnutí, záznamy
├── reference/                   screenshoty cr-8.cz (cr8-home.png, cr8-asistent.png)
├── .claude/security/            STATE.md, DECISIONS.md, CSP-LOG.md, AUDIT-LOG.md
├── .github/workflows/           security.yml (audit, tajemství, hlavičky)
├── public/.well-known/          security.txt
├── scripts/gen-icons.mjs
├── docker-compose.yml           jen vývoj: Postgres 17 a proxy napodobující Neon
├── drizzle.config.ts
├── drizzle/                     migrace (0000 pg_trgm, 0001 schéma, 0002 plan_limits)
├── scripts/seed.mts             seed katalogu a vitríny (node, bez sestavení)
├── scripts/stripe-setup.mts     produkty, ceny a nastavení portálu v sandboxu Stripe
└── src/
    ├── proxy.ts                 CSP s nonce (v Next.js 16 místo middleware.ts)
    ├── app/                     trasy: /, /prihlaseni (+ /overit), /ucet, /potvrzeni, /dekujeme,
    │                            /podminky, /ochrana-udaju, /disclaimer, /api/*
    │                            (včetně /api/webhooks/stripe), /ucet/TierCard.tsx
    ├── components/              Header, TickerTape, ScrollProgress, BrandMark (značka webu), SymbolIcon (loga položek),
    │                            Sparkline, CountUp, WatchlistPicker, AnalysisList, SignupForm, TimeCalculator, Footer, LegalPage
    │   ├── sections/            sekce prodejní stránky: Hero, HeroBoard, Problem, HowItWorks, Dashboard, Analyses,
    │   │                        Trust, Audience, Pricing, Faq, ClosingCta
    │   └── ui/                  Button, Card, ChangeChip, Badge, Segmented, SectionDivider
    ├── data/                    sample.ts (ukázková data do zapojení API), icons.generated.ts
    ├── db/                      schema.ts (Drizzle), index.ts (HTTP klient a withTransaction přes Pool)
    ├── emails/                  šablony React Email (Layout, templates, ReportEmail)
    └── lib/                     site.ts, format.ts, plans.ts (tarify, checkAdd), signup.ts, symbols.ts, env.ts,
                                 auth.ts (Better Auth), email.tsx (Resend), subscriptions.ts, watchlist.ts,
                                 rate-limit.ts, http.ts, stripe.ts (klient a mapa cen), billing.ts
                                 (Checkout, portál, sync předplatného), internal-auth.ts (podpisy HMAC),
                                 n8n-events.ts (odchozí události), reports.ts a report-email.tsx (report)
```

## Klíčové technické fakty

- **Struktura webu je závazné rozhodnutí:** jedna prodejní stránka s kotvami `#jak`, `#dashboard`, `#analyzy`, `#cenik`, `#faq`, `#objednat` plus samostatné trasy účtu a právních stránek. Neměnit potichu.
- **`turbopack.root` v `next.config.ts`** ukazuje napevno na složku projektu. Bez toho si Next.js odvodí kořen z `package-lock.json` v domovské složce uživatele a ohlásí varování. Neodstraňovat.
- **Přetečení kurzovního pásu** řídí třída `.ticker-viewport` v CSS, ne utilita v JSX. Utilita by přebila pravidlo pro `prefers-reduced-motion` a pás by u těch uživatelů zůstal zamrzlý a nečitelný.
- **Dynamické vykreslování:** kořenový layout čte `headers()`, aby Next.js přidal nonce z `proxy.ts` ke svým skriptům. Důsledek: bez statické keše stránek. Data se cachují na úrovni dotazu.
- **Databáze:** HTTP driver Neon na jednoduché dotazy (`db()`), `Pool` (WebSocket) na transakce (`withTransaction`, spojení se otevře a zavře v jednom volání). Přidání položky do výběru je vždy transakce se zámkem uživatele (`SELECT … FOR UPDATE`, `src/lib/watchlist.ts`). Schéma je v `src/db/schema.ts`, odvozené ze zadání 5.2, odchylky jsou popsané v hlavičce souboru. Migrace jen přes drizzle-kit.
- **Lokální databáze:** `npm run db:up` spustí Postgres na `127.0.0.1:54329` a proxy Neonu na portu 4444. `DATABASE_URL=postgres://postgres:postgres@localhost:54329/main`. Ovladač pozná lokální hostitele (`localhost`, `127.0.0.1`, `db.localtest.me`) a přesměruje HTTP i WebSocket na proxy. `db.localtest.me` z návodu Neonu tady DNS nepřeloží. **Proxy řadí WebSocket spojení za sebe**, takže souběh transakcí přes aplikaci lokálně otestovat nejde. Test zámku jde přímo na Postgres.
- **Zapojení funkcí podle prostředí:** `accountsReady()` v `src/lib/env.ts` vyžaduje `DATABASE_URL`, `BETTER_AUTH_SECRET` a e-mail. Bez nich odběr, potvrzení, přihlášení a výběr pravdivě vrací 503 a stránky to říkají. E-mail: s `RESEND_API_KEY` a `EMAIL_FROM` přes Resend, ve vývoji bez nich se text e-mailu vypíše do konzole serveru, v produkci bez nich e-mail neodejde a odběr neběží.
- **Přihlášení:** Better Auth, jen odkaz v e-mailu (`disableSignUp`, token jako hash, 15 minut). Tabulky `users` (sdílená se zadáním), `sessions`, `accounts`, `verifications`. Z `/api/auth/*` je otevřená jen `GET /api/auth/magic-link/verify`. Odeslání odkazu a odhlášení jsou serverové akce (`src/app/prihlaseni/actions.ts`, `src/app/ucet/actions.ts`). Cookie `td.session_token`. Účet vzniká jen odběrem se souhlasem.
- **Jednorázové odkazy z e-mailu** (potvrzení odběru, přihlášení) vedou na stránku s tlačítkem, token se spotřebuje až formulářem. Skenery pošty tak nic nepotvrdí ani nespotřebují.
- **Omezení počtu požadavků:** `hit(limits.x, subjekt)` v `src/lib/rate-limit.ts` nad tabulkou `rate_limits`. Klíč je hash. IP bere z `x-forwarded-for` (Vercel).
- **Limity tarifů** jsou v tabulce `plan_limits`, ne v kódu. UI a server čtou tentýž zdroj.
- **Platby:** webhook Stripe přijímá `POST /api/webhooks/stripe` (surové tělo, `constructEventAsync`, idempotence přes `stripe_events`). Tarif se mapuje z ID ceny na serveru (`tierForPrice` v `src/lib/stripe.ts`), nikdy z hodnoty od klienta. `paymentsReady()` v `src/lib/env.ts` vyžaduje účty, klíč, podpis webhooku a obě ceny, jinak platby pravdivě vrací 503 a texty netvrdí, že běží.
- **Zdroj pravdy o tarifu je Stripe.** Každá událost webhooku si předplatné načte (`syncSubscription` v `src/lib/billing.ts`) a přepíše podle něj řádek uživatele, místo aby stav dopočítávala z těla zprávy. Na pořadí událostí proto nezáleží. Řádek v `stripe_events` se při chybě zpracování maže, aby Stripe mohl doručení zopakovat.
- **Pozor na verzi API Stripe:** `Subscription.current_period_end` už neexistuje, období je na položce (`subscription.items.data[0].current_period_end`), a faktura nese předplatné v `invoice.parent.subscription_details.subscription`. Při upgradu SDK projít changelog.
- **Souhlas s okamžitým poskytnutím digitálního obsahu** je povinné zaškrtávátko v kartě tarifu (`src/app/ucet/TierCard.tsx`), ne možnost Checkoutu. Čas a verze znění se ukládají do `users.digital_content_waiver_at` a `..._version` ještě před odchodem na platbu. Verze je `WAIVER_TEXT_VERSION` v `src/lib/stripe.ts`, při změně znění se zvedá.
- **Platí se jen z `/ucet`,** ne z prodejní stránky. Ceník na `/` vybere tarif a pošle adresu, platit může jen přihlášený člověk s prokázanou adresou.
- **n8n:** propojení podepsanými voláními (HMAC-SHA256 nad `značka.tělo`, hlavičky `x-internal-timestamp` a `x-internal-signature`, platnost 5 minut, tajemství `INTERNAL_HMAC_SECRET`), oběma směry. Render reportů dělá Next.js (`POST /api/internal/render-report`, dávka do 100 uživatelů, vrací HTML, do `outbox` ho ukládá n8n), n8n jen orchestruje. Po zpracování události Stripe jde do `N8N_EVENT_WEBHOOK_URL` podepsaná zpráva (`notifyN8n` v `src/lib/n8n-events.ts`), její chyba se jen loguje a platbu neblokuje. Render nepřeskočí kontrolu: bez `market_daily.report_ready` vrací 409, nepotvrzené, odhlášené a bez placeného přístupu (lhůta po `past_due`) uživatele vynechá a vrátí v `skipped`. n8n používá vlastního databázového uživatele s minimálními právy.
- **Čísla** pocházejí jen z datového API. Jazykový model je nepíše. Položky bez výrazného pohybu dostanou šablonový text bez volání LLM.
- **Veřejné demo dashboardu** ukazuje jen položky s čerstvými daty (vitrína a sjednocení výběrů). Pro ostatní vrací stav "data budou k dispozici po přidání do výběru".
- **Ukázková data** jsou deterministická a viditelně označená, dokud není zapojené API.
- **Ikony položek:** SVG ze `simple-icons` přes `SymbolIcon` (ne `BrandMark`, to je značka webu), jednobarevné v inkoustu v kroužku s výplní `--paper`. Cesty generuje `node scripts/gen-icons.mjs` do `src/data/icons.generated.ts`, balíček je jen vývojová závislost. Chybějící ikona a každý index dostanou monogram (nejvýš 3 znaky). Nikdy nestahuj loga z jiných zdrojů bez rozhodnutí uživatele.
- **Pohyb je jen CSS.** Animace se spouštějí třídami a atributy `data-*` (`data-draw`, `data-open`, `data-selected`), hodnoty za běhu se píšou přes CSSOM. Žádný atribut `style` v JSX: CSP bez `'unsafe-inline'` by ho zablokovalo. Proto se nepoužívá Motion (`initial` vykresluje `style` na serveru). Všechno se vypíná při `prefers-reduced-motion` v jednom bloku v `globals.css`.
- **Limit výběru** počítá `checkAdd(aktivních, tarif, limity)` v `src/lib/plans.ts`. Server ho volá uvnitř transakce s limity z `plan_limits`, účet s týmiž limity předanými ze serveru, ukázka na prodejní stránce s `defaultLimits` (kopie seedu). `WatchlistPicker` (ukázka, výběr v `localStorage` přes `useSyncExternalStore`) a `AccountWatchlist` (účet, `PUT /api/watchlist`, hledání přes `/api/symbols/search`) sdílejí zobrazení `PickerView`.
- **`POST /api/subscribe`** uloží souhlas (čas, IP, verze znění) a pošle potvrzovací e-mail, logika je v `src/lib/subscriptions.ts`. Odpověď je stejná pro novou i existující adresu. Validace je sdílená funkce `validateSignup` v `src/lib/signup.ts`, na serveru navíc Zod.
- **Test v Safari na localhostu** nejde přímo: `upgrade-insecure-requests` přepíše http na https. Viz `.claude/security/STATE.md`.
- **Design tokeny** (barvy, tvary, stíny, písma) jsou v `@theme` v `src/app/globals.css` a přesná čísla v `PROJECT-BRIEF.md`, sekce 2.2 až 2.5. Barvy: `--ink #0C0C0A`, `--cream #F9F3E5`, `--salmon #E4B9A0`, `--mist #CED9DD`, `--sand #EBD69D` (změřeno ze screenshotů). Karty mají 3 px černý okraj a **tvrdý stín bez `blur`**. Barva karty nese význam (mist = index, sand = akcie, salmon = ve výběru).
- **Velká písmena** (popisky, navigace, tlačítka) se dělají jen přes CSS `text-transform`, v HTML je běžný text.
- **Písma** jsou balíčky ze `@fontsource-variable`, ne Google Fonts (kvůli CSP a nezávislosti na externích zdrojích). Žádná animovaná pozadí z canvasu ani sítě bodů.
- **Web je `noindex`,** dokud uživatel nerozhodne o spuštění.

## Konvence

- Čeština v textech pro uživatele, sentence case, skutečné znaménko minus (U+2212) u záporných změn, pevná mezera před `%`. Formátování čísel přes `Intl.NumberFormat("cs-CZ")` (`src/lib/format.ts`).
- Všechny texty pro uživatele projdou skillem `humanize-text-cs`.
- Validace vstupů Zod na serveru u každé trasy.
- Žádné `localStorage` bez `try/catch` a bez správného chování při prázdném úložišti.
- Žádná tajemství v Gitu. `.env.example` bez hodnot.
- Komentáře v kódu stručné a k věci, vysvětlují proč, ne co.

## Bezpečnostní pravidla (plná verze)

Tato sekce je zdroj pravdy. `CLAUDE.md` drží jen krátký blok.

1. **Hlavičky** se vždy nasazují společně: HSTS (`max-age=63072000; includeSubDomains`, bez `preload` do měsíce čistého provozu), CSP, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (zakázat nepoužívané), COOP `same-origin`, CORP `same-origin`, `X-XSS-Protection: 0`. Odstranit `X-Powered-By`.
2. **CSP** se staví v `src/proxy.ts` s nonce a `strict-dynamic`. `script-src` nikdy neobsahuje `unsafe-inline` ani `unsafe-eval` (ten jen ve vývoji). Vždy `base-uri`, `object-src 'none'`, `frame-ancestors`, `form-action`. Žádné zástupné znaky. `style-src` je **bez** `'unsafe-inline'`. Zadání s ním počítalo kvůli Motion, ale ukázalo se, že potřeba není (ověřeno 2026-09-29, viz `DECISIONS.md`). Cena: inline atribut `style` v HTML je zakázaný, hodnoty počítané za běhu se nastavují přes CSSOM (`element.style.setProperty`), což CSP neřeší. Přehodnotit se to smí, až Motion opravdu narazí.
3. **Každá doména v CSP** má řádek v `.claude/security/CSP-LOG.md` (co ji potřebuje a proč). Očekávané: PostHog (EU) v `connect-src`. Stripe se používá jen přesměrováním na hostovanou stránku, přesto je od fáze 4 ve `form-action` (`checkout.stripe.com`, `billing.stripe.com`): prohlížeč tuto direktivu hlídá i na přesměrování po odeslání formuláře, takže bez nich by platba bez JavaScriptu skončila zablokovaná. Do `script-src`, `frame-src` ani `connect-src` nepatří nic ze Stripe.
4. **Zpřísnění se nikdy neobchází.** Když knihovna žádá `unsafe-inline` nebo `unsafe-eval`, přehodnoť knihovnu, ne politiku.
5. **Tajemství:** jen na serveru. Do prohlížeče jen `NEXT_PUBLIC_*`. `.gitignore` obsahuje `.env`, `.env.*`, `*.pem`, `*.key`, `.vercel`, `.DS_Store`.
6. **Vstupy:** Zod na každé trase. Tokeny se ukládají jako hash. Omezení počtu požadavků na přihlášení, odběr a vyhledávání.
7. **Stripe:** ověření podpisu nad surovým tělem, idempotence, tarif ze serverové mapy cen, nikdy z hodnoty klienta.
8. **Interní trasy:** ověření HMAC a časové značky, jinak 401.
9. **`security.txt`** má povinné pole `Expires`. Kontakt je zatím otevřená otázka. Do spuštění na veřejném webu nenechávat zástupný kontakt.
10. **DNS:** DNSSEC, CAA, SPF, DKIM a DMARC pro odesílací doménu. Stav vede `.claude/security/STATE.md`.
11. **Změna bezpečnostní konfigurace** se zapisuje do `.claude/security/STATE.md` a `DECISIONS.md` a do `memory/memory.md`.
12. Ověřuj vlastní web, nikdy nezkoušej cizí systémy.

## Lokální skills a kdy je použít

| Skill | Kdy |
| --- | --- |
| `project-memory-system` | vedení paměti, každou relaci |
| `web-project-brief` | úprava `PROJECT-BRIEF.md` a `CLAUDE.md`. Sekce 0 nezkracovat |
| `design-taste-frontend` | každá práce na vzhledu (postup návrh, kritika, stavba, sebekritika). Jeho seznam "výchozích voleb" neplatí tam, kde ho přebíjí zadání (směr cr-8) |
| `humanize-text-cs` | každý český text pro uživatele webu a e-mailů |
| `web-security-setup` | nový projekt, změna integrace nebo hlaviček |
| `web-security-audit`, `web-security-review` | po nasazení a před spuštěním, pokud jsou dostupné |
| `onepage-craftsman-site-layout` | nepoužívat (web řemeslníka, sem se nehodí) |

## Odkaz na paměť

Každá změna obsahu tohoto souboru se zapíše i do `memory/memory.md` ve stejném tahu. Jedno bez druhého je nedokončené.
