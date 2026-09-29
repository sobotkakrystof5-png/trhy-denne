# ZADÁNÍ PRO CLAUDE CODE: Trhy denně (pracovní název)

Vlož tento dokument jako první úkol do Claude Code v novém repozitáři. Sousední soubory (`CLAUDE.md`, `AGENTS.md`, `memory/`) patří do kořene stejného repozitáře. Podle nich se řídí každá další relace.

Stav k 29. 9. 2026. Ceny API, limity služeb a právní detaily je před spuštěním nutné ověřit. Dokument není právní ani účetní poradenství.

**Aktualizace vzhledu (29. 9. 2026):** směr vzhledu se změnil z tmavého "soukromá banka" na neo-brutalistický papírový styl podle cr-8.cz (screenshoty v `reference/`). Týká se sekcí 0, 2, 4 a 14. Ostatní sekce (obsah, backend, zabezpečení, fáze) platí beze změny.

---

## 0. KRITICKÉ: SMĚR VZHLEDU A ZÁKAZ "AI ŠABLONY"

Tohle je nejdůležitější pokyn v celém zadání a ovlivňuje každé rozhodnutí níže.

### 0.1 Směr vzhledu určil uživatel

Vzhled vychází ze screenshotů webu **cr-8.cz** (`reference/cr8-home.png`, `reference/cr8-asistent.png`): **neo-brutalistický "papírový" styl**. Krémové pozadí s jemnou mřížkou, černá hlavička, pastelové karty s tlustým černým ohraničením a tvrdým (nerozmazaným) stínem, černá tlačítka s velkými písmeny a šipkou, zvýrazněná fráze v lososovém rámečku, popisky velkými prostrkanými písmeny, tečkovaná předěl s kosočtvercem.

Tento směr je **závazný a má přednost** před obecnými zákazy ze skillu `design-taste-frontend` tam, kde s nimi kolidují. Skill sám říká, že u pevně zadaného směru platí slova zadání, i když je to jeden z jeho "výchozích" vzhledů. Proto jsou v tomto projektu **povolené a žádoucí**:

- krémové pozadí a lososový akcent,
- popisky velkými prostrkanými písmeny (`UPPERCASE`, prostrkání),
- šipka `→` na tlačítkách,
- zvýrazněná fráze v nadpisu v barevném rámečku,
- řada tří karet různých pastelových barev,
- čísla `01 / 02 / 03` u kroků, které jsou skutečná posloupnost.

Postup skillu `design-taste-frontend` (návrh, kritika návrhu, stavba, sebekritika) a jeho pravidla pro texty, přístupnost a omezení pohybu **platí dál**.

### 0.2 Web nesmí být generická šablona ani kopie cr-8

Uživatel chce stejný jazyk, ne stejný web. Vzhled musí vypadat, jako by ho pro **finanční produkt** navrhl a ručně doladil zkušený designér.

**Vyhni se:**

- fialovo-modrým a duhovým gradientům, glassmorphismu, generickým 3D ilustracím, nezměněným sadám ikon,
- výchozímu vzhledu shadcn/Tailwind. Každá komponenta z knihovny se musí přestylovat na tokeny z 2.2 až 2.5 (ohraničení, stín, radius, písmo). Komponenta ve výchozím vzhledu je chyba,
- rozmazaným měkkým stínům (`blur`), stínům "SaaS karet" a jemným šedým ohraničením 1 px. Tento styl žije z tvrdých stínů a tlustých čar,
- animaci "fade-in a posun nahoru" na všem při scrollu,
- vatě místo textu ("Jsme tým profesionálů", "Kvalita je naší prioritou") a lorem ipsum,
- stejnému odsazení a stejné kompozici v každé sekci. Řada tří stejně velkých karet se smí objevit nejvýš **jednou** (Jak to funguje). Ostatní sekce mají vlastní kompozici (viz 4),
- **kopírování prvků z cr-8:** animované sítě bodů v pozadí, ilustrace robota z uzlů, loga s kroužkem, textů a stavby nadpisu "Moje AI Řešení". Přebíráme jazyk (tvary, barvy, čáry, stíny, písma), ne obsah a podpisové prvky.

**Místo toho podpis tohoto webu (finanční motivy, které cr-8 nemá):**

1. **Kurzovní pás (ticker tape)** pod hlavičkou, běžící řada položek se změnou. Pohyb, který má obsahový důvod.
2. **Tabule v rámu:** výřez dashboardu v hero uvnitř velkého zaobleného rámu s tvrdým stínem (funkční protějšek robota z cr-8).
3. **Křivka v inkoustu:** grafy jsou černé, tlusté a jednou se nakreslí. Koncový bod je lososový kroužek.
4. **Barva nese význam** (2.2): modrošedá je index, písková akcie, lososová "je ve vašem výběru", mátová růst, růžová pokles. Barvu nikdy nepoužívej jen jako dekoraci.
5. **Mechanická interakce tlačítka:** karta a tlačítko se při najetí posunou proti stínu a při stisku "zapadnou" do stínu.
6. **Počítadlo míst:** řada čtverců (obsazeno a volno) ukazuje limit tarifu v dashboardu.

Pokud si nejsi jistý, jestli prvek nepůsobí šablonovitě nebo jako kopie, zeptej se nebo navrhni originálnější variantu.

---

## 1. KONTEXT PRODUKTU A OBSAH

**Produkt:** placený newsletter s denními (a týdenními) reporty o amerických akciích a indexech. Klient si sám vybírá, které akcie a indexy chce sledovat. Počet položek závisí na tarifu. Web je prodejní stránka, registrace, správa výběru a předplatného.

**Cíl webu:** návštěvník do minuty pochopí, co dostane, uvidí to na živém dashboardu, přihlásí se k Free odběru a časem přejde na placený tarif.

**Tón:** věcný, klidný, bez nadšených superlativů a bez "investičního žargonu pro zasvěcené". Mluví se o tom, co se stalo, ne co dělat.

**Pracovní název:** Trhy denně. Rozhodnutí o značce a doméně je otevřená otázka (sekce 13). Název je jen na jednom místě (`src/lib/site.ts`).

### 1.1 Tarify

| | **Free** | **Start** | **Plus** | **Pro** (později) |
| --- | --- | --- | --- | --- |
| Cena/měs. | 0 Kč | 79 Kč | 129 Kč | 249 Kč |
| Reporty | 1× týdně (neděle) | 1× denně (ráno) | 2× denně (ráno a odpoledne po otevření Wall Street) | 3× denně a alerty |
| Obsah | 3 největší pohyby týdne | přehled S&P 500, největší růsty a propady | navíc vysvětlení příčin se zdroji, kalendář výsledků a dividend | navíc analýza sektorů, týdenní souhrn |
| Vlastní výběr | ne | 5 položek | 25 položek | 100 položek |
| Archiv | ne | ne | 90 dní | celý |

Pravdivost slibů: odpolední report (Plus) a celý tarif Pro se podle plánu staví později. Ceník to musí říkat otevřeně ("brzy", "připravujeme"), dokud to neexistuje. Web nesmí prodávat funkci, kterou nedodává.

### 1.2 Pravidla obsahu (regulace, závazná)

- Text je vždy fakticky popisný. Žádné "kup" nebo "prodej", žádné cílové ceny.
- Každé tvrzení o příčině pohybu má zdroj (odkaz z Tavily). Bez zdroje se tvrzení nepíše.
- Čísla (ceny, procentní změny) pocházejí výhradně z datového API. Jazykový model je nikdy nepíše ani neopravuje.
- Před odesláním se čísla v textu porovnají s daty z API. Report, který neprojde kontrolou, se neodešle.
- Disclaimer v patičce webu i každého e-mailu: "Nejde o investiční doporučení."
- Web smí říct, že text shrnutí připravuje jazykový model. Nesmí naznačovat, že čísla píše AI.

### 1.3 Co dostane klient, když se akcie nehýbe

Vysvětlení příčin se hledá jen pro položky s výrazným pohybem (práh viz sekce 5.8). Ostatní položky dostanou v reportu čísla, graf a jednu šablonovou větu ("Bez výrazného pohybu"). Web to říká na rovinu, aby slib "analýza každý den" nebyl zavádějící. Slib zní: každý den dostanete přehled všech svých položek a vysvětlení tam, kde se něco stalo.

---

## 2. DESIGNOVÝ SYSTÉM

### 2.0 Reference a jejich stav

| Reference | Stav | Co se z ní bere |
| --- | --- | --- |
| cr-8.cz (2 screenshoty v `reference/`) | **primární, prohlédnuto a rozměřeno** | celý vizuální jazyk: barvy, tvary, čáry, stíny, písma, rozložení hlavičky, tlačítek a karet |
| ben.ai | načteno jen jako text. Jde o osobní web hudebního technologa (video v záhlaví, minimum textu). **Vizuálně neposouzeno** | zatím nic |
| chase.ai | web blokuje automatický přístup. **Nepřístupné** | zatím nic |

