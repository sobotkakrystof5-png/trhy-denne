# MEMORY: aktuální stav

Co se skutečně stalo, jaký je stav a proč. Pravidla formátu: `pravidla.md`.

## Aktuální stav
- **Projekt:** Trhy denně (pracovní název), placený newsletter o amerických akciích a indexech s vlastním výběrem položek podle tarifu.
- **Fáze:** Fáze 3 (databáze, odběr, přihlášení) schválená 2026-09-29. Od 2026-09-30 běží proti **skutečnému Neonu** (eu-central-1, Postgres 18.6), migrace a seed jsou nasazené. Resend pořád není, e-maily jdou do konzole. Fáze 4 (platby) je napsaná, zastávka kroku 21 **neproběhla** (chybí sandbox Stripe). Na pokyn uživatele je z fáze 5 hotový jen krok 22 (podepsané interní trasy), kroky 23 až 25 čekají na otevřené otázky 2, 5, 6 a 9 a na přístup k n8n.
- **Stack (nainstalováno):** Next.js 16.3.7 (App Router, Turbopack), React 19.2.8, TypeScript 5, Tailwind CSS v4, ESLint 9. Dále písma `@fontsource-variable/space-grotesk` a `montserrat`, Zod a `simple-icons` (jen vývojová). Motion je nainstalovaný, ale nepoužitý. Od fáze 3 navíc Drizzle ORM 0.45, `drizzle-kit`, `@neondatabase/serverless` 1.1, Better Auth 1.7.6, Resend 6, React Email, `server-only`, `pg` (jen vývojová). Od fáze 4 navíc `stripe` 22.6.2 (SDK má zabudovanou verzi API `2026-08-26.dahlia`). Zatím **nenainstalováno**: PostHog.
- **Vzhled:** neo-brutalistický papírový styl podle cr-8.cz (od 2026-09-29). Reference v `reference/`. Stojí tokeny, obě písma, mřížka, horní pruh, hlavička se scrollspy a mobilním menu, kurzovní pás a všechny sekce prodejní stránky na `/`. Právní stránky `/podminky`, `/ochrana-udaju`, `/disclaimer` jsou prázdné s upozorněním.
- **Co existuje:** prodejní stránka se všemi sekcemi ze zadání 4, dashboard s výběrem v `localStorage`, analýzy. Od fáze 3 schéma a migrace, odběr s double opt-in (`/api/subscribe`, `/potvrzeni`, `/api/confirm`, `/dekujeme`), přihlášení odkazem (`/prihlaseni`, `/prihlaseni/overit`), účet `/ucet` s výběrem uloženým v databázi a limitem v transakci, `/api/watchlist`, `/api/symbols/search`. Od fáze 4 platby: Checkout a Customer Portal z karty tarifu v `/ucet`, webhook `POST /api/webhooks/stripe`, logika v `src/lib/billing.ts`. Bez databáze a e-mailu vše pravdivě vrací 503, bez klíčů Stripe totéž pro platby (`paymentsReady()`). Všechna čísla jsou **ukázková data** ze `src/data/sample.ts` a web to říká v pásu, v tabuli, v dashboardu, v analýzách, v účtu i v patičce.
- **Git:** vlastní repozitář v `Desktop/SHARES.cz`, větev `main`, fáze 1 `14a9e15`, fáze 2 `c89cf34`, fáze 3 v commitu „fáze 3: databáze, odběr a přihlášení“, fáze 4 a krok 22 fáze 5 v commitu „fáze 4: platby a podepsané interní trasy“ (bez schválené zastávky, viz Fáze). Vzdálený repozitář: soukromý `trhy-denne` na GitHubu účtu `sobotkakrystof5-png`, větev `main`.

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
- **2026-09-29:** Pohyb stránky dělá jen CSS (třídy a atributy `data-*`), ne Motion. Důvod: `initial` z Motion vykreslí na serveru atribut `style`, který přísné CSP zablokuje, a politika se kvůli animacím nezeslabuje. Viz `.claude/security/DECISIONS.md`.
- **2026-09-29:** Loga položek kreslí `SymbolIcon`, `BrandMark` zůstává značkou webu. Důvod: zadání 2.5 používalo stejný název pro dvě různé věci.
- **2026-09-29:** `security.txt` se zatím **nenasazuje**. Leží jako šablona v `.claude/security/security.txt.template`. Důvod: kontakt není rozhodnutý a zástupná adresa v `security.txt` slibuje cestu hlášení, která nikam nevede.

- **2026-09-29:** Přihlášení je **Better Auth** s magic linkem. Důvod: návrh zadání (sekce 3) a zadání delegovalo ověření a zápis rozhodnutí. Ověřeno: Auth.js je od září 2025 u týmu Better Auth v režimu jen bezpečnostních oprav a pro nové projekty odkazuje na Better Auth. Better Auth 1.7.6 (vydání 2026-09-24) podporuje Next.js 16 a Drizzle 0.45. Uživatel to může změnit na zastávce.
- **2026-09-29:** Better Auth sdílí tabulku `users` ze zadání (žádná druhá tabulka uživatelů). Přidané sloupce, které knihovna vyžaduje: `name`, `email_verified`, `image`, `updated_at`. ID jsou UUID. Důvod: jeden zdroj pravdy o uživateli.
- **2026-09-29:** Po neúspěšné platbě (`past_due`) se placené reporty posílají ještě **7 dní**, pak stojí, dokud Stripe platbu nevybere nebo předplatné nezruší. Důvod: rozhodnutí uživatele (návrh zadání 5.5).
- **2026-09-29:** Fáze 4 se testuje ve **vlastním Stripe sandboxu Trhy denně**, ne v sandboxech jiných projektů (EstatIQ, Companion AI), do kterých je Stripe CLI přihlášené. Založí ho uživatel. Důvod: nemíchat produkty a zákazníky mezi projekty.
- **2026-09-29:** Účet vzniká jen odběrem se souhlasem. Přihlášení nový účet nezaloží a na neznámou adresu nic nepošle. Důvod: souhlas se zpracováním je podmínka zadání 5.4.

