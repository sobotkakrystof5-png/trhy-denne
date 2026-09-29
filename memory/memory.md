# MEMORY: aktuální stav

Co se skutečně stalo, jaký je stav a proč. Pravidla formátu: `pravidla.md`.

## Aktuální stav
- **Projekt:** Trhy denně (pracovní název), placený newsletter o amerických akciích a indexech s vlastním výběrem položek podle tarifu.
- **Fáze:** Fáze 1 (kostra a zabezpečení) hotová, čeká se na zastávku. Sekce prodejní stránky staví fáze 2.
- **Stack (nainstalováno):** Next.js 16.3.7 (App Router, Turbopack), React 19.2.8, TypeScript 5, Tailwind CSS v4, ESLint 9. Dále Motion a písma `@fontsource-variable/space-grotesk` a `montserrat`. Zatím **nenainstalováno**: Drizzle, `@neondatabase/serverless`, Zod, Stripe, Resend, PostHog, Better Auth, `simple-icons`, písma Fontsource.
- **Vzhled:** neo-brutalistický papírový styl podle cr-8.cz (od 2026-09-29). Reference v `reference/`. Stojí tokeny, obě písma, mřížka, horní pruh, hlavička se scrollspy a mobilním menu, kurzovní pás a základní komponenty. `/` je zatím přehled hotových dílů, ne prodejní stránka.
- **Co existuje:** dokumenty a kostra webu. Kurzovní pás běží na **ukázkových datech** ze `src/data/sample.ts` a web to říká nahlas štítkem v pásu.
- **Git:** vlastní repozitář v `Desktop/SHARES.cz`, větev `main`, první commit `6a87d61`. Žádný vzdálený repozitář zatím není.

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

- **2026-09-29:** Projekt má vlastní git repozitář v `Desktop/SHARES.cz`, větev `main`. Domovský repozitář v `/Users/krystofsobotka` se nechává být, projekt do něj nepatří. Důvod: Vercel nasazuje z Gitu a kořen v domovské složce míchal dohromady cizí projekty.
- **2026-09-29:** Písma jsou **Space Grotesk** (nadpisy, popisky, tlačítka, čísla) a **Montserrat** (text), oboje z `@fontsource-variable`. Důvod: uživatel potvrdil odhad ze screenshotů cr-8.
- **2026-09-29:** Do rozhodnutí o značce se používá pracovní název **Trhy denně**, držený jedinou proměnnou v `src/lib/site.ts`, a textový znak místo loga. Důvod: pokyn uživatele, aby se pozdější přejmenování dalo udělat na jednom místě.

- **2026-09-29:** `style-src` je bez `'unsafe-inline'`, i když s ním zadání počítalo. Ověřeno v prohlížeči: kostra nemá jediný inline styl a CSP nic nehlásí. Hodnoty počítané za běhu se nastavují přes CSSOM. Důvod: politika se zeslabuje jen tehdy, když to opravdu nejde jinak.
- **2026-09-29:** `security.txt` se zatím **nenasazuje**. Leží jako šablona v `.claude/security/security.txt.template`. Důvod: kontakt není rozhodnutý a zástupná adresa v `security.txt` slibuje cestu hlášení, která nikam nevede.

## Otevřené otázky
Čekají na uživatele. Po zodpovězení smazat. Plný seznam s návrhy řešení je v `PROJECT-BRIEF.md`, sekce 13.
- Název značky a doména. Do rozhodnutí se používá pracovní název Trhy denně z `src/lib/site.ts`.
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
- Kontakt pro `security.txt`.
- Knihovna přihlášení (návrh Better Auth, ověřit aktuální stav).
- Reference ben.ai a chase.ai: ben.ai se načetlo jen jako text (osobní web s videem), chase.ai blokuje automatický přístup. Uživatel dodá screenshoty a řekne, co z nich chce.
- Logo (kroužek z cr-8 se nekopíruje). Do rozhodnutí je značka jen textový znak v `BrandMark`.

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