Uživatel zmínil ben.ai a chase.ai jako inspiraci. Dokud nedodá screenshoty, **žádné prvky z nich nepřebírej** a nehádej, jak vypadají. Až screenshoty dorazí, zapiš do `memory/memory.md`, co se z nich bere, a případné rozpory s tímto systémem nech uživatele rozhodnout.

Hodnoty níže jsou **změřené ze screenshotů** (zdroj: pixely obrázku). Rozměry v CSS pixelech jsou přepočtené z odhadu měřítka displeje 1,7 (mřížka po 68 px na snímku odpovídá 40 px v CSS), proto jsou u nich označení "přibližně". Při stavbě je porovnej se screenshotem vedle sebe a doladit.

### 2.1 Postup (povinný, skill `design-taste-frontend`)

Než napíšeš kód UI, udělej a zapiš do `memory/memory.md`:

1. Krátký návrh (tokeny, písma, layout, principy) s ASCII wireframy hlavních sekcí. Tokeny už jsou dané tímto zadáním, návrh je tedy hlavně layout a princip.
2. Kritiku proti tomuto zadání: co vypadá jako výchozí volba nebo jako kopie cr-8 a jak jsi to změnil a proč.

Teprve pak stav. Na konci každé fáze udělej snímek obrazovky, porovnej ho s `reference/` a zkontroluj mobil. Sebekritika: odeber jednu ozdobu navíc.

### 2.2 Barvy

Změřeno ze screenshotů (`měřeno`), ostatní jsou doplnění pro finanční obsah (`doplněno`), která cr-8 nemá.

| Token | Hodnota | Zdroj | Použití |
| --- | --- | --- | --- |
| `--ink` | `#0C0C0A` | měřeno | hlavička, patička, ohraničení, stíny, tlačítka, křivky |
| `--text` | `#1C1B17` | měřeno | běžný text |
| `--cream` | `#F9F3E5` | měřeno | pozadí stránky |
| `--cream-grid` | `#EFEADB` | měřeno | čáry mřížky na pozadí (1 px) |
| `--salmon` | `#E4B9A0` | měřeno | akcent: CTA v hlavičce, zvýrazněná fráze, horní pruh, "vybráno" |
| `--mist` | `#CED9DD` | měřeno | modrošedá karta: **indexy**, přehled trhu |
| `--sand` | `#EBD69D` | měřeno | písková karta: **akcie**, tarif Pro |
| `--paper` | `#FFFBF0` | doplněno | světlý neutrální povrch (formuláře, rozbalené panely) |
| `--mute` | `#6B665A` | doplněno | vedlejší text a popisky. Referenční šedá je světlejší a nesplňuje AA, proto zesílena |
| `--rule` | `#CFC8B6` | doplněno | tečkované předěly |
| `--mint` | `#BFE3CB` | doplněno | výplň štítku růstu |
| `--rose` | `#F0A9A2` | doplněno | výplň štítku poklesu |
| `--gain-ink` | `#1F7A4D` | doplněno | text a křivka růstu na krému |
| `--loss-ink` | `#B3392E` | doplněno | text a křivka poklesu na krému |

Sémantika barev karet:

- **Modrošedá** = index (S&P 500, Nasdaq-100).
- **Písková** = akcie.
- **Lososová** = "je v mém výběru" a doporučený tarif.
- **Paper** = neutrální nebo neaktivní.
- **Mátová a růžová** jen ve štítku změny, vždy s trojúhelníkem a znaménkem. Barva nikdy nenese význam sama. Záporné znaménko je skutečné minus (U+2212).

Poměr ploch: přes 80 % je krémová a černá, pastely jsou na kartách, lososová je vzácná (CTA, akcent, výběr).

Kontrast: zkontroluj WCAG AA pro každou dvojici (zvlášť `--mute` na `--cream`, `--gain-ink` a `--loss-ink` na `--cream` a `--paper`, bílý text na `--ink`). Nesplní-li dvojice AA, uprav odstín, ne pravidlo. Fokus na tmavém pozadí je lososový, na světlém černý.

### 2.3 Písmo

Písma jsou určená **odhadem ze screenshotů** (přesný název na cr-8 nemáme potvrzený). Uživatel je může upřesnit.

| Role | Písmo | Balíček |
| --- | --- | --- |
| Nadpisy, popisky, navigace, tlačítka, čísla | **Space Grotesk** | `@fontsource-variable/space-grotesk` |
| Běžný text | **Montserrat** | `@fontsource-variable/montserrat` |

- Self-hosted přes Fontsource, ne Google Fonts (CSP a nezávislost na externích zdrojích).
- Ověř, že oba mají plnou českou sadu (`latin-ext`) a že se načítají jen potřebné podmnožiny.
- Tabulkové číslice: `font-variant-numeric: tabular-nums lining-nums` na všech číslech pod sebou. Pokud Space Grotesk tabulkové číslice nevykreslí (ověř vizuálně na sloupci cen), použij pro čísla Montserrat.
- Řádek textu do 75 znaků.

Škála (počítač, od 1280 px. Na mobilu se zmenšuje přes `clamp`):

| Prvek | Písmo | Velikost | Řez | Prostrkání | Řádkování |
| --- | --- | --- | --- | --- | --- |
| H1 | Space Grotesk | `clamp(2.75rem, 7.2vw, 6.25rem)` | 700 | -0,03 em | 1,0 |
| H2 | Space Grotesk | `clamp(2rem, 4.4vw, 3.5rem)` | 700 | -0,02 em | 1,05 |
| H3 (nadpis karty) | Space Grotesk | 1,75 rem (28 px) | 700 | -0,01 em | 1,15 |
| Úvodní odstavec | Montserrat | 1,25 rem (20 px) | 400 | 0 | 1,55 |
| Text | Montserrat | 1,125 rem (18 px) | 400 | 0 | 1,65 |
| Malý text | Montserrat | 0,9375 rem (15 px) | 400 | 0 | 1,55 |
| Popisek (label) | Space Grotesk | 0,8125 rem (13 px) | 500 | 0,2 em | 1,3, `UPPERCASE` |
| Navigace | Space Grotesk | 0,875 rem (14 px) | 600 | 0,12 em | `UPPERCASE` |
| Tlačítko | Space Grotesk | 0,9375 rem (15 px) | 700 | 0,08 em | `UPPERCASE` |
| Cena velká | Space Grotesk | 1,75 rem (28 px), velká dlaždice 3,5 rem | 700 | -0,02 em | 1 |

Zvýraznění: v textu se smí tučně vyznačit **celá věta** (nejvýš jedna v odstavci), ne slovo uprostřed věty.

### 2.4 Tvary, čáry, stíny, pozadí

| Vlastnost | Hodnota |
| --- | --- |
| Ohraničení karet | 3 px `--ink` (změřeno 5 px na snímku, přibližně 3 px v CSS) |
| Ohraničení malých prvků (štítky, přepínače, kroužky) | 2 px `--ink` |
| Předěl uvnitř karty | 2 px `--ink` |
| Radius velké karty | 16 px |
| Radius malé dlaždice | 12 px |
| Radius tlačítka | 6 px (tlačítko CTA v hlavičce 2 px, téměř hranaté) |
| Radius rámu tabule v hero | 28 px |
| Radius štítku | 999 px |
| Tvrdý stín velký | `10px 10px 0 var(--ink)` (změřeno 16 px na snímku) |
| Tvrdý stín střední (dlaždice) | `6px 6px 0 var(--ink)` |
| Tvrdý stín tlačítko | `4px 4px 0 rgba(12,12,10,0.28)` (šedý, změřeno) |
| Mezera mezi kartami | 24 px na počítači, 16 px na mobilu (musí být větší než stín) |
| Šířka obsahu | `max-width: 1200px`, vodorovné odsazení 24 px (mobil 20 px) |
| Svislé odsazení sekce | `clamp(4rem, 10vw, 8rem)`, nestejné mezi sekcemi (viz 4) |
| Vnitřní odsazení karty | 36 px (mobil 24 px) |

**Žádné rozmazané stíny (`blur`) nikde.**

**Pozadí stránky:** `--cream` s mřížkou 40 px, čáry 1 px `--cream-grid`:

```css
background-color: var(--cream);
background-image:
  linear-gradient(var(--cream-grid) 1px, transparent 1px),
  linear-gradient(90deg, var(--cream-grid) 1px, transparent 1px);
background-size: 40px 40px;
```

Mřížka je jen na krémových plochách. Na plných barevných pruzích (ink, salmon) není.

**Horní pruh:** 6 px `--salmon` úplně nahoře. Naplňuje se podle postupu scrollu (`scaleX` z 0 do 1, počátek vlevo). Je to jediný trvalý pohyb navázaný na scroll.

**Předěl sekcí:** tečkovaná čára 1 px `--rule` na šířku obsahu, uprostřed prázdný kosočtverec (čtverec 14 px otočený o 45°, ohraničení 2 px `--ink`, výplň `--cream`). Použij mezi některými sekcemi, ne mezi všemi.

### 2.5 Komponenty (přesně)