- **2026-09-30:** Zdrojem pravdy o tarifu je Stripe, databáze drží jeho odraz. Každá událost webhooku si předplatné načte ze Stripe (`syncSubscription`) a přepíše podle něj řádek uživatele, místo aby stav dopočítávala z těla zprávy. Důvod: události mohou dorazit v jiném pořadí, než nastaly, a takhle na pořadí nezáleží.
- **2026-09-30:** Platí se jen z účtu (`/ucet`), ne z prodejní stránky. Ceník na `/` dál jen vybere tarif a pošle adresu. Důvod: platit může jen přihlášený člověk s prokázanou adresou, jinak by platba visela na účtu, který nikdo nepotvrdil.
- **2026-09-30:** Zákazník ve Stripe vzniká až při prvním kliknutí na platbu, ne při odběru. Důvod: ve Stripe nemají ležet lidé, kteří nikdy neplatili.
- **2026-09-30:** Neznámé ID ceny ve webhooku tarif **nemění**, jen se zapíše do logu. Důvod: tipovat tarif by znamenalo dát nebo vzít obsah naslepo.
- **2026-09-30:** Přebytek po snížení tarifu se jen vypne (`active=false`), nemaže se, a zůstávají položky přidané nejdřív. Zpátky si je uživatel zapne sám, zvýšení tarifu je samo nezapne. Důvod: o pořadí nevíme nic lepšího a automatické zapínání by rozhodovalo za uživatele.
- **2026-09-30:** V Customer Portalu je vypnutá změna e-mailu. Důvod: e-mail je v tomto webu přihlašovací údaj, portál by ho rozešel s databází.