### 2026-09-29: Fáze 1, kostra a zabezpečení
- **Co:** Designové tokeny z 2.2 až 2.4 v `@theme` v `globals.css`, obě písma self-hosted přes Fontsource, pozadí s mřížkou 40 px. Komponenty: `SiteHeader` (přilepený celek pruh, hlavička, pás), `Header` se scrollspy přes IntersectionObserver a mobilním panelem, `ScrollProgress`, `TickerTape` s `TickerTrack`, `BrandMark`, `Button`, `Card`, `ChangeChip`, `Badge`, `SectionDivider`. Pomocníci `src/lib/site.ts` a `src/lib/format.ts`. Ukázková data v `src/data/sample.ts`. `src/proxy.ts` s CSP a nonce plus ostatní hlavičky, hlavičky pro `/api` v `next.config.ts`, `poweredByHeader: false`. Složka `.claude/security/` a workflow `.github/workflows/security.yml`. Stránka `/` je zatím přehled hotových dílů.
- **Proč:** kroky 5 až 7 fáze 1 zadání.
- **Dopad:** Ruší se potřeba `style-src 'unsafe-inline'`, `AGENTS.md` opraven. `security.txt` se nenasazuje, viz Klíčová rozhodnutí. Sekce prodejní stránky a Motion přijdou ve fázi 2, do té doby není ověřené, jestli si Motion inline styly vynutí.
- **Soubory:** `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/proxy.ts`, `src/components/`, `src/lib/`, `src/data/sample.ts`, `next.config.ts`, `.claude/security/`, `.github/workflows/security.yml`, `AGENTS.md`

### 2026-09-29: Co našla kontrola fáze 1 a co se opravilo
- **Co:** Tři chyby nalezené měřením, ne odhadem. (1) Rychlost pásu se nastavovala atributem `style` v HTML, který nonce nepokrývá a přísné `style-src` by ho zablokovalo. Nahrazeno zápisem přes CSSOM v `TickerTrack`, což navíc drží konstantních 60 px/s bez ohledu na počet položek a šířku písma. (2) Utilita `overflow-hidden` v JSX přebíjela pravidlo pro `prefers-reduced-motion`, takže pás u těch uživatelů zamrzl a nešel dočíst. Přetečení se řídí z CSS. (3) Štítek ukázkových dat zabíral na mobilu třetinu šířky, zkrácen na "Ukázka", plné znění zůstává ve skrytém odstavci pro čtečky.
- **Proč:** kontrola podle kroku 8 fáze 1 a sekce 2.1.
- **Dopad:** Ověřeno v Chrome na 1440 a 390 px: žádné porušení CSP, čistá konzole, žádný vodorovný přetok, tabulátor projde hlavičku v pořadí a každý prvek má viditelný obrys, pás se zastaví najetím i fokusem, při omezeném pohybu stojí a jde posouvat, mobilní menu se otevře a zavře Escapem. Kontrast: 15 dvojic z designového systému, všechny nad AA, nejnižší `--gain-ink` na krému 4,81.
- **Soubory:** `src/components/TickerTape.tsx`, `src/components/TickerTrack.tsx`, `src/components/ScrollProgress.tsx`, `src/app/globals.css`, `.claude/security/AUDIT-LOG.md`

### 2026-09-29: Návrh a kritika vzhledu (fáze 1, krok 6, povinný krok 2.1)
- **Co:** Zapsán návrh rozvržení kostry a jeho kritika, viz níže. Tokeny jsou dané zadáním, návrh řeší rozvržení a principy.
- **Proč:** sekce 2.1 zadání to vyžaduje před psaním UI.
- **Dopad:** řídí stavbu ve fázi 1. Odchylky od změřených hodnot se zapíší po porovnání se screenshoty.
- **Soubory:** `memory/memory.md`

**Návrh: trvalé prvky (to, co staví fáze 1)**

```
┌──────────────────────────────────────────────────────────┐  6 px salmon, scaleX podle scrollu
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
├──────────────────────────────────────────────────────────┤
│ ◯ Trhy denně │ PŘEHLED AKCIÍ V E-MAILU    NAV NAV NAV [CTA]│ 72 px, ink
├══════════════════════════════════════════════════════════┤  3 px ink
│[UKÁZKOVÁ DATA] NVDA +1,84 % ▲ ◇ AAPL −0,42 % ▼ ◇ SPY ... │ 44 px, cream
├══════════════════════════════════════════════════════════┤  3 px ink
│                                                          │
│   krémová plocha s mřížkou 40 px                         │
```

Mobil: hamburger 44 px vpravo, panel ink přes celou šířku pod hlavičkou. Pás zůstává.