**Hlavička.** Výška 72 px, `--ink`, přilepená nahoře pod horním pruhem. Vlevo logo: kroužek 32 px (ohraničení 3 px, bílý) a název bílým Space Grotesk 700 (pracovní název viz `src/lib/site.ts`). Volitelně svislá dělicí čára a popisek velkými písmeny šedý (`rgba(255,255,255,0.55)`), např. "PŘEHLED AKCIÍ V E-MAILU". Vpravo navigace (`UPPERCASE`, prostrkání, bílá 85 %, aktivní položka 100 % s lososovým podtržením 3 px) a **tlačítko CTA `--salmon` s černým textem**, hranaté (radius 2 px), výška 44 px, odsazení 28 px. Položky: Jak to funguje, Dashboard, Analýzy, Ceník, FAQ. CTA: "Odebírat". Scrollspy. Na mobilu hamburger (čtverec 44 px, 3 px ohraničení) otevírá panel `--ink` přes celou šířku.

**Kurzovní pás.** Pod hlavičkou, výška 44 px, `--cream`, 3 px `--ink` nahoře i dole. Vlevo pevný lososový štítek "UKÁZKOVÁ DATA" (dokud nejsou data skutečná). Dále položky `TICKER +1,84 % ▲` (Space Grotesk 600, 14 px, `UPPERCASE`, prostrkání 0,08 em, změna v `--gain-ink` nebo `--loss-ink`), oddělené malým kosočtvercem. Plynulý běh zprava doleva (asi 60 px/s), zdvojený řetěz pro plynulé opakování (kopie s `aria-hidden`). Při najetí a při fokusu se zastaví. Při `prefers-reduced-motion` se nehýbe a dá se posouvat vodorovně. Pás není odkaz. Přístupný obsah je samostatný skrytý seznam.

**Tlačítko primární.** `--ink` výplň, text `--cream` (Space Grotesk 700, 15 px, `UPPERCASE`, prostrkání 0,08 em), za textem šipka `→`, výška 56 px, odsazení 28 px, radius 6 px, stín tlačítka (šedý). Hover: posun `translate(-2px,-2px)` a stín `6px 6px`. Active: `translate(4px,4px)` a stín 0. Přechod 120 ms. Při `prefers-reduced-motion` bez přechodu.

**Tlačítko sekundární.** Výplň `--cream`, 3 px `--ink` okraj, text `--ink`. Stejné chování.

**Zvýrazněná fráze.** Vložený blok s výplní `--salmon`, 3 px `--ink` okraj, vnitřní odsazení `0 0.18em`, stín `5px 5px 0 rgba(12,12,10,0.28)`. Při načtení se okraj a výplň "vykreslí" (`scaleX` 0 na 1, počátek vlevo, 600 ms), text je čitelný od začátku. **Použij nejvýš jednou na stránce (hero).**

**Popisek (label).** Viz škála. Barva `--mute`. Používej jen tam, kde nese informaci (kategorie, stav, ukázková data), ne nad každým nadpisem.

**Štítek změny (chip).** Pilulka, 2 px `--ink`, radius 999, výška 28 px, odsazení 0 10 px. Výplň `--mint` (růst) nebo `--rose` (pokles) nebo `--paper` (beze změny). Uvnitř trojúhelník 10 px (▲ nebo ▼, SVG, `--ink`) a změna `+1,84 %` (Space Grotesk 700, tabulkové číslice, `--ink`). Trojúhelník a znaménko nesou význam společně s barvou.

**Karta.** Viz 2.4. Výplň podle sémantiky (2.2). Interaktivní karta (dlaždice, řádek, tarif) se chová jako tlačítko: hover posun proti stínu, active "zapadne".

**Formulář.** Pole: výška 56 px, 3 px `--ink`, radius 8 px, výplň `--paper`, odsazení 20 px, Montserrat 18 px. Fokus: obrys 3 px `--ink`, odsazení 3 px. Zaškrtávací pole: čtverec 24 px, 3 px `--ink`, radius 4 px, zaškrtnuté: výplň `--salmon` a černý háček. Chybová hláška pod polem `--loss-ink` a ikona, řekne, co se stalo a jak to opravit. Přepínač tarifu: segmentový ovladač, 3 px `--ink`, aktivní segment `--ink` s textem `--cream`.

**Jezdec (kalkulačka).** Dráha 10 px `--paper`, 2 px `--ink`, radius 5. Ručka čtverec 28 px, radius 4, výplň `--salmon`, 3 px `--ink`, stín `3px 3px 0 var(--ink)`. Klávesnicí ovladatelný, s `aria-valuetext`.

**Sparkline.** Čára `--ink` 2,5 px (velká dlaždice 3 px), zaoblené spoje. Koncový bod kroužek 10 px, výplň `--salmon`, 2 px `--ink`. Nakreslí se jednou při vstupu do obrazovky (1,1 s). Barva čáry **není** zelená a červená, znaménko a štítek nesou směr.

**Ikona firmy.** `BrandMark` 26 px (velká dlaždice 34 px) v `--ink`, uvnitř kruhu 44 px s výplní `--paper` a 2 px `--ink` okrajem. Monogram: zaoblený čtverec 2,5 px `--ink` s písmeny.

**Odznak (badge).** Otočený o -2°, 2 px `--ink`, výplň `--cream` nebo `--salmon`, Space Grotesk 700 13 px `UPPERCASE`. Použij na "brzy", "doporučený tarif", "ukázková data".

**Patička.** `--ink`, text `--cream`, odkazy `--salmon` s podtržením, disclaimer větším písmem.

### 2.6 Pohyb

Použij Motion (`motion/react`) a CSS. Pohyb je vzácný a má důvod:

- **Vstup v hero** (jediná orchestrovaná sekvence): řádky nadpisu se odkryjí zespodu, pak se "vykreslí" zvýrazněný rámeček, pak se po řádcích objeví tabule v rámu.
- **Kurzovní pás** (trvalý, ale zastavitelný a s vypnutím při `prefers-reduced-motion`).
- **Horní pruh** podle scrollu.
- **Dopočítání čísel** (změny v %) a **nakreslení křivek** při prvním vstupu do obrazovky, jednou.
- **Mechanika tlačítek a karet** (hover a active, 2.5).
- **Plynulé rozbalení** řádku analýzy a přidání položky do výběru (karta "zapadne" a změní barvu na lososovou).
- Žádné "fade-in a posun nahoru" celých sekcí a žádné animované pozadí ze sítě bodů.
- Respektuj `prefers-reduced-motion` všude (`MotionConfig reducedMotion="user"` plus ruční ošetření pásu, křivek a dopočítání).
- 60 fps, pohyb neblokuje obsah. Server vykreslí konečná čísla, stránka funguje i bez JavaScriptu.

Plynulý scroll (Lenis) a GSAP se nepoužívají.

### 2.7 Ikony firem

- SVG z balíčku `simple-icons`, generované skriptem `scripts/gen-icons.mjs` do `src/data/icons.generated.ts`. Vykreslují se jednobarevně v `--ink` (viz 2.5).
- Ověřeno k 29. 9. 2026: balíček má ikony pro SpaceX, Tesla, Apple, NVIDIA, Google (Alphabet), Meta, Broadcom, Netflix, AMD, Palantir, Visa. Nemá Microsoft, Amazon, Berkshire, Eli Lilly, Walmart, Exxon ani JPMorgan.
- Kde ikona chybí, `BrandMark` vykreslí **monogram** ve stejné velikosti. Pro libovolný ticker z katalogu tedy vždy existuje značka.
- Loga jsou ochranné známky svých vlastníků. Použití v komerčním produktu patří mezi právní otázky (sekce 13). Ikony proto drží jedna komponenta, aby šly kdykoli vyměnit za monogramy.
- Indexy používají textový monogram, ne oficiální logo.

### 2.8 Responzivita

Breakpointy: 640, 768, 1024, 1280 px, mobile first. Na mobilu:

- Stíny se zmenší (velký 6 px, střední 4 px, tlačítko 3 px), mezera mezi kartami 16 px.
- Hero: text nad tabulí, tabule na celou šířku.
- Bento dashboard: 2 sloupce, hlavní index přes celou šířku.
- Ceník: karty pod sebou, každá hodnota s vlastním popiskem.
- Navigace: hamburger.
- Kurzovní pás zůstává.
- Klikací plochy alespoň 44 × 44 px.

### 2.9 Pravidla psaní textů (skill `humanize-text-cs` a `design-taste-frontend`)

Každý český text na webu i v e-mailech projde před nasazením skillem `humanize-text-cs`. Konkrétně:

- Žádná pomlčka ani spojovník jako spojka uvnitř věty. Použij čárku, tečku nebo spojku.
- Žádné trojice ("rychlé, efektivní a spolehlivé"), žádné "nejde jen o X, ale i o Y".
- Žádné "nicméně", "v neposlední řadě", "je důležité poznamenat, že".
- Žádné tučné písmo uprostřed věty a žádné odrážky tam, kde by stačila souvislá věta.
- Žádné zakončení nabídkou pomoci.
- Střídej délku vět.
- **Obsah** je v pravopisné velikosti písmen (sentence case). Velká písmena (`UPPERCASE`) mají jen popisky, navigace a tlačítka, a to **stylem přes CSS** (`text-transform`), ne psaním velkými písmeny v textu. Čtečka tak čte normální slova.
- Aktivní rod. Tlačítko říká, co se stane ("Odebírat zdarma", ne "Odeslat"). Stejná akce se jmenuje stejně v celém toku.
- Chyba řekne, co se stalo a jak to opravit, a neomlouvá se.
- Fakta, čísla a smysl textu se úpravou nemění.