## Otevřené otázky
Čekají na uživatele. Po zodpovězení smazat. Plný seznam s návrhy řešení je v `PROJECT-BRIEF.md`, sekce 13.
- Název značky a doména. Do rozhodnutí se používá pracovní název Trhy denně z `src/lib/site.ts`.
- Které datové API a jaké jsou jeho licenční podmínky pro komerční a veřejné zobrazení.
- Indexy: ETF jako zástupce (SPY, QQQ), nebo licencovaný index.
- Rozsah trhů: jen USA, nebo i další.
- Ranní doručení út až so, nebo po až pá.
- Práh výrazného pohybu podle tarifu (návrh 3 % všude, případně 1,5 % pro Plus).
- Loga a ochranné známky, právní posouzení.
- Cookie lišta a režim PostHog.
- Právní texty a znění souhlasů, DPH a Stripe Tax, forma podnikání, konkurenční doložka.
- **CSP: nonce, nebo experimentální SRI?** Next.js 16 nabízí `experimental.sri` (hash skriptů při buildu), které zachovává statické stránky a keš na CDN. Rozhodnutí z 2026-09-29 (nonce přes `proxy.ts`) vzniklo bez této možnosti a platí, dokud ho uživatel nezmění. SRI je označené jako experimentální.
- Kontakt pro `security.txt`.
- **Jedna databáze pro vývoj i produkci.** `.env.local` míří na tentýž Neon, který pojede v produkci. Lokální pokusy tak píšou do produkčních dat. Návrh: před spuštěním založit druhou databázi nebo větev Neonu pro vývoj a produkční `DATABASE_URL` držet jen v proměnných Vercelu. Rozhoduje uživatel, souvisí s náklady.
- **Reset hesla role `neondb_owner`.** Heslo prošlo chatem. Po resetu v konzoli Neonu přepsat `DATABASE_URL` v `.env.local`.
- **Demo tabulka `playing_with_neon`** z výchozího nastavení Neonu v databázi zůstala. Smazat ji může jen uživatel, nemazal jsem nic, co jsem nevytvořil.
- **Rotovat klíč Stripe `sk_test_51ULOkl…`.** Ležel jako hodnota v `.env.example` (necommitnutý, z Gitu ho nic nemá) a prošel chatem. Uživatel souhlasil s rotací v Dashboardu Stripe, provést musí sám. Pak nový klíč jen do `.env.local`.
- **Nastavit `INTERNAL_HMAC_SECRET` (`openssl rand -base64 32`) a `N8N_EVENT_WEBHOOK_URL`** v `.env.local` i na Vercelu. Bez nich interní trasa vrací 503 a události do n8n neodcházejí.
- **Stripe: sandbox Trhy denně a klíče.** Kód fáze 4 je hotový, ale netestovaný: Stripe CLI je přihlášené jen do sandboxů EstatIQ a Companion AI a v `.env.local` nejsou klíče. Potřebuju `STRIPE_SECRET_KEY` (nejlépe omezený `rk_`), pak `npm run stripe:setup` (založí produkty, ceny, nastavení portálu) a `stripe listen --forward-to localhost:3000/api/webhooks/stripe` pro `STRIPE_WEBHOOK_SECRET`.
- **Placené tarify se na veřejném webu nesmí zapnout dřív než reporty.** Kód platby je hotový, ale ranní přehled se ještě neposílá (fáze 5). Zapnutí drží jen to, že v produkci nejsou klíče Stripe. Pořadí spuštění rozhoduje uživatel.
- **Souhlas s digitálním obsahem: vlastní zaškrtávátko místo možnosti Checkoutu.** Zadání 5.5 chtělo souhlas přes `consent_collection` ve Checkoutu. Udělal jsem ho jako povinné zaškrtávátko v kartě tarifu, protože Stripe k tomu nabízí jen políčko „terms of service“, které vyžaduje odkaz na podmínky nastavený v Dashboardu a míchá dvě různé věci. Čas a verze znění se ukládají do `digital_content_waiver_at` a `..._version` ještě před odchodem na platbu. Pokud to platí, opravit zadání 5.5.
- **Prázdné právní stránky, na které se odkazuje platba.** Zaškrtávátko souhlasu odkazuje na `/podminky` a nastavení portálu na `/podminky` a `/ochrana-udaju`. Obě stránky jsou prázdné s upozorněním. Před první skutečnou platbou to nestačí.
- **Stripe Tax a DPH.** `automatic_tax` jsem **nezapnul**, je to rozhodnutí o daních, ne o kódu (otevřená otázka 11). Checkout zatím vybírá jen fakturační adresu (`billing_address_collection: "required"`), aby byl znám stát zákazníka.
- **Resend: klíč a odesílací doména.** Bez nich odběr v produkci neběží. Bez ověřené domény Resend pošle jen z `onboarding@resend.dev` a jen na adresu majitele účtu, což stačí na test. Souvisí s otázkou názvu značky a domény.
- **Upozornění na plný limit je mimo obrazovku,** když člověk klikne na dlaždici níž na stránce. Objeví se nahoře v ovládací kartě. Čtečka ho oznámí, oko ne. Platí pro ukázku i účet (ukázka to měla už ve fázi 2). Návrh: zobrazit upozornění i u dlaždice, na kterou člověk klikl, nebo lištu přilepenou dole. Mění vzhled, proto rozhoduje uživatel.
- **Odchylky od zadání z fáze 3 k potvrzení:** (1) potvrzovací odkaz vede na `/potvrzeni` s tlačítkem, `GET /api/confirm` jen přesměruje (zadání 5.3 chtělo GET, který potvrzuje). (2) `users.requested_tier` navíc. (3) tabulka `rate_limits` navíc. (4) tabulky Better Auth. Pokud platí, promítnout do zadání 5.2 a 5.3.
- Reference ben.ai a chase.ai: ben.ai se načetlo jen jako text (osobní web s videem), chase.ai blokuje automatický přístup. Uživatel dodá screenshoty a řekne, co z nich chce.
- Logo (kroužek z cr-8 se nekopíruje). Do rozhodnutí je značka jen textový znak v `BrandMark`.
- **Potvrdit řešení rozporů ze zadání (fáze 2):** (1) vysvětlení příčin je ve Start i Plus podle Klíčového rozhodnutí, ne jen v Plus podle tabulky 1.1, a ceník i FAQ to tak říkají. (2) Klik na dlaždici přidává do výběru, analýzu otevírá šipka v rohu. Pokud platí, opravit tabulku 1.1 v zadání.
- **Hero "Trh za tři minuty. Ne za hodinu." a 3 minuty v kalkulačce.** Zadání chce tvrzení ověřit proti skutečné délce reportu. Report zatím neexistuje, text je převzatý z návrhu zadání.
- **SpaceX s tickerem SPCX.** Převzato ze zadání. Nepodařilo se ověřit, že akcie pod tímto tickerem obchoduje.
- **Motion:** odinstalovat, nebo nechat pro pozdější použití mimo server (například v `/ucet`)? Teď je nepoužitý.
- **Čas doručení ranního reportu.** FAQ říká "oznámíme před spuštěním". Souvisí s otázkou út až so, nebo po až pá.

## Záměrně nedělám
Aby to další relace neopravila jako chybu.
- **`/ukazka`.** Vědomě vynecháno, viz Klíčová rozhodnutí.
- **Odpolední report (Plus) a tarif Pro s alerty.** Podle plánu se staví později. Ceník to říká otevřeně, dokud to neexistuje.
- **Plynulý scroll (Lenis) a GSAP.** Navrženo, ale neschváleno. Přidat jen s důvodem.
- **Animované pozadí ze sítě bodů a ilustrace robota z uzlů** (podpisové prvky cr-8). Vědomě se nekopírují.
- **Prvky z ben.ai a chase.ai.** Nebyly vizuálně posouzeny, nepřebírá se nic.
- **Popisek vedle loga pod 1440 px.** S odkazem Přihlásit se navigace na 1280 px nevešla na řádek. Popisek se ukazuje až od 1440 px (dřív od 1280).
- **Odhlášení odběru (`/api/unsubscribe`).** Zadání ho uvádí v 5.3, fáze 3 ho nemá v krocích. Reporty zatím nechodí, takže se není z čeho odhlašovat. Přijde s reporty ve fázi 5, včetně hlaviček `List-Unsubscribe`.
- **Klientská knihovna Better Auth.** Není potřeba, vše jde přes serverové akce. Z HTTP rozhraní knihovny je otevřená jen jedna cesta (viz `.claude/security/DECISIONS.md`).
- **Veřejné vyhledávání na prodejní stránce přes API.** Dashboard dál hledá v ukázkovém katalogu v prohlížeči, aby prodejní stránka nepotřebovala databázi. Účet hledá přes `/api/symbols/search`.
- **IP adresa u relace.** Neukládá se, nepotřebujeme ji. IP se ukládá jen u souhlasu, kde ji zadání chce jako důkaz.
- **Indexování webem.** Web je `noindex` do rozhodnutí o spuštění.
- **HSTS `preload`.** Až po měsíci čistého provozu.
- **Evropské trhy.** Vyžadují jiné časy, kalendář a data.
- **Živé ceny na veřejném webu.** Vyžadují dražší licenci. Vitrína ukazuje data po uzavření burzy.
- **Právní texty.** Nepíše je Claude, jen prázdné stránky s upozorněním.
- **Tmavý režim.** Styl napodobuje papír a zadání jiný než světlý nezná. Skill `design-taste-frontend` by ho chtěl, zadání má přednost.
- **Popisek nad nadpisem hera.** Opakoval doslova popisek v hlavičce. Odebráno při sebekritice, hero vystačí s nadpisem a odstavcem.
- **Druhý předěl s kosočtvercem** (mezi analýzami a černým pruhem). Černý pruh je předěl sám o sobě. Zadání ho v pořadí sekcí uvádí, vědomě vynecháno.
- **Dopočítání čísel na všech dlaždicích.** Jen na hlavní dlaždici indexu. Dvacet počítadel najednou by byl šum.
- **Popisek vedle loga pod 1280 px.** Na 1024 px se s navigací nevešel na řádek a stránka přetékala.
- **Grafy v e-mailu.** `ReportEmail` má čísla, štítek změny a větu, ne křivku. Obrázky grafů nemají zdroj, dokud neběží pipeline.
- **Noční rekonciliace Stripe a Neonu (W15).** Záchranná síť pro ztracené webhooky patří do n8n, tedy do fáze 5.
- **Cena tarifu Pro.** `stripe-setup.mts` zakládá jen Start a Plus. Pro se podle plánu staví později a web to říká.
- **Zapínání vypnutých položek při zvýšení tarifu.** Vědomě ruční, viz Klíčová rozhodnutí.