**Principy, které si kostra nese dál**

1. Tři vodorovné linky nad sebou (pruh, hlavička, pás) tvoří "hlavu tabule". Pás je součást identity, ne ozdoba, proto má stejné 3px linky jako karty.
2. Mřížka je jen na krémových plochách. Na ink a salmon pruzích se vypíná.
3. Pohyb je vždy odvozený z dat nebo z akce uživatele. Pás běží, protože kurzy běží. Pruh roste, protože roste pozice ve stránce.
4. Barva nese význam. V kostře to znamená: salmon jen na CTA, na horním pruhu a na štítku ukázkových dat. Nikde jinde.
5. Každá komponenta má tři stavy mechaniky: klid, hover (posun proti stínu), active (zapadnutí do stínu). Bez výjimky, i u karet.

**Kritika návrhu proti zadání (co vypadalo jako výchozí volba nebo jako kopie cr-8 a co jsem s tím udělal)**

| Co bylo podezřelé | Jak to bylo | Co s tím |
| --- | --- | --- |
| Logo s kroužkem | cr-8 má kroužek a název. Kroužek je jeho podpis. | Kroužek nekopíruju. `BrandMark` značky je čtverec 32 px se 3px okrajem, uvnitř dvě vodorovné linky různé délky (sloupcový zápis kurzu). Drží papírový jazyk, ale patří finančnímu produktu. |
| Popisek vedle loga | cr-8 má "AI BACK OFFICE" za svislou čárou. | Formu přebírám (je to jazyk, ne podpis), text je vlastní a pravdivý. Na mobilu se skrývá. |
| Kurzovní pás jako běžící text | Sám o sobě je to klišé webů z roku 2015 a bývá to dekorace. | Nese skutečná čísla, dá se zastavit najetím i fokusem, při `prefers-reduced-motion` stojí a jde posouvat prstem. Vedle něj je skrytý seznam pro čtečky. Kdyby nenesl data, vyhodím ho. |
| Horní pruh jako scroll indikátor | Standardní ozdoba, na většině webů nic neříká. | Zadání ho chce a má jeden dobrý důvod: je to jediný trvalý pohyb navázaný na scroll, takže nahrazuje obvyklé animace sekcí, které zadání zakazuje. Ponechávám. |
| Mřížka na pozadí | Riziko, že bude vypadat jako výchozí "graph paper" šablona. | Necháváme 40 px podle měření a kontrast čar držíme nízký (`#EFEADB` na `#F9F3E5`). Mřížka se nesmí objevit na barevných pruzích, jinak z ní je vzorek. |
| Segmentové ovladače, štítky a pole z knihovny | shadcn ve výchozím vzhledu je podle zadání chyba. | Základní komponenty píšu ručně na tokeny. shadcn zatím vůbec neinstaluju, ať nevznikne pokušení. |

**Sebekritika (odebrat jednu ozdobu navíc):** návrh měl mezi položkami pásu kosočtverce a zároveň svislé linky jako u cr-8 karet. Svislé linky ruším, zůstává jen kosočtverec. Pás má být čitelný, ne vzorovaný.

### 2026-09-29: Vlastní git repozitář a zodpovězené otázky k fázi 1
- **Co:** Založen repozitář v `Desktop/SHARES.cz` (`git init -b main`), první commit `6a87d61` se vším z fáze 0. Ověřeno, že domovský repozitář nesledoval ani jeden soubor projektu a že `node_modules` ani nic citlivého není v indexu. Do `.gitignore` doplněn `*.key`. Uživatel potvrdil písma Space Grotesk a Montserrat a pracovní název Trhy denně.
- **Proč:** na pokyn uživatele. `*.key` chyběl oproti bezpečnostním pravidlům v `AGENTS.md`, bod 5, a nemělo smysl zakládat historii s touto dírou.
- **Dopad:** Odblokovává fázi 1 (typografie a `site.ts`). Otázky na písma a git smazány z Otevřených otázek, odpovědi přesunuty do Klíčových rozhodnutí. Název značky a logo zůstávají otevřené, jen mají dočasné řešení. Vzdálený repozitář a propojení s Vercelem zatím nejsou.
- **Soubory:** `.git/`, `.gitignore`, `memory/memory.md`

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