Návrh hlavního sdělení hero (ověř s uživatelem a zkontroluj pravdivost): "Trh za tři minuty." a zvýrazněná fráze "Ne za hodinu." Tvrzení o třech minutách musí odpovídat skutečné délce reportu.

---

## 3. TECHNICKÝ STACK A STRUKTURA

**Zvolený stack:**

| Vrstva | Volba | Poznámka |
| --- | --- | --- |
| Framework | Next.js (App Router) + TypeScript | v době přípravy 16.x. `middleware.ts` se v této verzi jmenuje `proxy.ts`. Před psaním kódu čti lokální dokumentaci v `node_modules/next/dist/docs/` |
| Styl | Tailwind CSS v4, případně shadcn/ui pro formuláře a dialogy | design tokeny v `@theme` v `globals.css` (viz 2.2 až 2.5). Každá komponenta z knihovny se přestyluje na tvrdé stíny a tlusté čáry |
| Písma | Space Grotesk a Montserrat přes `@fontsource-variable/*` | viz 2.3, self-hosted |
| Animace | Motion a CSS | viz 2.6 |
| Hosting | Vercel | nasazení z Gitu |
| Databáze | Neon Postgres, Drizzle ORM, `@neondatabase/serverless` | HTTP driver na jednoduché dotazy, `Pool` (WebSocket) na transakce |
| Přihlášení | Better Auth s magic linkem (návrh) | bez hesel. Před volbou ověř aktuální stav Auth.js a Better Auth v dokumentaci a rozhodnutí zapiš |
| Platby | Stripe Checkout, Customer Portal, webhook | webhook přijímá Next.js, viz 5.5 |
| E-maily | Resend, šablony v React Email | transakční e-maily přímo z Next.js, reporty přes n8n |
| Automatizace | n8n | pipeline dat, reporty, alerty, KPI |
| Analytika | PostHog | EU region, po souhlasu, viz 9 |
| Ikony | `simple-icons` (SVG) | viz 2.7 |

**Struktura webu:** jednostránkový web s kotvami pro prodejní část, plus samostatné trasy pro účet a právní stránky.

- Kotvy hlavní stránky (černá hlavička, scrollspy): **Jak to funguje** (`#jak`), **Dashboard** (`#dashboard`), **Analýzy** (`#analyzy`), **Ceník** (`#cenik`), **FAQ** (`#faq`), výzva **Odebírat** (`#objednat`).
- Trasy: `/` (prodejní stránka), `/prihlaseni` (magic link), `/ucet` (výběr položek, tarif, tlačítko na Customer Portal), `/potvrzeni` (potvrzení e-mailu), `/dekujeme`, `/podminky`, `/ochrana-udaju`, `/disclaimer`.
- Strukturu (jedna stránka s kotvami plus účet) neměň potichu. Změna je nevratné rozhodnutí a vyžaduje potvrzení uživatele.
- `/ukazka` (samostatný ukázkový report) se **nedělá**. Úlohu důkazu hodnoty plní živý dashboard.
- Web je do spuštění `noindex`.

**Kvalita:** mobile first, plně responzivní, sémantické HTML, jeden `h1` na stránku, metadata a OpenGraph, `sitemap.xml` a `robots.txt` až při spuštění.

---

## 4. STRUKTURA HLAVNÍ STRÁNKY (POŘADÍ A KOMPOZICE)

Každá sekce má vlastní kompozici a vlastní svislé odsazení. Nekopíruj jedno rozložení. Barvy pruhů a karet vždy podle sémantiky v 2.2.

**Pořadí shora dolů:** horní pruh, hlavička, kurzovní pás, hero, problém, jak to funguje, předěl, dashboard, analýzy, předěl, důvěra (černý pruh), pro koho, ceník, FAQ, závěrečná výzva (lososový pruh), patička.

### 4.1 Hero (asymetrické, jako `reference/cr8-asistent.png`)

Krémové pozadí s mřížkou. Levý sloupec 7 z 12, pravý 5 z 12, svisle zarovnané na střed.

```
+------------------------------------------------------------+
| PŘEHLED AMERICKÝCH AKCIÍ V E-MAILU        +----------------+ |
|                                           |  Tabule v rámu | |
| Trh za tři minuty.                        |  ------------- | |
| [ Ne za hodinu. ]  <- lososový rámeček    |  S&P 500  +0,4 | |
|                                           |  SpaceX   +0,4 | |
| Úvodní odstavec, jedna celá věta tučně.   |  Tesla    -1,9 | |
|                                           |  NVIDIA   +2,4 | |
| [ e-mail ................ ] [ODEBÍRAT ->] |  Berkshire+0,1 | |
| [x] souhlas se zpracováním e-mailu        +----------------+ |
+------------------------------------------------------------+
```

- Levý sloupec: popisek (label), H1 ve dvou řádcích (druhý ve zvýrazněném rámečku, jediném na stránce), úvodní odstavec, formulář (e-mail, souhlas, primární tlačítko).
- Pravý sloupec: **tabule v rámu**. Karta s radiusem 28 px, 3 px `--ink`, stínem 10 px. V záhlaví názvem "Dnešní přehled" a odznakem "UKÁZKOVÁ DATA". Pět řádků (S&P 500, SpaceX, Tesla, NVIDIA, Berkshire Hathaway), každý s ikonou, názvem, cenou, štítkem změny a křivkou. Řádky oddělené 2 px `--ink`. Bez ilustrace a gradientu.
- Rám na počítači mírně přesahuje do pravého okraje mřížky, aby hero nepůsobilo vystředěně.

### 4.2 Problém

Dvousloupcové, levý sloupec nadpis "Kolik času vám denně zabere zjistit, co se na trhu stalo?" a krátký odstavec. Pravý sloupec je jedna karta `--paper` (velký stín) s jezdcem (10 až 90 minut za den) a velkým číslem hodin ročně (Space Grotesk 700, `clamp(3.5rem, 9vw, 6.5rem)`). Výpočet: minuty × 252 obchodních dní ÷ 60. Report se počítá na 3 minuty. Předpoklady jsou napsané pod číslem. Odpověď se hlásí čtečce (`aria-live="polite"`).

### 4.3 Jak to funguje

**Jediné místo s řadou tří karet** (jako na `reference/cr8-home.png`): karty `--mist`, `--salmon`, `--sand`. Kroky jsou skutečná posloupnost, takže číslování `01`, `02`, `03` je na místě (velké číslo v kroužku 56 px). Uvnitř každé karty nadpis, text a jedna drobná mikro-ilustrace z tvarů (kroužek, čtverec, kosočtverec), ne ikonová sada. Mezi kartami na počítači tečkovaná spojnice s kosočtvercem. Tři kroky: výběr tarifu, sestavení výběru položek, e-mail přichází sám.

### 4.4 Dashboard (`#dashboard`): interaktivní výběr, ne výloha

Klient si volí vlastní položky (akcie i indexy), proto dashboard není pevný seznam, ale **ukázka téhož nástroje, který uvidí v účtu**.

```
+--------------------------------------------------------------+
| Nadpis: Vyberte si položky a uvidíte svůj přehled            |
| [ Hledat ticker nebo název ...............................]   |
| Zobrazit jako: [ START 5 ][ PLUS 25 ][ PRO 100 ]             |
| Moje místa: [#][#][#][ ][ ]   3 z 5                          |
+---------------------------+---------+---------+--------------+
|  S&P 500 (velká, mist)    | Nasdaq  | SpaceX  |              |
|  velká křivka             | (mist)  | (sand)  |              |
|                           +---------+---------+              |
|                           | Tesla   | Berkshire|             |
+-----------+-----------+---+---------+---------+--------------+
| Apple     | Microsoft | NVIDIA    | Amazon    | ...          |
+-----------+-----------+-----------+-----------+--------------+
```