## Seznam změn
Nejnovější nahoře.

### 2026-09-30: Commit a push na GitHub
- **Co:** Rozpracované změny fáze 4 (platby, migrace `0003_billing`, `scripts/stripe-setup.mts`) a kroku 22 fáze 5 (interní trasy) commitnuty jedním commitem „fáze 4: platby a podepsané interní trasy“. Založen soukromý repozitář `trhy-denne` a `main` do něj odeslána.
- **Proč:** na pokyn uživatele.
- **Dopad:** Kód je mimo počítač. Před commitem ověřeno, že `.env.local` je v `.gitignore` a v diffu nejsou klíče ani přístupové řetězce. Fáze 4 je v Gitu, i když zastávka kroku 21 neproběhla (chybí sandbox Stripe), commit tedy neznamená schválení fáze. Repozitář je soukromý, zveřejnění je samostatné rozhodnutí.
- **Soubory:** celý repozitář, `memory/memory.md`

### 2026-09-30: Fáze 5, krok 22: podepsané interní trasy
- **Co:** `src/lib/internal-auth.ts` (HMAC-SHA256 nad `značka.tělo`, `timingSafeEqual`, značka max 5 minut stará, obousměrně). `POST /api/internal/render-report`: dávka do 100 UUID, Zod, vrací `reports` (HTML) a `skipped` s důvodem, bez `report_ready` 409. Data z `market_daily`, `ticker_daily` a výběru třemi dotazy (`src/lib/reports.ts`), šablona `src/emails/ReportEmail.tsx` (jedna věta „Bez výrazného pohybu.“ u položek bez pohybu, „Za tento den nemáme data.“ u chybějících čísel). `src/lib/n8n-events.ts`: `notifyN8n` po každé zpracované události Stripe (`checkout_completed`, `subscription_updated`, `subscription_canceled`, `payment_failed`), časový limit 5 s, chyba se jen zaloguje. `syncSubscription` a `applyCheckoutSession` teď vracejí výsledný tarif a stav. `INTERNAL_HMAC_SECRET` a `N8N_EVENT_WEBHOOK_URL` v `env.ts`, `internalRoutesReady()`.
- **Proč:** krok 22 fáze 5, na pokyn uživatele jen tento krok. Kroky 23 až 25 blokují otevřené otázky 2, 5, 6, 9 a chybějící přístup k n8n.
- **Dopad:** Nová interní trasa a odchozí volání, zapsáno do `.claude/security/` (STATE, DECISIONS). **Ověřeno:** typy, lint a `npm run build` čisté, podpis izolovaně (platný, změněné tělo, špatný a krátký podpis, prošlá značka, chybějící hlavičky). **Neověřeno:** trasa proti databázi (nejsou data pipeline, vkládat testovací řádky do sdíleného Neonu jsem nechtěl), odchozí volání proti skutečnému n8n, vzhled e-mailu. Fáze 4 dál nemá zastávku. Do `.env.example` se před tím dostal skutečný klíč Stripe jako hodnota, vyprázdněno, viz Otevřené otázky.
- **Soubory:** `src/lib/` (`internal-auth.ts`, `n8n-events.ts`, `reports.ts`, `report-email.tsx`, `env.ts`, `billing.ts`), `src/emails/ReportEmail.tsx`, `src/app/api/internal/render-report/route.ts`, `src/app/api/webhooks/stripe/route.ts`, `.env.example`, `AGENTS.md`, `.claude/security/STATE.md`, `.claude/security/DECISIONS.md`

