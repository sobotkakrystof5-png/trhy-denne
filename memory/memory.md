# MEMORY: aktuální stav

Co se skutečně stalo, jaký je stav a proč. Pravidla formátu: `pravidla.md`.

## Aktuální stav
- **Projekt:** Trhy denně (pracovní název), placený newsletter o amerických akciích a indexech s vlastním výběrem položek podle tarifu.
- **Fáze:** Fáze 0, kroky 1 až 3 hotové, čeká se na zastávku (krok 4). Projekt je založený, `npm run build` i `npm run lint` jsou čisté.
- **Stack (nainstalováno):** Next.js 16.3.7 (App Router, Turbopack), React 19.2.8, TypeScript 5, Tailwind CSS v4, ESLint 9. Zatím **nenainstalováno**: Motion, Drizzle, `@neondatabase/serverless`, Zod, Stripe, Resend, PostHog, Better Auth, `simple-icons`, písma Fontsource.
- **Vzhled:** neo-brutalistický papírový styl podle cr-8.cz (od 2026-09-29). Reference v `reference/`. Zatím nic nepostaveno, `/` je výchozí šablona z `create-next-app`.
- **Co existuje:** dokumenty a holá kostra Next.js. Data na budoucím webu budou zatím **ukázková**.
- **Git:** projekt **nemá vlastní repozitář**, spadá pod repozitář v domovské složce `/Users/krystofsobotka`. Viz Otevřené otázky.

## Klíčová rozhodnutí
Nebudou se znovu otevírat bez výslovného pokynu uživatele.
- **2026-09-29:** Prodejní stránka je jedna stránka s kotvami (`#jak`, `#dashboard`, `#analyzy`, `#cenik`, `#faq`, `#objednat`) plus samostatné trasy účtu a právních stránek. Důvod: schválené uživatelem při návrhu navigace.
- **2026-09-29:** Samostatná ukázková stránka `/ukazka` se nedělá. Důkaz hodnoty dělá živý dashboard. Důvod: uživatel ukázkový report zatím nemá a rozhodl se ho vynechat.
- **2026-09-29:** Klient si vybírá vlastní akcie a indexy podle tarifu (Start 5, Plus 25, Pro 100). Vitrína na webu (asi 18 akcií a 2 indexy) je jen příklad, uložená v databázi. Důvod: upřesnění uživatele.
- **2026-09-29:** Veřejné demo dashboardu ukazuje jen položky s čerstvými daty. Pro ostatní vrací stav "data budou k dispozici po přidání do výběru". Důvod: stahování cen na požádání pro anonymní návštěvníky by stálo peníze u datového API.
- **2026-09-29:** LLM a Tavily se volají jen pro položky s výrazným pohybem. Ostatní dostanou šablonový text. Důvod: náklady mají růst s počtem pohybů, ne s počtem sledovaných položek.
- **2026-09-29:** Webhook Stripe přijímá Next.js, n8n dostává jen podepsané navazující události. Důvod: spolehlivost podpisu a nezávislost propsání platby na běhu n8n.
- **2026-09-29:** Veřejně je popis položky, čísla a graf. Vysvětlení příčiny pohybu se zdroji je jen ve Start a Plus. Důvod: plná analýza zdarma by brala důvod platit.
- **2026-09-29:** Ikony firem jsou jednobarevné SVG ze `simple-icons`, chybějící se nahradí monogramem. Důvod: požadavek uživatele na SVG ikony firem. Právní stránka viz Otevřené otázky.
- **2026-09-29:** Písma jsou balíčky Fontsource, ne Google Fonts. Důvod: přísné CSP bez externích zdrojů. (Konkrétní písma původně Newsreader a Hanken Grotesk, **nahrazena** rozhodnutím o vzhledu níže. Zásada self-hosted platí dál.)
- **2026-09-29:** Směr vzhledu je neo-brutalistický papírový styl podle cr-8.cz: krémové pozadí s mřížkou 40 px, černá hlavička, pastelové karty (mist, sand, salmon) s 3 px černým okrajem a tvrdým stínem, černá tlačítka s velkými písmeny a šipkou, jedna zvýrazněná fráze v lososovém rámečku. Písma Space Grotesk a Montserrat (odhad ze screenshotů). Podpis webu: kurzovní pás, tabule v rámu, křivky v inkoustu, barva nesoucí význam. **Nahrazuje** původní tmavý směr (lahvově zelená, mosaz, Newsreader). Důvod: pokyn uživatele se screenshoty cr-8. Tento směr má podle skillu `design-taste-frontend` přednost před jeho obecným seznamem "výchozích voleb". Sekce 0 zadání byla přepsána, princip "žádná generická šablona ani kopie" zůstává.
- **2026-09-29:** CSP s nonce přes `proxy.ts`, tedy dynamické vykreslování všech stránek. `style-src 'unsafe-inline'` je povolený kvůli Motion. Důvod: požadavek skillu `web-security-setup` na přísné CSP bez `unsafe-inline` pro skripty. Cena: ztráta statické keše stránek.