- **Výchozí stav:** předvyplněná **vitrína** (přibližně 18 akcií a 2 indexy: S&P 500, Nasdaq-100, SpaceX (SPCX), Tesla, Berkshire Hathaway (BRK.B), Apple, Microsoft, NVIDIA, Amazon, Alphabet, Meta, Broadcom, Netflix, AMD, Palantir, JPMorgan, Visa, Eli Lilly, Walmart, Exxon Mobil). Seznam je jen příklad a je v databázi (`showcase_symbols`), ne v kódu. Nadpis sekce mluví o výběru, ne o počtu položek.
- **Rozložení:** bento mřížka v CSS Grid, 12 sloupců, mezera 24 px. Hlavní index velká dlaždice přes dva řádky, ostatní menší. Každá dlaždice je karta (2.4, střední stín 6 px, velká 10 px) s barvou podle druhu (index `--mist`, akcie `--sand`, **vybraná do výběru `--salmon`**). Obsah: ikona v kroužku, ticker (label), název, cena, štítek změny, křivka za 30 dní.
- **Vyhledávání** podle tickeru nebo názvu. Kliknutí na dlaždici ji přidá do vlastního přehledu (karta "zapadne", změní barvu na lososovou, v rohu se objeví háček). Opětovné kliknutí ji odebere.
- **Přepínač "Zobrazit jako"** Start (5), Plus (25), Pro (100). Ukazuje limit tarifu. **Počítadlo míst** je řada čtverců (obsazeno černě s lososovým rámem, volno prázdné) a text "3 z 5". Po překročení limitu se místo přidání zobrazí, co by přidal vyšší tarif. Limit se v UI i na serveru hlídá stejným kódem.
- **Důležité omezení:** veřejné demo smí ukázat jen položky, pro které existují čerstvá data (vitrína a sjednocení výběrů všech klientů). Pro ostatní ticker vrátí vyhledávání položku se stavem "Data budou k dispozici po přidání do výběru", protože stahování cen na požádání pro anonymní návštěvníky by stálo peníze u datového API. Nevymýšlej ceny.
- Výběr anonymního návštěvníka žije jen v prohlížeči (`localStorage`, přes `try/catch`). Do databáze se neukládá.
- Stejná komponenta se použije v `/ucet` (uložený výběr). Postav ji jednou.
- Dlaždice je tlačítko s přístupným názvem ("Tesla, −1,86 %. Přidat do výběru."). Pořadí a fokus odpovídají čtecímu pořadí.

### 4.5 Analýzy (`#analyzy`)

Jedna velká karta `--paper` (velký stín) obsahující řádky oddělené 2 px `--ink`. Řádek: ikona, název, ticker, sektor, cena, štítek změny, ovládací čtverec `+` (2 px `--ink`, otočí se na `×`). Klik rozbalí panel (výplň `--paper`, nahoře 2 px `--ink`):

- Veřejně: popis firmy nebo indexu (H3 velikost), čtyři čísla (poslední cena, změna za den, minimum a maximum za 30 dní) a větší křivka.
- **Vysvětlení příčiny pohybu se zdroji je součástí Start a Plus** a veřejně se nezobrazuje. Ve veřejné části je zamčený blok: 3 px čárkovaný okraj `--ink`, výplň `--sand`, ikona zámku, jedna věta a sekundární tlačítko "Porovnat tarify →" na `#cenik`. Důvod: plná analýza zdarma by brala důvod platit.
- Kliknutí na dlaždici dashboardu otevře odpovídající řádek a doscrolluje na něj.
- Řádek je tlačítko s `aria-expanded` a `aria-controls`, panel má roli `region`.
- V den bez výrazného pohybu panel říká věcně "Bez výrazného pohybu" a nezobrazuje prázdný text.

### 4.6 Proč tomu věřit (černý pruh)

Jediný **plný černý pruh** mezi krémovými sekcemi (rytmus). Text `--cream`, akcenty `--salmon`, bez mřížky. Dvousloupcově: vlevo nadpis, vpravo seznam definic (čísla, vysvětlení, kontrola, žádná doporučení), položky oddělené 2 px `--cream` čárou, ne karty. Formulace podle 1.2.

### 4.7 Pro koho ano a pro koho ne

Dvě karty vedle sebe: "Pro koho je" (`--mist`) a "Pro koho není" (`--paper`), souvislý text, ne odrážky. Různě vysoké, se stínem 10 px. Filtruje nevhodné zákazníky a snižuje odchody.

### 4.8 Ceník (`#cenik`)

Pravidelná CSS Grid tabulka 4 sloupce (Free, Start, Plus, Pro). Řádky (název, cena, reporty, obsah, výběr položek, archiv, tlačítko) jsou zarovnané napříč tarify přes `grid-template-rows: subgrid`. Každý tarif je karta: Free `--paper`, Start `--mist`, **Plus `--salmon` (zvýrazněný, na počítači o 12 px výš, odznak "Nejvíc obsahu")**, Pro `--sand` s odznakem "BRZY". Cena velkým číslem (Space Grotesk 700, 3,5 rem) a "Kč / měs." malým písmem. Řádky uvnitř karty oddělené 2 px `--ink`. Tlačítka: Free "Začít zdarma →", Start a Plus "Vybrat tarif →" (odkazují na `#objednat`), Pro "Připravujeme" (neaktivní, s vysvětlením). Na mobilu se karty skládají pod sebe a každá hodnota nese vlastní popisek. Ceník říká pravdivě, co ještě neexistuje (odpolední report, Pro).

### 4.9 FAQ (`#faq`)

Nativní `details/summary`, každá otázka je karta (2.4, stín 4 px, radius 12 px). Otevřená karta má výplň `--sand`, ovládací čtverec `+` na `×`. Otázky: kdy report dorazí, co je ve Start a Plus, jak zrušit, odkud jsou data, "nejde o investiční doporučení", co se děje ve dny, kdy je americký trh zavřený.

### 4.10 Závěrečná výzva (`#objednat`)

Plný `--salmon` pruh, bez mřížky. Uprostřed karta `--paper` s velkým stínem: nadpis, formulář s výběrem tarifu (segmentový přepínač), souhlas, primární tlačítko.

### 4.11 Patička

Plný `--ink`. Název, disclaimer ("Nejde o investiční doporučení.") větším písmem, odkazy na právní stránky, upozornění, že ukázková data nejsou skutečná (dokud tomu tak je).

---

## 5. BACKEND

### 5.1 Principy

- **Workflow se neaktivují po jednom pro každého klienta.** Běží jednou podle cronu pro všechny a tarif v databázi rozhoduje, komu se co pošle.
- **LLM a Tavily se volají jednou na unikátní položku za den, ne jednou na uživatele**, a jen pro položky s výrazným pohybem.
- Render a odeslání e-mailu nevolají LLM. Skládají šablonu z hotových dat v Neonu.
- Webhook Stripe přijímá Next.js (ověření podpisu, zápis do Neonu, idempotence). n8n se používá na navazující věci.
- Každý limit (výběr položek) se hlídá na serveru. UI je jen pohodlí.
- Časová zóna se nastavuje na úrovni workflow v n8n: navázané na americký trh `America/New_York`, na doručení čtenářům `Europe/Prague`. Pozor: přechod na zimní čas v EU a USA nastává v jiné dny, takže několik týdnů v roce je rozdíl 5 hodin místo 6. Časy nepřepočítávej ručně.

### 5.2 Datový model (Neon, Postgres)

Rozšíření původního schématu z plánu. Drizzle schéma odvoď z tohoto SQL. Tabulky přihlášení (relace, tokeny) vytvoří zvolená knihovna přihlášení.

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Limity a chování podle tarifu (jedno místo pravdy)
CREATE TABLE plan_limits (
  tier TEXT PRIMARY KEY,                    -- free / start / plus / pro
  max_watchlist INT NOT NULL,
  reports_per_day INT NOT NULL,
  archive_days INT,                         -- NULL = celý archiv
  move_threshold_pct NUMERIC NOT NULL DEFAULT 3.0
);
INSERT INTO plan_limits VALUES
  ('free', 0, 0, 0, 3.0), ('start', 5, 1, 0, 3.0),
  ('plus', 25, 2, 90, 3.0), ('pro', 100, 3, NULL, 3.0);

-- Uživatelé a předplatné
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,               -- vždy malými písmeny
  email_confirmed_at TIMESTAMPTZ,           -- double opt-in
  consent_at TIMESTAMPTZ,
  consent_ip INET,
  consent_text_version TEXT,                -- verze znění souhlasu
  digital_content_waiver_at TIMESTAMPTZ,    -- souhlas s okamžitým poskytnutím (14denní odstoupení)
  stripe_customer_id TEXT UNIQUE,
  tier TEXT NOT NULL DEFAULT 'free' REFERENCES plan_limits(tier),
  status TEXT NOT NULL DEFAULT 'active',    -- active / past_due / canceled
  current_period_end TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Katalog položek (akcie, ETF, indexy)
CREATE TABLE symbols (
  ticker TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('stock','etf','index')),
  exchange TEXT,
  currency TEXT DEFAULT 'USD',
  sector TEXT,
  in_sp500 BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX symbols_name_trgm ON symbols USING gin (name gin_trgm_ops);
CREATE INDEX symbols_ticker_trgm ON symbols USING gin (ticker gin_trgm_ops);

-- Vlastní výběr uživatele (limit se hlídá v transakci, viz 5.7)
CREATE TABLE watchlist (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ticker TEXT REFERENCES symbols(ticker),
  active BOOLEAN NOT NULL DEFAULT true,     -- false = přebytek po snížení tarifu
  added_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, ticker)
);

-- Vitrína na webu (vždy čerstvá data, i když ji nikdo nesleduje)
CREATE TABLE showcase_symbols (
  ticker TEXT PRIMARY KEY REFERENCES symbols(ticker),
  position INT NOT NULL
);