### 2026-09-30: Revize integrace Stripe proti dokumentaci
- **Co:** Integraci fáze 4 jsem prošel proti skillu `stripe-best-practices` a proti `docs.stripe.com/security/guide`. Doplněno do `.claude/security/CSP-LOG.md`: oficiální seznam direktiv Stripe pro Checkout (`connect-src`, `frame-src`, `script-src` na `checkout.stripe.com`, `img-src` na `*.stripe.com`) platí pro **vloženou** variantu přes Stripe.js, kterou nepoužíváme, takže se nepřidává. O `form-action` dokumentace Stripe nemluví vůbec.
- **Proč:** uživatel požádal o revizi integrace proti doporučeným postupům.
- **Dopad:** `form-action` s doménami Stripe zůstává, ale opírá se o chování prohlížeče a cizí zdroje, ne o dokumentaci Stripe. Zápis to teď říká přesně. **Nefungovalo:** plánovač `stripe_implementation_planner` (MCP `mcp.stripe.com` vyžaduje autorizaci, relace je neinteraktivní) ani `stripe docs` (CLI je 1.42.14, skill vyžaduje 1.50.9; globální upgrade jsem nedělal, CLI je společné s projekty EstatIQ a Companion AI). Bez rozhodnutí zůstává, jestli souhlas s digitálním obsahem sbírat i přes `consent_collection` ve Checkoutu, aby ho Stripe nesl u sezení.
- **Soubory:** `.claude/security/CSP-LOG.md`

### 2026-09-30: Fáze 4, platby (kroky 19 a 20)
- **Co:** `src/lib/billing.ts`: zákazník ve Stripe (`ensureCustomer`, zámek řádku plus idempotentní klíč), Checkout v režimu `subscription`, Customer Portal, `syncSubscription` a `applyCheckoutSession`, sbalení stavů Stripe do `active`, `past_due` a `canceled`, začátek 7denní lhůty v `past_due_since`, vypnutí přebytku po snížení tarifu. Webhook `POST /api/webhooks/stripe`: podpis nad surovým tělem (`constructEventAsync`), idempotence zápisem do `stripe_events`, události `checkout.session.completed`, `customer.subscription.created/updated/deleted` a `invoice.payment_failed`. Karta tarifu `src/app/ucet/TierCard.tsx` s povinným zaškrtávátkem souhlasu, tlačítky Start a Plus, stavem předplatného, datem další platby, lhůtou po neúspěšné platbě a tlačítkem do portálu. Serverové akce `startCheckout` a `openPortal`, limit `billingUser` (10 za 10 minut). `formatDate` v `src/lib/format.ts`. `scripts/stripe-setup.mts` a `npm run stripe:setup` (produkty, ceny podle `lookup_key`, nastavení portálu). Texty, které tvrdily „platby nespouštíme“, jsou podmíněné `paymentsReady()` (formulář odběru, upozornění na limit v účtu, karta tarifu).
- **Proč:** kroky 19 a 20 fáze 4 zadání.
- **Dopad:** `form-action` v `src/proxy.ts` dostal `checkout.stripe.com` a `billing.stripe.com`, protože prohlížeč tuto direktivu hlídá i na přesměrování po odeslání formuláře a bez JavaScriptu by platba skončila zablokovaná. Zapsáno do `.claude/security/CSP-LOG.md` včetně toho, že to **není ověřené v prohlížeči**. `script-src`, `frame-src` ani `connect-src` se nemění. Definiční seznam v `/ucet` nahrazen mřížkou, protože karta tarifu nese formuláře a ty do `dl` nepatří. **Ověřeno:** typy, lint a `npm run build` čisté, webhook bez klíčů vrací 503, `/ucet` bez relace přesměruje na přihlášení, hlavička CSP na `/` nese nové domény. **Neověřeno:** celý tok platby a vzhled karty tarifu. Sandbox Stripe neexistuje, viz Otevřené otázky. Pro vizuální kontrolu jsem záměrně nespustil druhý vývojový server, na portu 3000 běžel server jiné relace a dva `next dev` nad jedním `.next` si lezou do cesty.
- **Soubory:** `src/lib/billing.ts`, `src/lib/stripe.ts`, `src/lib/rate-limit.ts`, `src/lib/format.ts`, `src/app/api/webhooks/stripe/route.ts`, `src/app/ucet/` (`TierCard.tsx`, `page.tsx`, `actions.ts`), `src/components/` (`WatchlistPicker.tsx`, `SignupForm.tsx`, `sections/ClosingCta.tsx`), `src/proxy.ts`, `scripts/stripe-setup.mts`, `package.json`, `.env.example`, `.claude/security/CSP-LOG.md`

### 2026-09-29: Příprava fáze 4 (zapsáno zpětně 2026-09-30)
- **Co:** Nainstalováno `stripe` 22.6.2. Do `src/lib/env.ts` přidány `STRIPE_SECRET_KEY` (jen `rk_` nebo `sk_`), `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_START`, `STRIPE_PRICE_PLUS`, `STRIPE_PORTAL_CONFIGURATION` a funkce `paymentsReady()`. Do `users` přidány `digital_content_waiver_version`, `past_due_since` a `cancel_at_period_end` (migrace `drizzle/0003_billing.sql`). Vznikl `src/lib/stripe.ts` s klientem a mapováním ceny na tarif jen na serveru.
- **Proč:** rozjezd fáze 4. **Záznam chyběl:** práce zůstala necommitnutá a nezapsaná, zapisuju ji zpětně, aby se nedala vysvětlit jen z diffu.
- **Dopad:** Migrace 0003 už je nasazená v Neonu (viz záznam o Neonu). V `src/lib/stripe.ts` jsem 2026-09-30 nahradil štítek `CHECKOUT_INTEGRATION_ID` z `trhy-denne-ucet-hlejiuek` na `ucet-tarif`: náhodná přípona nic neznamenala a nikde nebyla vysvětlená.
- **Soubory:** `package.json`, `package-lock.json`, `src/lib/env.ts`, `src/lib/stripe.ts`, `src/db/schema.ts`, `drizzle/0003_billing.sql`, `drizzle/meta/`