## Otevřené otázky
Čekají na uživatele. Po zodpovězení smazat. Plný seznam s návrhy řešení je v `PROJECT-BRIEF.md`, sekce 13.
- **Git:** založit v `Desktop/SHARES.cz` vlastní repozitář (potřeba pro nasazení z Gitu na Vercel), nebo řešit jinak. Dnes je kořenem repozitáře domovská složka, která obsahuje i cizí projekty a vlastní `package.json` s `node_modules`.
- Název značky a doména.
- Které datové API a jaké jsou jeho licenční podmínky pro komerční a veřejné zobrazení.
- Indexy: ETF jako zástupce (SPY, QQQ), nebo licencovaný index.
- Rozsah trhů: jen USA, nebo i další.
- Ranní doručení út až so, nebo po až pá.
- Práh výrazného pohybu podle tarifu (návrh 3 % všude, případně 1,5 % pro Plus).
- Lhůta po neúspěšné platbě (návrh 7 dní).
- Loga a ochranné známky, právní posouzení.
- Cookie lišta a režim PostHog.
- Právní texty a znění souhlasů, DPH a Stripe Tax, forma podnikání, konkurenční doložka.
- **CSP: nonce, nebo experimentální SRI?** Next.js 16 nabízí `experimental.sri` (hash skriptů při buildu), které zachovává statické stránky a keš na CDN. Rozhodnutí z 2026-09-29 (nonce přes `proxy.ts`) vzniklo bez této možnosti a platí, dokud ho uživatel nezmění. SRI je označené jako experimentální.
- **`style-src` v produkci.** Dokumentace Next.js doporučuje `style-src 'nonce-...'`. Rozhodnutí z 2026-09-29 povoluje `'unsafe-inline'` kvůli Motion. Ověřit ve fázi 1, jestli to Motion opravdu vyžaduje.
- Kontakt pro `security.txt`.
- Knihovna přihlášení (návrh Better Auth, ověřit aktuální stav).
- Reference ben.ai a chase.ai: ben.ai se načetlo jen jako text (osobní web s videem), chase.ai blokuje automatický přístup. Uživatel dodá screenshoty a řekne, co z nich chce.
- Přesná písma cr-8 (Space Grotesk a Montserrat jsou odhad).
- Logo a název značky (kroužek z cr-8 se nekopíruje).

## Záměrně nedělám
Aby to další relace neopravila jako chybu.
- **`/ukazka`.** Vědomě vynecháno, viz Klíčová rozhodnutí.
- **Odpolední report (Plus) a tarif Pro s alerty.** Podle plánu se staví později. Ceník to říká otevřeně, dokud to neexistuje.
- **Plynulý scroll (Lenis) a GSAP.** Navrženo, ale neschváleno. Přidat jen s důvodem.
- **Animované pozadí ze sítě bodů a ilustrace robota z uzlů** (podpisové prvky cr-8). Vědomě se nekopírují.
- **Prvky z ben.ai a chase.ai.** Nebyly vizuálně posouzeny, nepřebírá se nic.
- **Odkaz "Přihlásit" v navigaci.** Přibude až s trasou `/prihlaseni` (fáze 3).
- **Indexování webem.** Web je `noindex` do rozhodnutí o spuštění.
- **HSTS `preload`.** Až po měsíci čistého provozu.
- **Evropské trhy.** Vyžadují jiné časy, kalendář a data.
- **Živé ceny na veřejném webu.** Vyžadují dražší licenci. Vitrína ukazuje data po uzavření burzy.
- **Právní texty.** Nepíše je Claude, jen prázdné stránky s upozorněním.

## Seznam změn
Nejnovější nahoře.