-- Historie cen pro křivky a 30denní rozsah
CREATE TABLE price_history (
  ticker TEXT REFERENCES symbols(ticker),
  trade_date DATE,
  close NUMERIC NOT NULL,
  PRIMARY KEY (ticker, trade_date)
);

-- Denní data za trh jako celek
CREATE TABLE market_daily (
  report_date DATE PRIMARY KEY,
  sp500_change_pct NUMERIC,
  top_gainers JSONB,
  top_losers JSONB,
  summary_text TEXT,
  sources JSONB,
  report_ready BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Denní data za položku
CREATE TABLE ticker_daily (
  report_date DATE,
  ticker TEXT REFERENCES symbols(ticker),
  price NUMERIC,
  change_pct NUMERIC,
  significant BOOLEAN NOT NULL DEFAULT false, -- pohyb nad prahem
  summary_kind TEXT NOT NULL DEFAULT 'template', -- template / llm
  summary_text TEXT,
  sources JSONB,
  PRIMARY KEY (report_date, ticker)
);

-- Kalendář obchodních dní (svátky, zkrácené seance)
CREATE TABLE market_calendar (
  cal_date DATE PRIMARY KEY,
  is_trading_day BOOLEAN NOT NULL,
  note TEXT
);

-- Potvrzení odběru (double opt-in), tokeny se ukládají jen jako hash
CREATE TABLE subscription_confirmations (
  token_hash TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ
);

-- Fronta e-mailů k odeslání
CREATE TABLE outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  report_date DATE,
  report_type TEXT,          -- morning / afternoon / weekly / weekly_outlook
  html_body TEXT,
  status TEXT DEFAULT 'pending',  -- pending / sent / failed
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, report_date, report_type)
);

-- Log odeslání (idempotence)
CREATE TABLE send_log (
  user_id UUID REFERENCES users(id),
  report_date DATE,
  report_type TEXT,
  sent_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, report_date, report_type)
);

-- Idempotence webhooků Stripe
CREATE TABLE stripe_events (
  event_id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT now()
);
```

Nikdy neukládej surové tokeny ani hesla. Migrace řeš přes Drizzle (`drizzle-kit`), ne ručně v konzoli.

### 5.3 Trasy API v Next.js

| Trasa | Účel | Poznámka |
| --- | --- | --- |
| `POST /api/subscribe` | Free odběr, vytvoří uživatele, pošle potvrzovací e-mail | validace Zod, honeypot, limit počtu požadavků. Odpovídá **pravdivě**: dokud není zapojená databáze a Resend, vrací 503 s vysvětlením, ne falešný úspěch |
| `GET /api/confirm` | potvrdí e-mail podle tokenu | token jednorázový, uložený jako hash, platnost omezená |
| `GET /api/symbols/search?q=` | vyhledávání v katalogu | trigramový index, vrací i stav "data k dispozici ano/ne", omezit počet požadavků |
| `GET /api/watchlist`, `PUT /api/watchlist` | čtení a změna výběru | vyžaduje přihlášení, limit v transakci (5.7) |
| `POST /api/checkout` | vytvoří Stripe Checkout Session | tarif se mapuje na cenu **na serveru**, nikdy z hodnoty poslané klientem |
| `POST /api/portal` | vytvoří relaci Customer Portal | jen pro přihlášeného uživatele s `stripe_customer_id` |
| `POST /api/webhooks/stripe` | příjem událostí Stripe | surové tělo, ověření podpisu, idempotence přes `stripe_events` |
| `GET /api/unsubscribe` a `POST` | odhlášení jedním kliknutím | musí fungovat i z hlavičky `List-Unsubscribe` |
| `POST /api/internal/render-report` | vykreslí HTML reportu pro dávku uživatelů | jen pro n8n, viz 5.6 |

Trasy pro přihlášení (magic link) vytvoří zvolená knihovna.

### 5.4 Tok uživatele

1. Návštěvník zadá e-mail a zaškrtne souhlas (Free nebo zájem o tarif).
2. Vznikne řádek v `users` (`tier='free'`), uloží se čas, IP a verze znění souhlasu, odešle se potvrzovací e-mail (double opt-in).
3. Po potvrzení se nastaví `email_confirmed_at`. Do potvrzení se žádné reporty neposílají.
4. Upgrade přes Stripe Checkout (hostovaná stránka, žádné karty u nás). Do Checkoutu se předá `client_reference_id = users.id`.
5. Webhook změní `tier`, `status` a `current_period_end`.
6. Od nejbližšího běhu W4 a W5 (ráno), případně W8 (odpoledne) chodí reporty podle tarifu. Nikdo nic nezapíná.
7. Změny a zrušení řeší Stripe Customer Portal, webhook je propíše.

### 5.5 Stripe

- Checkout v režimu `subscription`. Tarif se určí z ID ceny (proměnné prostředí `STRIPE_PRICE_START`, `STRIPE_PRICE_PLUS`, později `STRIPE_PRICE_PRO`).
- Před platbou musí být **výslovný souhlas s okamžitým poskytnutím digitálního obsahu** (kvůli 14denní lhůtě na odstoupení). Technicky přes možnosti Checkoutu (souhlas a vlastní text). Přesné parametry ověř v aktuální dokumentaci Stripe, zapiš čas souhlasu do `digital_content_waiver_at`.
- Zvaž Stripe Tax (DPH, OSS pro zákazníky z EU). Rozhodnutí je otevřená otázka.
- Události a jejich účinek:

| Událost | Účinek |
| --- | --- |
| `checkout.session.completed` | naváže `stripe_customer_id` na uživatele, nastaví tarif a `active` |
| `customer.subscription.updated` | aktualizuje tarif, stav, `current_period_end`. Při snížení tarifu označí přebytečné položky jako `active=false` |
| `customer.subscription.deleted` | vrátí tarif na `free`, stav `canceled` |
| `invoice.payment_failed` | stav `past_due`. Lhůta, po kterou se ještě posílá, je otevřená otázka (návrh 7 dní) |

- Každou událost nejdřív zapiš do `stripe_events`. Pokud už tam je, ukonči zpracování bez chyby.
- Po zpracování pošli podepsanou zprávu do n8n (W14), které obslouží uvítací e-mail, potvrzení změny a Telegram. Pád n8n nesmí zabránit propsání platby.
- **W15** (noční rekonciliace Stripe a Neon) zůstává jako záchranná síť pro ztracené webhooky.

### 5.6 Propojení s n8n

- n8n čte a zapisuje Neon přes nativní Postgres uzel s **odděleným databázovým uživatelem s minimálními právy** (čtení katalogu a výběrů, zápis do tabulek pipeline a `outbox`). Nepoužívej vlastníka databáze.
- **Jedna šablona pro web i e-mail.** W4 nerenderuje HTML samo. Zavolá `POST /api/internal/render-report` (dávky do 100 uživatelů), které v Next.js vykreslí šablonu React Email a vrátí HTML. n8n ho uloží do `outbox`.
- Podpis interních volání: HMAC-SHA256 nad tělem a časovou značkou v hlavičkách, sdílené tajemství v proměnné prostředí, odmítnout požadavky starší než 5 minut. Stejný mechanismus platí obousměrně (Next.js na n8n i n8n na Next.js).
- Transakční e-maily (potvrzení odběru, magic link) jdou **přímo z Next.js přes Resend**, protože musí dorazit okamžitě. Reporty a uvítací sekvence jdou přes n8n.
- Reporty se odesílají s hlavičkami `List-Unsubscribe` a `List-Unsubscribe-Post`.

### 5.7 Hlídání limitu výběru (na serveru)

Přidání položky proběhne v jedné transakci (`Pool` z `@neondatabase/serverless`, ne HTTP driver):

1. `SELECT tier FROM users WHERE id = $1 FOR UPDATE` (uzamkne uživatele proti souběžnému přidání).
2. Načti `max_watchlist` z `plan_limits` a spočítej `active` položky uživatele.
3. Pokud je počet rovný limitu nebo vyšší, vrať 409 a v odpovědi uveď, co by přidal vyšší tarif.
4. Jinak `INSERT`. Commit.

Při snížení tarifu se výběr nemaže. Přebytek se označí `active=false` (zůstanou nejstarší položky) a uživatel dostane e-mail s možností výběr upravit.

### 5.8 Změny v pipeline oproti původnímu plánu

Tyto úpravy patří do exportů workflow, které se připravují zvlášť (pořadí W14, W18, W1, W4 až W6):

- **W1a** stahuje sjednocení `watchlist` (jen `active`), `showcase_symbols` a indexů pro přehled trhu. Ukládá i `price_history`.
- **W1b (Tavily)** jen pro položky, jejichž `|change_pct|` překročí `move_threshold_pct`. Práh je v `plan_limits`. Zvaž nižší práh pro Plus (návrh 1,5 %), aby tarifní rozdíl byl reálný. Rozhodnutí je otevřená otázka.
- **W1c (LLM)** jen pro položky s pohybem. Ostatní dostanou šablonovou větu (`summary_kind='template'`) bez volání LLM. Tím zůstanou náklady úměrné počtu pohybů, ne počtu položek.
- **W1d** porovná čísla v textu s API a teprve pak nastaví `report_ready`.
- **W4** volá render API místo vlastního skládání HTML (5.6).
- **W9** týdně obnoví katalog `symbols` včetně `kind`.
- **W14** už není příjem webhooku Stripe (ten je v Next.js), ale příjem podepsaných událostí z Next.js a navazující akce.
- **Datový zdroj:** musí mít komerční licenci na redistribuci, včetně **veřejného zobrazení** na webu. Vitrína proto ukazuje data po uzavření burzy. Živé ceny by potřebovaly dražší licenci.
- **Indexy:** hodnoty indexů (např. S&P 500) jsou samostatně licencované. Běžná náhrada je ETF (SPY, QQQ), což je jiné číslo než samotný index. Rozhodnutí před tím, než se to slíbí na webu, je otevřená otázka.
- **Rozsah trhů:** zatím jen USA (časy reportů, kalendář svátků a data odpovídají americké seanci). Evropské trhy by vyžadovaly jiné časy, kalendář a data.

### 5.9 Proměnné prostředí (jen názvy, hodnoty nikdy do Gitu)

`DATABASE_URL`, `DATABASE_URL_N8N` (omezený uživatel), `BETTER_AUTH_SECRET` (nebo obdoba podle knihovny), `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_START`, `STRIPE_PRICE_PLUS`, `RESEND_API_KEY`, `EMAIL_FROM`, `INTERNAL_HMAC_SECRET`, `N8N_EVENT_WEBHOOK_URL`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, `NEXT_PUBLIC_SITE_URL`. Přidej `.env.example` bez hodnot.

---

## 6. FUNKČNÍ POŽADAVKY: FORMULÁŘ ODBĚRU

Formulář existuje v hero a v závěrečné výzvě (druhý s výběrem tarifu). Vždy:

1. Validace (povinný e-mail, formát, povinný souhlas) na klientu i na serveru.
2. Bezpečné odeslání. Žádný klíč na klientu. Kontrola původu požadavku.
3. Honeypot a omezení počtu požadavků.
4. Stavy načítání, úspěchu a chyby, po úspěchu vyčištění formuláře.
5. Souhlas je zaškrtávací pole s odkazem na zásady ochrany údajů. Znění dodá právník, kód drží verzi znění (`consent_text_version`).
6. Jasně řečeno, kam se potvrzovací e-mail posílá a co se stane dál (double opt-in).
7. Chyby popisují, co se stalo a co s tím, a neomlouvají se ("Zadejte platný e-mail, třeba jmeno@firma.cz").

---

## 7. UKÁZKOVÁ DATA A PLACEHOLDERY

- Dokud není zvolené a zapojené datové API, jsou ceny, změny a křivky **ukázkové**. Generují se deterministicky (stejný výsledek na serveru i klientu), žijí v jednom souboru a jsou **na viditelném místě označené** ("Ukázková data. Ceny a změny nejsou skutečné."). Označení se neschovává, dokud data nejsou skutečná.
- Ukázková data nesmí obsahovat vymyšlená tvrzení o příčinách pohybu skutečných firem. Texty popisů jsou stabilní fakta o firmě, ne denní zprávy.
- Žádné stock fotografie jako výplň. Web fotografie nepotřebuje.
- Nevymýšlej fakta o klientovi ani o produktu (počty zákazníků, reference, výnosy). Chybějící údaj patří do otevřených otázek.

---

## 8. PŘÍSTUPNOST A VÝKON

- Kontrast textu na pozadí alespoň WCAG AA. Týká se i popisků velkými písmeny a šedého vedlejšího textu (`--mute`, viz 2.2). Barva nikdy nenese význam sama (trojúhelník a znaménko u změn).
- Velká písmena jen přes CSS (`text-transform`), v obsahu HTML je běžný text.
- Tvrdé stíny a čáry nesmí zhoršit čitelnost. Fokus: černý obrys 3 px na světlém pozadí, lososový na tmavém.
- Kurzovní pás: zastavitelný, s vypnutým pohybem při `prefers-reduced-motion` a s přístupným seznamem místo běžícího textu.
- Ovladatelnost klávesnicí (dashboard, řádky analýz, navigace, formuláře), viditelný focus.
- Sémantické HTML, správná hierarchie nadpisů, popisky formulářových polí.
- Ikony s `aria-label` nebo `aria-hidden` podle významu. Dlaždice a řádky mají srozumitelný přístupný název ("Tesla, −1,86 %. Zobrazit analýzu.").
- `prefers-reduced-motion` respektován všude.
- Core Web Vitals: bez zbytečných blokujících skriptů, pevné rozměry křivek a obrázků kvůli posunu rozložení.
- Testuj na mobilu, tabletu i počítači.

---

## 9. PRÁVNÍ A COMPLIANCE

Právní text negeneruj. Vytvoř prázdné stránky `/podminky`, `/ochrana-udaju`, `/disclaimer` s upozorněním, že text doplní právník.

- Souhlas se zpracováním e-mailu s důkazem (čas, IP, verze znění).
- Výslovný souhlas s okamžitým poskytnutím digitálního obsahu před platbou.
- Disclaimer na webu i v e-mailech.
- Hranice investičního doporučení, GDPR a znění podmínek: právní konzultace před spuštěním.
- DPH, OSS a případně Stripe Tax: před přijetím první platby.
- Cookie lišta: PostHog se spouští **až po souhlasu** a do té doby bez cookies (`persistence: "memory"`). Přesný režim je otevřená otázka.
- Forma podnikání (OSVČ nebo s.r.o.) a kontrola případné konkurenční doložky v hlavním zaměstnání jsou mimo kód, ale blokují spuštění plateb.

---

## 10. ZABEZPEČENÍ (skill `web-security-setup`)

Zabezpečení se staví **od první fáze**, ne na konci. Postupuj podle skillu. Poznámka: příloha skillu (`references/` a `assets/`) nemusí být v tvém prostředí k dispozici. Pak sestav konfiguraci podle pravidel v `SKILL.md` a rozhodnutí zapiš.

**Situace:** hosting Vercel, framework Next.js (App Router), nový projekt (greenfield), zpracovává osobní údaje a platby. Integrace: PostHog (EU), Stripe (jen přesměrování na hostovanou stránku), Resend a Neon jen ze serveru, žádné Google Fonts, žádná mapa.

**Hlavičky (vždy všechny společně):**

| Hlavička | Hodnota |
| --- | --- |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains` (bez `preload`, ten se řeší až po měsíci čistého provozu) |
| `Content-Security-Policy` | z `proxy.ts` s nonce, viz níže |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | zakázat vše, co web nepoužívá |
| `Cross-Origin-Opener-Policy` | `same-origin` |
| `Cross-Origin-Resource-Policy` | `same-origin` |
| `X-XSS-Protection` | `0` |