### 2026-09-30: Zapojení skutečné databáze Neon
- **Co:** `DATABASE_URL` v `.env.local` přesměrována z lokálního Postgresu na projekt Neonu (poolovaný endpoint, `eu-central-1`, Postgres 18.6); lokální adresa zůstala v souboru jako komentář. Proti Neonu proběhly migrace 0000 až 0003 (včetně rozpracované `0003_billing`) a `db:seed` (50 položek katalogu, 20 ve vitríně, `plan_limits`). Ověřen HTTP ovladač i transakce přes WebSocket Pool, celý tok odběru (`POST /api/subscribe` → potvrzovací e-mail do konzole → `POST /api/confirm`) zapsal a potvrdil uživatele včetně souhlasu, IP a verze znění. Testovací řádek jsem pak smazal, databáze je opět bez uživatelů.
- **Proč:** na pokyn uživatele, který dodal přístupové údaje. Zavírá otevřenou otázku „Neon: kdo založí projekt?“.
- **Dopad:** `accountsReady()` je lokálně splněná (e-mail díky vývojovému režimu), odběr, přihlášení a účet už nevracejí 503. Vývoj i budoucí produkce sdílejí jednu databázi, viz Otevřené otázky. Heslo role prošlo chatem, patří resetovat. Zapsáno i do `.claude/security/STATE.md`. **Nefungovalo:** `DELETE` bez `WHERE` nad `rate_limits` mi zablokovala bezpečnostní pojistka nástroje, tři technické záznamy tam zůstaly a samy vyprší.
- **Soubory:** `.env.local` (mimo Git), `.claude/security/STATE.md`, `memory/memory.md`, `memory/index.md`

### 2026-09-29: Zastávka fáze 3 schválena
- **Co:** Uživatel schválil fázi 3 a požádal o commit. Rozhodl lhůtu po neúspěšné platbě (7 dní) a samostatný Stripe sandbox pro fázi 4.
- **Proč:** na pokyn uživatele.
- **Dopad:** Odblokovává fázi 4. Odchylky od zadání z fáze 3 (bod v Otevřených otázkách) uživatel výslovně nepotvrdil, zůstávají otevřené.
- **Soubory:** `memory/memory.md`, `memory/index.md`

### 2026-09-29: Fáze 3, databáze, odběr a přihlášení
- **Co:** Schéma podle zadání 5.2 v Drizzle a tři migrace (`pg_trgm`, schéma, `plan_limits`). Seed katalogu (50 položek) a vitríny (20) z ukázkových dat, SPY a QQQ jako `etf`. Odběr s double opt-in: souhlas s časem, IP a verzí, token jen jako SHA-256 s platností 48 h, e-maily v React Email (potvrzení, přihlášení, „odběr už máte“). Přihlášení Better Auth s magic linkem, stránky `/prihlaseni`, `/prihlaseni/overit`, `/potvrzeni`, `/dekujeme`, `/ucet`. Výběr v účtu přes `PUT /api/watchlist` s transakčním limitem podle 5.7, hledání `/api/symbols/search` nad trigramy. Omezení počtu požadavků v Postgresu. `WatchlistPicker` rozdělen na ukázku a účet se společným zobrazením. `checkAdd` bere limity z `plan_limits`. Odkaz Přihlásit v hlavičce. Formulář odběru umí 429 a bez JS přesměruje na `/dekujeme`. Patička větu „Web zatím neslouží k odběru“ ukazuje jen tehdy, když odběr neběží. Lokální vývoj přes `docker-compose.yml`. `.env.example` a výjimka v `.gitignore`.
- **Proč:** kroky 14 až 17 fáze 3 zadání.
- **Dopad:** Ověřeno lokálně (podrobně v `.claude/security/AUDIT-LOG.md`): 17 kontrol toku v Chrome, souběh přímo na Postgresu (bez zámku 14 položek při limitu 5, se zámkem 5), CSP na nových stránkách v produkčním buildu bez porušení, navigace na jednom řádku od 1024 do 1920 px, lint a typy čisté. **Nefungovalo:** test souběhu přes HTTP nic nedokazuje, protože lokální proxy Neonu řadí spojení za sebe (stejný výsledek i bez zámku). `db.localtest.me` z návodu Neonu tady DNS nepřeloží, používá se `localhost`. **Opraveno po kontrole:** navigace se na 1280 px zalomila, upozornění u Free mělo „Start jich má 5“ bez předmětu, potvrzení slibovalo „první přehled v neděli“, přestože reporty neběží. Při testu jsem příkazem `pkill -f "next dev"` ukončil i starý vývojový server tohoto projektu z 15:42 na portu 3000.
- **Soubory:** `src/db/`, `drizzle/`, `drizzle.config.ts`, `docker-compose.yml`, `scripts/seed.mts`, `src/emails/`, `src/lib/` (env, auth, email, subscriptions, watchlist, rate-limit, http, plans, symbols, site), `src/app/api/` (subscribe, confirm, auth, watchlist, symbols/search), `src/app/` (prihlaseni, potvrzeni, dekujeme, ucet), `src/components/` (WatchlistPicker, PageShell, Header, Footer, SignupForm), `src/data/sample.ts`, `package.json`, `tsconfig.json`, `.gitignore`, `.env.example`, `AGENTS.md`, `.claude/security/`

### 2026-09-29: Zastávka fáze 2 schválena
- **Co:** Uživatel schválil fázi 2 a požádal o commit. Na pět otázek ze zastávky (vysvětlení ve Startu, klik na dlaždici, tvrzení o třech minutách, ticker SPCX, odinstalace Motion) výslovně neodpověděl, proto zůstávají v Otevřených otázkách a tabulka 1.1 v zadání se zatím neopravuje.
- **Proč:** na pokyn uživatele.
- **Dopad:** Odblokovává fázi 3.
- **Soubory:** `memory/memory.md`, `memory/index.md`