### 2026-09-29: Založení Next.js projektu (fáze 0, kroky 2 a 3)
- **Co:** Kostra vytvořena `create-next-app` 16.3.7 (TypeScript, Tailwind v4, App Router, `src/`, ESLint, alias `@/*`, bez inicializace gitu) v dočasné složce a nakopírována do projektu, aby se nepřepsaly `AGENTS.md`, `CLAUDE.md`, `PROJECT-BRIEF.md`, `memory/` a `reference/`. Vygenerované `AGENTS.md` a `CLAUDE.md` se nepoužily, projektové zůstávají. Název balíčku nastaven na `trhy-denne`. V `next.config.ts` nastaven `turbopack.root` na složku projektu. Přečtena lokální dokumentace `01-app/01-getting-started/16-proxy.md` a `01-app/02-guides/content-security-policy.md`.
- **Proč:** na pokyn uživatele, krok 2 a 3 fáze 0 zadání. `turbopack.root` kvůli tomu, že Next.js hlásil ignorovaný `package-lock.json` v domovské složce a odvozoval si kořen mimo projekt.
- **Dopad:** Blok `nextjs-agent-rules` v `AGENTS.md` zůstal nedotčený. Dokumentace potvrdila postup pro fázi 1: nonce se generuje v `proxy.ts`, Next.js ho sám doplní svým skriptům, podmínkou je dynamické vykreslování. Dvě věci k rozhodnutí ve fázi 1 jsou v Otevřených otázkách (SRI, `style-src`). Git repozitář není projektový, viz Otevřené otázky.
- **Soubory:** `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `next-env.d.ts`, `.gitignore`, `README.md`, `src/app/` (`layout.tsx`, `page.tsx`, `globals.css`, `favicon.ico`), `public/`, `AGENTS.md`, `memory/index.md`, `memory/memory.md`

### 2026-09-29: Výměna skillu frontend-design za taste-skill
- **Co:** Smazán `.claude/skills/frontend-design`. Přidán `.claude/skills/design-taste-frontend` (SKILL.md v2 z https://github.com/leonxlnx/taste-skill, složka `skills/taste-skill`, licence MIT). Odkazy na `frontend-design` v `AGENTS.md`, `CLAUDE.md`, `PROJECT-BRIEF.md` přejmenovány.
- **Proč:** Na pokyn uživatele.
- **Dopad:** Texty v dokumentech stále popisují postup starého skillu (návrh, kritika, stavba, sebekritika) a přednost zadání cr-8 před "výchozími volbami". Taste-skill má vlastní pravidla (dials VARIANCE/MOTION/DENSITY, zákaz em-pomlček), takže popis je potřeba ověřit a upravit. Ostatní varianty z repozitáře nenainstalovány.
- **Soubory:** `.claude/skills/design-taste-frontend/`, `AGENTS.md`, `CLAUDE.md`, `PROJECT-BRIEF.md`, `memory/memory.md`

### 2026-09-29: Přenesení sady do projektu SHARES.cz
- **Co:** Do kořene projektu zkopírovány `AGENTS.md`, `CLAUDE.md`, `PROJECT-BRIEF.md`, `memory/` (index, pravidla, memory) a `reference/` ze složky `trhy-denne-kit`. Do `.claude/skills/` zkopírovány lokální skills z AGENTS.md: `project-memory-system`, `web-project-brief`, `frontend-design`, `humanize-text-cs`, `web-security-setup`. Prázdné původní `AGENTS.md` a `CLAUDE.md` přepsány.
- **Proč:** Na pokyn uživatele.
- **Dopad:** Izolované. `web-security-audit` a `web-security-review` nejsou v systému dostupné, nezkopírovány.
- **Soubory:** `AGENTS.md`, `CLAUDE.md`, `PROJECT-BRIEF.md`, `memory/`, `reference/`, `.claude/skills/`

### 2026-09-29: Změna směru vzhledu na styl cr-8
- **Co:** V `PROJECT-BRIEF.md` přepsány sekce 0 (směr a zákazy), 2 (designový systém s přesnými hodnotami), 4 (kompozice sekcí) a 14 (výsledný dojem). Upraveny odkazy v sekcích 3, 8, 11, 12 a 13. Do `reference/` přidány dva screenshoty cr-8.cz. Aktualizovány `CLAUDE.md` (sekce 5), `AGENTS.md` (písma, tokeny, struktura) a `memory/index.md`.
- **Proč:** na pokyn uživatele se screenshoty cr-8.cz. Barvy (`#0C0C0A`, `#F9F3E5`, `#E4B9A0`, `#CED9DD`, `#EBD69D`), mřížka 40 px, 3 px okraj a tvrdý stín byly změřeny z pixelů screenshotů.
- **Dopad:** mění všechna designová rozhodnutí. Backend, zabezpečení a obsah se nemění. Barvy `--paper`, `--mute`, `--mint`, `--rose`, `--gain-ink`, `--loss-ink` jsou doplněny (cr-8 je nemá). Referenční šedá popisků nesplňuje kontrast AA, proto je zesílená.
- **Soubory:** `PROJECT-BRIEF.md`, `CLAUDE.md`, `AGENTS.md`, `memory/index.md`, `memory/memory.md`, `reference/cr8-home.png`, `reference/cr8-asistent.png`

### 2026-09-29: Napsané zadání a paměť (Fáze 0)
- **Co:** Napsány `PROJECT-BRIEF.md`, `CLAUDE.md`, `AGENTS.md` a `memory/` (index, pravidla, memory). Zadání shrnuje schválený plán, návrh webu, backend, zabezpečení, skills a fáze se zastávkami.
- **Proč:** na pokyn uživatele, jako podklad pro Claude Code.
- **Dopad:** definuje všechny další fáze. Změny oproti původnímu plánu z 28. 9. 2026 (klient volí vlastní položky, `plan_limits`, `price_history`, render reportů přes Next.js, webhook Stripe v Next.js, práh pohybu) jsou v `PROJECT-BRIEF.md`, sekce 5.8.
- **Soubory:** `PROJECT-BRIEF.md`, `CLAUDE.md`, `AGENTS.md`, `memory/index.md`, `memory/pravidla.md`, `memory/memory.md`