Odstranit `X-Powered-By` (`poweredByHeader: false`).

**CSP:** v `proxy.ts` s nonce a `strict-dynamic`. V produkci nikdy `unsafe-inline` ani `unsafe-eval` pro skripty (`unsafe-eval` jen ve vývoji). Vždy `base-uri 'self'`, `object-src 'none'`, `frame-ancestors 'none'`, `form-action 'self'`. Žádné zástupné znaky, jen konkrétní domény. `style-src` smí mít `'unsafe-inline'`, pokud to vyžaduje Motion (styly v atributech vykreslené serverem). Zapiš to do `DECISIONS.md` jako vědomé rozhodnutí. Každá doména v CSP dostane řádek v `CSP-LOG.md` s důvodem.

**Důsledek nonce:** stránky se vykreslují dynamicky (kořenový layout čte `headers()`), takže se ztrácí statická keš. Data dashboardu se cachují na úrovni dotazu, ne stránky. Zapiš to do `DECISIONS.md`.

**Nasazení:** protože jde o nový projekt, CSP může být vynucené od prvního dne. Projdi celý web (dashboard, formuláře, mobilní menu) a zkontroluj konzoli, včetně Safari.

**Repozitář a DNS:** rozšířený `.gitignore` (`.env`, `.env.*`, `*.pem`, `*.key`, `.vercel`, `.DS_Store`), `/.well-known/security.txt` (pole `Expires` je povinné, kontakt je otevřená otázka, do spuštění nenech zástupný kontakt na veřejném webu), CI workflow (audit závislostí, hledání tajemství, kontrola hlaviček na nasazené adrese), DNS (DNSSEC, CAA, SPF, DKIM a DMARC pro odesílací doménu).

**Aplikační bezpečnost:** validace Zod na každém vstupu, ověření podpisu Stripe nad surovým tělem, ověření HMAC u interních tras, tokeny jako hash, omezení počtu požadavků na vyhledávání a přihlášení, žádná tajemství v klientském kódu (jen `NEXT_PUBLIC_*`), oddělený databázový uživatel pro n8n. Pro kontrolu kódu (RLS, XSS) použij `web-security-review`, pokud je dostupný.