### 2026-09-29: Kontrola fáze 2 a opravy
- **Co:** Stránka prošla v Chrome na sedmi šířkách (360 až 1440 px) a ve WebKitu, s omezeným pohybem, klávesnicí a Lighthouse (mobil 93/100/100, počítač 100/100/100, SEO 60 kvůli `noindex`). Opraveno podle měření: nadpis hera se lámal na tři řádky (menší škála, nejvýš 5 rem), šipka k analýze překrývala názvy v dlaždicích (jen čtverec se šipkou, na mobilu název pod ikonou), monogramy o čtyřech písmenech byly nečitelné (nejvýš tři znaky), pole e-mailu v závěrečném formuláři bylo zmáčknuté (`flex-1` ve sloupci), tlačítko Free v ceníku se lámalo (popisek "Začít zdarma" ze zadání, čtyři sloupce až od 1280 px), řádky analýz měly přístupný název slepený bez mezer a pak neodpovídaly viditelnému textu (WCAG 2.5.3), v závěrečném formuláři byl souhlas až za tlačítkem, hlavička z fáze 1 přetékala na 1024 px o 6 px. Texty prošly skillem `humanize-text-cs`: odstraněna trojí skoro stejná věta o doporučeních, trojice v úvodu analýz, opakování "nedělním přehledem" a dvakrát "navíc".
- **Proč:** kroky 12 a 13 fáze 2.
- **Dopad:** `.claude/security/STATE.md` měl z fáze 1 chybný řádek o nasazeném zástupném `security.txt`, opraveno. Safari nejde lokálně testovat přímo kvůli `upgrade-insecure-requests` (zapsáno do STATE a `AGENTS.md`).
- **Soubory:** `src/components/`, `src/app/`, `.claude/security/`, `AGENTS.md`

### 2026-09-29: Fáze 2, prodejní stránka s ukázkovými daty
- **Co:** Postaveny všechny sekce ze zadání 4: hero, problém s kalkulačkou, jak to funguje, dashboard, analýzy, důvěra, pro koho, ceník se subgridem, FAQ, závěrečná výzva a patička. Dashboard (`WatchlistPicker`) má vyhledávání v ukázkovém katalogu, přepínač Start/Plus/Pro, počítadlo míst, hlídání limitu přes `checkAdd` s nabídkou vyššího tarifu a označení přebytku po snížení tarifu. Výběr žije v `localStorage`. Analýzy (`AnalysisList`) řadí podle velikosti pohybu, ukazují 8 řádků, rozbalují panel s popisem, čísly a křivkou a u pohybu nad 3 % zamčený blok. Formulář odběru (hero a závěr s tarifem) validuje na klientu i serveru a posílá na `POST /api/subscribe`, která zatím vrací 503. Ukázková data rozšířena na vitrínu 20 položek s deterministickými 30denními křivkami a katalog 30 položek bez dat. Ikony firem generuje `scripts/gen-icons.mjs` (11 log, 7 monogramů, přesně podle zadání 2.7). Prázdné právní stránky. Odkazy v hlavičce vedou přes `/#…`, aby fungovaly i z právních stránek.
- **Proč:** kroky 9 až 11 fáze 2 zadání.
- **Dopad:** Pohyb bez Motion (Klíčová rozhodnutí). Práh výrazného pohybu 3 % je návrh ze zadání a web ho nikde číslem neslibuje. Popis indexů přiznává, že jde o fondy SPY a QQQ, ne o hodnotu indexu (otevřená otázka 3). Formuláře zatím nic neukládají a web to po odeslání říká.
- **Soubory:** `src/app/page.tsx`, `src/app/api/subscribe/route.ts`, `src/app/podminky/`, `src/app/ochrana-udaju/`, `src/app/disclaimer/`, `src/app/globals.css`, `src/components/sections/`, `src/components/` (WatchlistPicker, AnalysisList, SignupForm, TimeCalculator, SymbolIcon, Sparkline, CountUp, useDrawOnView, Footer, LegalPage, Header, TickerTape), `src/components/ui/` (ChangeChip, Segmented), `src/lib/` (plans, signup, symbols, format, site), `src/data/sample.ts`, `src/data/icons.generated.ts`, `scripts/gen-icons.mjs`, `package.json`

### 2026-09-29: Návrh a kritika prodejní stránky (fáze 2, povinný krok 2.1)
- **Co:** Zapsán návrh rozvržení všech sekcí prodejní stránky, jeho kritika a rozpory v zadání, které stavba musí nějak vyřešit. Doinstalovány plánované závislosti `zod` a `simple-icons` (jen pro generovací skript, CC0).
- **Proč:** sekce 2.1 zadání chce návrh a kritiku zapsané před psaním UI.
- **Dopad:** řídí stavbu fáze 2. Rozpory níže jsou vratné textové a interakční volby, proto se staví podle navrženého řešení a uživatel je potvrdí na zastávce.
- **Soubory:** `memory/memory.md`, `package.json`, `package-lock.json`

**Čtení zadání (skill `design-taste-frontend`, bod 0.B):** prodejní stránka placeného newsletteru pro české drobné investory, neo-brutalistický papírový jazyk, nativní CSS a Tailwind v4 bez knihovny komponent. Číselníky skillu: variabilita 7, pohyb 4 (vzácný a zdůvodněný), hustota 5 (dashboard nese data). Tmavý režim se nedělá, styl napodobuje papír a zadání jiný než světlý nezná.

