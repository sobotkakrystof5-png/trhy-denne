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
- **Stack:** Next.js (App Router) 16.3.7 (Turbopack), React 19.2.8, TypeScript, Tailwind CSS v4, Motion, Drizzle ORM, `@neondatabase/serverless`, Zod, Stripe, Resend a React Email, PostHog (`posthog-js`), Better Auth (návrh, viz otevřené otázky), `simple-icons`, písma `@fontsource-variable/space-grotesk` (nadpisy, popisky, tlačítka, čísla) a `@fontsource-variable/montserrat` (text). Písma jsou odhad ze screenshotů, čeká na potvrzení uživatele
- **Hosting:** Vercel. **Databáze:** Neon Postgres. **Automatizace:** n8n (mimo tento repozitář)
- **Příkazy:** `npm run dev`, `npm run build`, `npm run lint`, `node scripts/gen-icons.mjs` (znovu vygeneruje ikony), `npx drizzle-kit generate` a `npx drizzle-kit migrate` (migrace)

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
├── drizzle/                     migrace
└── src/
    ├── proxy.ts                 CSP s nonce (v Next.js 16 místo middleware.ts)
    ├── app/                     trasy: /, /prihlaseni, /ucet, /potvrzeni, /dekujeme,
    │                            /podminky, /ochrana-udaju, /disclaimer, /api/*
    ├── components/              Header, TickerTape, ScrollProgress, Hero, Dashboard, Analyses, Pricing, Faq, SignupForm, BrandMark, Sparkline, CountUp
    ├── data/                    ukázková data (do zapojení API), icons.generated.ts
    ├── db/                      schema.ts (Drizzle), klient Neon
    └── lib/                     site.ts, format.ts, limity tarifů, podpisy HMAC, Stripe, Resend
```

## Klíčové technické fakty

- **Struktura webu je závazné rozhodnutí:** jedna prodejní stránka s kotvami `#jak`, `#dashboard`, `#analyzy`, `#cenik`, `#faq`, `#objednat` plus samostatné trasy účtu a právních stránek. Neměnit potichu.
- **`turbopack.root` v `next.config.ts`** ukazuje napevno na složku projektu. Bez toho si Next.js odvodí kořen z `package-lock.json` v domovské složce uživatele a ohlásí varování. Neodstraňovat.
- **Dynamické vykreslování:** kořenový layout čte `headers()`, aby Next.js přidal nonce z `proxy.ts` ke svým skriptům. Důsledek: bez statické keše stránek. Data se cachují na úrovni dotazu.
- **Databáze:** HTTP driver Neon na jednoduché dotazy, `Pool` (WebSocket) na transakce. Přidání položky do výběru je vždy transakce se zámkem uživatele (`SELECT … FOR UPDATE`). Schéma je v `PROJECT-BRIEF.md`, sekce 5.2.
- **Limity tarifů** jsou v tabulce `plan_limits`, ne v kódu. UI a server čtou tentýž zdroj.
- **Platby:** webhook Stripe přijímá `POST /api/webhooks/stripe` (surové tělo, ověření podpisu, idempotence přes `stripe_events`). Tarif se mapuje z ID ceny na serveru.
- **n8n:** propojení podepsanými voláními (HMAC-SHA256, časová značka, platnost 5 minut). Render reportů dělá Next.js (`/api/internal/render-report`), n8n jen orchestruje. n8n používá vlastního databázového uživatele s minimálními právy.
- **Čísla** pocházejí jen z datového API. Jazykový model je nepíše. Položky bez výrazného pohybu dostanou šablonový text bez volání LLM.
- **Veřejné demo dashboardu** ukazuje jen položky s čerstvými daty (vitrína a sjednocení výběrů). Pro ostatní vrací stav "data budou k dispozici po přidání do výběru".
- **Ukázková data** jsou deterministická a viditelně označená, dokud není zapojené API.
- **Ikony:** SVG ze `simple-icons` přes `BrandMark`, jednobarevné v inkoustu (`--ink`) v kroužku s výplní `--paper`. Chybějící ikona se nahradí monogramem. Nikdy nestahuj loga z jiných zdrojů bez rozhodnutí uživatele.
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
2. **CSP** se staví v `src/proxy.ts` s nonce a `strict-dynamic`. `script-src` nikdy neobsahuje `unsafe-inline` ani `unsafe-eval` (ten jen ve vývoji). Vždy `base-uri`, `object-src 'none'`, `frame-ancestors`, `form-action`. Žádné zástupné znaky. `style-src 'unsafe-inline'` je povolený jen kvůli Motion a je zapsaný v `DECISIONS.md`.
3. **Každá doména v CSP** má řádek v `.claude/security/CSP-LOG.md` (co ji potřebuje a proč). Očekávané: PostHog (EU) v `connect-src`. Stripe se používá jen přesměrováním na hostovanou stránku.
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