**Paměť zabezpečení:** vytvoř `.claude/security/` se `STATE.md`, `DECISIONS.md`, `CSP-LOG.md`, `AUDIT-LOG.md`, do `CLAUDE.md` přidej krátký bezpečnostní blok a plná pravidla drž v `AGENTS.md`. Konfigurace bez zapsaného důvodu se při příští úpravě tiše vrátí.

---

## 11. SKILLS: KDY A K ČEMU

| Skill | Kdy | Co určuje |
| --- | --- | --- |
| `project-memory-system` | od první relace, každou relaci | struktura `CLAUDE.md`, `AGENTS.md`, `memory/`. Každá změna se zapíše do `memory/memory.md` ve stejném tahu |
| `web-project-brief` | tento dokument a `CLAUDE.md` | sekce 0 (žádná generická šablona) se nezkracuje ani neslabí. Od 29. 9. 2026 je přepsaná na směr cr-8, princip zůstává |
| `design-taste-frontend` | každá práce na vzhledu | postup návrh, kritika, stavba, sebekritika a pravidla přístupnosti a psaní. Jeho seznam "výchozích voleb" neplatí tam, kde ho přebíjí zadání (sekce 0 a 2) |
| `humanize-text-cs` | každý český text pro uživatele | pravidla psaní v 2.9 |
| `web-security-setup` | fáze 1 a při každé změně integrace | hlavičky, CSP, paměť zabezpečení |
| `web-security-audit`, `web-security-review` | po nasazení a před spuštěním, pokud jsou dostupné | ověření živého webu, kontrola kódu |

Skill `onepage-craftsman-site-layout` se nepoužije. Je určen pro web řemeslníka a jeho struktura a obsah se sem nehodí.

---

## 12. IMPLEMENTAČNÍ PLÁN PO FÁZÍCH

Každá fáze končí **zastávkou**: shrň výsledek, ukaž snímek obrazovky nebo výstup kontroly a počkej na schválení. Po každé změně zapiš záznam do `memory/memory.md`.

**Fáze 0: paměť a rozhodnutí**
1. Ověř, že v repozitáři neexistuje jiný poznámkový systém. Vytvoř `memory/` a přesuň sem předpřipravené soubory. Ověř, že `CLAUDE.md` a `AGENTS.md` odpovídají skutečnému stavu.
2. Založ projekt (`create-next-app`, TypeScript, Tailwind, App Router, `src/`). Zachovej blok `nextjs-agent-rules` v `AGENTS.md`.
3. Přečti dokumentaci Next.js v `node_modules/next/dist/docs/` k `proxy.ts` a CSP.
4. Zastávka: uživatel schválí stav a odpoví na otevřené otázky, které blokují další fázi.

**Fáze 1: kostra a zabezpečení**
5. Tokeny, písma, pozadí s mřížkou, horní pruh, hlavička (scrollspy, mobilní menu), kurzovní pás, základní komponenty (tlačítko, karta, štítek, pole) podle 2.2 až 2.5.
6. Návrh vzhledu a jeho kritika (2.1), zapsané do paměti. Výsledek porovnat se screenshoty v `reference/` vedle sebe a odchylky od změřených hodnot zapsat.
7. `proxy.ts` s CSP a nonce, ostatní hlavičky, `.gitignore`, `security.txt`, CI, `.claude/security/`.
8. Zastávka: build, kontrola hlaviček na nasazeném náhledu, snímek obrazovky.

**Fáze 2: prodejní stránka s ukázkovými daty**
9. Hero, problém a kalkulačka, jak to funguje.
10. Dashboard s vyhledáváním, přepínačem tarifů a limity (na ukázkových datech, výběr v `localStorage`), analýzy.
11. Důvěra, pro koho, ceník (subgrid), FAQ, závěrečná výzva, patička, prázdné právní stránky.
12. Prohnat všechny české texty skillem `humanize-text-cs`.
13. Zastávka: vizuální kontrola desktop a mobil, klávesnice, reduced motion, Lighthouse.

**Fáze 3: databáze, odběr a přihlášení**
14. Schéma (5.2) a migrace v Drizzle, seed `plan_limits`, `showcase_symbols`.
15. `POST /api/subscribe`, `GET /api/confirm`, Resend, e-mail double opt-in.
16. Přihlášení magic linkem, `/prihlaseni`, `/ucet` se sdílenou komponentou výběru.
17. `GET/PUT /api/watchlist` s transakčním limitem (5.7), vyhledávání symbolů.
18. Zastávka: test celého toku od zadání e-mailu po uložený výběr, test souběžného přidání položek.

**Fáze 4: platby**
19. Stripe Checkout a Customer Portal, souhlas s digitálním obsahem.
20. Webhook (5.5) s idempotencí, snížení tarifu s označením přebytku.
21. Zastávka: test v testovacím režimu Stripe (nový odběr, změna tarifu, zrušení, neúspěšná platba, opakované doručení téže události).

**Fáze 5: propojení s n8n a skutečná data**
22. Podepsané interní trasy (`render-report`) a odchozí události do n8n.
23. Exporty workflow po blocích (W14, W18, W1, W4 až W6) podle 5.8. Přihlašovací údaje doplní uživatel po importu.
24. Napojení vybraného datového API, výměna ukázkových dat za skutečná, zmizení označení ukázkových dat.
25. PostHog po souhlasu, měření kritérií z plánu.
26. Zastávka: běh pipeline v testovacím režimu, výstup jen pro uživatele.

**Fáze 6: příprava spuštění**
27. `web-security-audit`, kontrola hlaviček, DNS (SPF, DKIM, DMARC), zapsání do `AUDIT-LOG.md`.
28. Právní texty, cookie lišta, DPH. Kontrolní seznam před spuštěním.
29. Zapnout indexování, `sitemap.xml`, `robots.txt`. HSTS preload až po měsíci čistého provozu.
30. Zastávka: rozhodnutí o spuštění.

**Rozhodovací kritéria z plánu:**
- Po měsíci propagace méně než 100 e-mailů na čekačce: přepracovat pozicování.
- Měsíční odchody placených nad 15 %: nejdřív obsah, potom růst.
- Cena získání zákazníka z reklamy nad trojnásobek měsíčního příjmu na zákazníka: zastavit placenou reklamu.

---

## 13. OTEVŘENÉ OTÁZKY (blokují nebo mění zadání)

| # | Otázka | Návrh | Blokuje |
| --- | --- | --- | --- |
| 1 | Název značky a doména | rozhodne uživatel | fáze 3 (odesílací doména), spuštění |
| 2 | Datové API a jeho licence na redistribuci včetně veřejného webu | Polygon, Twelve Data, FMP, Finnhub, ověřit podmínky | fáze 5 |
| 3 | Indexy: ETF jako zástupce, nebo licencovaný index | ETF (SPY, QQQ), pojmenovat poctivě | slib na webu |
| 4 | Rozsah trhů | zatím jen USA | katalog, časy |
| 5 | Ranní doručení út až so, nebo po až pá | rozhodnout před W4 a W5 | fáze 5 |
| 6 | Práh výrazného pohybu podle tarifu | 3 % všude, případně 1,5 % pro Plus | W1b, cena za tarif |
| 7 | Lhůta po neúspěšné platbě (`past_due`) | 7 dní | fáze 4 |
| 8 | Loga a ochranné známky | ponechat za jednou komponentou, právní kontrola | spuštění |
| 9 | Cookie lišta a režim PostHog | bez cookies do souhlasu | fáze 5 |
| 10 | Právní texty (souhlas, podmínky, ochrana údajů, disclaimer, odstoupení) | dodá právník | spuštění, platby |
| 11 | DPH a Stripe Tax | ověřit s účetním | první platba |
| 12 | Forma podnikání a konkurenční doložka | mimo kód | platby |
| 13 | Kontakt pro `security.txt` | schránka, kterou někdo čte | spuštění |
| 14 | Odpolední report Plus a tarif Pro: kdy | později podle plánu (W7, W8), ceník to říká | ceník |
| 15 | Knihovna přihlášení | Better Auth, ověřit aktuální stav | fáze 3 |
| 16 | Reference ben.ai a chase.ai: uživatel dodá screenshoty a řekne, co z nich chce | do té doby se z nich nic nepřebírá (2.0) | doladění vzhledu |
| 17 | Přesná písma cr-8 (Space Grotesk a Montserrat jsou odhad ze screenshotů) | uživatel potvrdí nebo upřesní | fáze 1 |
| 18 | Logo a název značky (kroužek z cr-8 se nekopíruje) | vlastní logo v nové značce | fáze 1, spuštění |

---

## 14. VÝSLEDNÝ DOJEM

Web má na první pohled působit jako **pečlivě sestavená papírová tabule s kurzy**: krémový list s mřížkou, černé linky, pastelové karty s tvrdým stínem, které se pod prstem mechanicky zmáčknou. Musí být hravý ve tvarech, ale přesný v číslech. Nesmí být rozpoznatelný jako web postavený generátorem ani jako kopie cr-8. Musí být rychlý, bezchybný na mobilu a vést návštěvníka k jedné akci: odebírat. Návštěvník má mít pocit, že to navrhl někdo, kdo trhy a čtenáře zná.

---