**Návrh: kompozice po sekcích (každá sekce jiná rodina rozvržení)**

```
HERO 7/5          | label, H1 2 řádky (2. v lososovém rámu), odstavec, formulář | tabule v rámu, 5 řádků, přesah vpravo
PROBLÉM 5/7       | nadpis a odstavec vlevo | karta paper s jezdcem a velkým číslem, posunutá dolů o jeden řádek mřížky
JAK 3 karty       | mist, salmon, sand, čísla 01 až 03 v kroužku, mikro-ilustrace z tvarů, tečkovaná spojnice
  ◇ předěl
DASHBOARD bento   | ovládací lišta (hledání, přepínač tarifu, počítadlo míst, můj výběr) | S&P 500 6×2 + 4 dlaždice 3×1 + zbytek po čtyřech
ANALÝZY seznam    | jedna velká karta paper, řádky podle velikosti pohybu, 8 viditelných, tlačítko na zbytek
  ◇ předěl
DŮVĚRA ink pruh   | nadpis vlevo | seznam definic vpravo, oddělený krémovými linkami
PRO KOHO 2 karty  | mist vyšší vlevo, paper nižší vpravo a posunutá dolů
CENÍK 4 sloupce   | subgrid 7 řádků, Plus lososový a o 12 px výš
FAQ               | nadpis vlevo přilepený, otázky vpravo jako karty details
OBJEDNAT salmon   | karta paper uprostřed, přepínač Free/Start/Plus, e-mail, souhlas
PATIČKA ink
```

Mobil: vše do jednoho sloupce, bento na dva sloupce s indexem přes celou šířku, ceník pod sebou s popiskem u každé hodnoty.

**Pohyb (každý má důvod):** vstup hera je jediná orchestrovaná sekvence (řádky nadpisu, rámeček, řádky tabule a jejich křivky). Křivky v dashboardu se nakreslí při prvním vstupu do obrazovky, v analýzách při rozbalení. Dopočítání čísla jen na hlavní dlaždici indexu. Dlaždice po přidání "zapadne" a zlososoví. Vše vypnuté při `prefers-reduced-motion`.

**Kritika návrhu (co vypadalo jako šablona nebo kopie a co s tím)**

| Podezřelé | Riziko | Co s tím |
| --- | --- | --- |
| Tabule v hero | skill ji řadí mezi nejčastější znaky AI webu (falešný screenshot z divů) | Není to obrázek UI, ale skutečné komponenty dashboardu (stejný štítek změny, křivka, ikona, stejná data) a nese štítek ukázkových dat. |
| Řada tří karet | klasický "feature row" | Zadání ji povoluje jen tady. Kroky jsou skutečná posloupnost, spojuje je tečkovaná linka, ilustrace jsou z tvarů, ne ze sady ikon. |
| Bento dlaždice | krém na krému s textem | Barva nese druh položky (mist index, sand akcie, salmon ve výběru), takže rozdíl dlaždic je informace, ne dekorace. Počet buněk sedí na obsah (poslední řada se roztáhne, žádná prázdná buňka). |
| Velké číslo v kalkulačce | vymyšlená přesnost | Číslo počítá čtenář jezdcem a předpoklady (252 dní, 3 minuty) stojí pod ním. |
| Ceník se zvýrazněným prostředním tarifem | nejokoukanější vzor SaaS webu | Zadání ho chce. Vyvažuje ho subgrid, který z karet dělá skutečnou srovnávací tabulku, a poctivé "Připravujeme" u Pro. |
| Popisky velkými písmeny nad sekcemi | skill povoluje nejvýš jeden na tři sekce | Jediný nad nadpisem je v hero. Ostatní popisky nesou data (stav, kategorie, ukázková data). |
| Lososová barva | zadání fáze 2 ji rozšiřuje (výběr, Plus, závěrečný pruh, ručka jezdce, konec křivky) | Pořád vzácná plocha. Na kartách sekcí se nepoužívá, kromě kroku 02 v "Jak to funguje", kde to zadání výslovně chce. |

**Rozpory v zadání a navržené řešení (potvrdit na zastávce)**
1. **Vysvětlení příčin ve Start:** tabulka 1.1 ho dává až do Plus, Klíčové rozhodnutí z 2026-09-29 a sekce 4.5 do Start i Plus. Stavím podle Klíčového rozhodnutí, protože je výslovné a novější. Plus pak odlišuje 25 položek, kalendář výsledků a dividend, archiv a odpolední report (připravujeme).
2. **Klik na dlaždici:** 4.4 říká "přidá do výběru", 4.5 "otevře řádek analýzy". Obojí jedním klikem nejde. Dlaždice přidává, v rohu má samostatný odkaz "Analýza", který otevře řádek a doscrolluje (funguje i bez JavaScriptu jako obyčejná kotva).
3. **Tlačítko Free v ceníku:** zdánlivý rozpor 4.8 ("Začít zdarma") a 2.9 (stejná akce, stejný název). Nakonec bez rozporu: tlačítko v ceníku nic neodesílá, jen vybere tarif a posune na formulář, takže "Začít zdarma" a "Vybrat tarif" jsou jiné akce než "Odebírat zdarma" ve formuláři. Drží se zadání. "Odebírat zdarma" se v užším sloupci ceníku navíc lámalo na dva řádky.
4. **Motion:** zadání chce Motion. Jeho `initial` vykreslí na serveru atribut `style`, který přísné CSP bez `'unsafe-inline'` zablokuje. Veškerý pohyb fáze 2 proto dělá CSS a zápis přes CSSOM. Motion zůstává nainstalovaný, ale nepoužitý.

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
