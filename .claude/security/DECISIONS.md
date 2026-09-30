# DECISIONS: bezpečnostní rozhodnutí a jejich cena

## 2026-09-29: CSP s nonce přes proxy.ts, ne statické hlavičky
**Rozhodnutí:** nonce se generuje v `src/proxy.ts` pro každý požadavek.
**Cena:** kořenový layout čte `headers()`, takže se všechny stránky vykreslují
dynamicky. Mizí statická keš a keš na CDN.
**Alternativa, která se nevybrala:** `experimental.sri` (hashe skriptů při buildu)
zachovává statické stránky. Je označená jako experimentální a rozhodnutí o nonce
padlo dřív, než jsme o ní věděli. Vedeno jako otevřená otázka v `memory/memory.md`.

## 2026-09-29: style-src zůstává bez unsafe-inline
**Rozhodnutí:** `style-src 'self' 'nonce-...'`, v produkci bez `'unsafe-inline'`.
**Proč to šlo:** původní zadání počítalo s tím, že `'unsafe-inline'` bude kvůli
Motion potřeba. Zatím není. Kostra fáze 1 nemá jediný inline styl, ověřeno
v prohlížeči bez jediného porušení CSP.
**Co to stojí:** inline atribut `style` v HTML je zakázaný. Hodnoty, které se
počítají za běhu, se musí nastavovat přes CSSOM (`element.style.setProperty`),
což CSP neřeší. Tak to dělá `TickerTrack`.
**Kdy se to přehodnotí:** až se ve fázi 2 nasadí Motion. Pokud si vynutí inline
styly v značkách, mění se knihovna, ne politika.
**Výsledek fáze 2:** Motion by si je vynutil (`initial` se vykresluje do atributu
`style`), takže se podle tohoto pravidla změnila knihovna: pohyb dělá CSS. Viz níže.

## 2026-09-29: X-XSS-Protection: 0
**Rozhodnutí:** hlavička se posílá s nulou, tedy vypnuto.
**Proč:** starý XSS filtr prohlížečů sám tvořil zranitelnosti. Ochranu dělá CSP.

## 2026-09-29: HSTS bez preload
**Rozhodnutí:** `max-age=63072000; includeSubDomains`, bez `preload`.
**Proč:** zápis do preload listu se špatně vrací zpět. Přidá se až po měsíci
čistého provozu na skutečné doméně.

## 2026-09-29: Pohyb prodejní stránky bez Motion
**Rozhodnutí:** vstup hera, kreslení křivek, zapadnutí dlaždic i rozbalení řádků
jsou CSS animace spouštěné třídami a atributy `data-*`. Dopočítání čísla mění text
v DOM. Nic z toho nepíše atribut `style` do HTML.
**Proč:** `motion/react` s `initial` vykreslí na serveru `style="opacity:0;…"`, který
přísné `style-src` bez `'unsafe-inline'` zablokuje. Zeslabit politiku kvůli animacím
pravidla nedovolují.
**Cena:** Motion zůstává v `package.json` nepoužitý. Rozhodnutí o odinstalaci je na
uživateli (Otevřené otázky v `memory/memory.md`).

## 2026-09-29: POST /api/subscribe odpovídá 503, dokud nic neukládá
**Rozhodnutí:** trasa už teď ověřuje původ, typ a velikost těla a validuje Zodem,
ale platný požadavek dostane 503 a nic se neuloží.
**Proč:** zadání 5.3 chce pravdivou odpověď místo falešného úspěchu a formulář musí
jít skutečně odeslat a vyzkoušet. Omezení počtu požadavků chybí vědomě, dokud trasa
nic nedělá. Přijde ve fázi 3.

## 2026-09-29: Z Better Auth je přes HTTP otevřená jediná cesta
**Rozhodnutí:** `src/app/api/auth/[...all]/route.ts` pouští jen `GET /api/auth/magic-link/verify`.
Odeslání odkazu a odhlášení jdou přes serverové akce.
**Proč:** plugin magic link pošle odkaz na jakoukoli adresu (`disableSignUp` se hlídá až při
ověření) a jeho limit počtu požadavků je ve výchozím stavu v paměti instance. Otevřená cesta
`/sign-in/magic-link` by šla použít k zasílání e-mailů na cizí adresy a obešla by vlastní limity.
**Cena:** klientskou knihovnu Better Auth nejde použít. Nepotřebujeme ji.

## 2026-09-29: Jednorázové odkazy z e-mailu vedou na stránku s tlačítkem
**Rozhodnutí:** potvrzení odběru (`/potvrzeni`) i přihlášení (`/prihlaseni/overit`) spotřebují
token až po odeslání formuláře. `GET /api/confirm` ze zadání 5.3 jen přesměruje na stránku.
**Proč:** bezpečnostní skenery pošty (například Safe Links) odkazy otevírají. Token by
spotřebovaly dřív než člověk. U double opt-in by navíc potvrzení udělal robot, ne adresát.
**Cena:** jedno kliknutí navíc.

## 2026-09-29: Formuláře neprozradí, kdo má účet
**Rozhodnutí:** odběr i přihlášení odpovídají stejně pro novou i existující adresu. Odkaz pro
přihlášení se posílá v `after()`, takže se neliší ani doba odpovědi. Potvrzený odběratel,
který se přihlásí znovu, dostane e-mail „odběr už máte“, aby text „poslali jsme e-mail“
zůstal pravdivý.
**Cena:** člověk bez účtu se na přihlašovací stránce nedozví, že účet nemá. Text to říká
podmínkou („pokud k adrese patří účet“).

## 2026-09-29: Omezení počtu požadavků v Postgresu
**Rozhodnutí:** tabulka `rate_limits`, pevné okno, jeden atomický příkaz. Klíč je hash.
**Proč:** na Vercelu běží víc instancí, počítadlo v paměti by nic nehlídalo. Další služba
(Upstash a podobně) by byla nová integrace a nový účet.
**Cena:** jeden zápis do databáze navíc na každý chráněný požadavek. Při velkém provozu
přehodnotit, případně doplnit pravidla firewallu Vercelu.

## 2026-09-30: Stripe je ve `form-action`, nikde jinde v CSP
**Rozhodnutí:** `form-action 'self' https://checkout.stripe.com https://billing.stripe.com`.
Do `script-src`, `frame-src` ani `connect-src` nepřidáno nic.
**Proč:** prohlížeče hlídají `form-action` i na přesměrování, které přijde jako odpověď na
odeslaný formulář, ne jen na první cíl. Se zapnutým JavaScriptem serverovou akci odesílá
`fetch` a přesměrování provede router, takže by stačilo `'self'`. Bez JavaScriptu jde o
klasické odeslání formuláře a platba by skončila zablokovaným přesměrováním.
**Cena:** dvě celé domény v politice, bez zástupných znaků a jen pro cíl odeslání formuláře.
Nic se nevkládá do stránky. **Neověřeno v prohlížeči**, sandbox Stripe zatím není.

## 2026-09-30: Souhlas s digitálním obsahem je vlastní zaškrtávátko
**Rozhodnutí:** povinné políčko v kartě tarifu v `/ucet`, ne `consent_collection` ve Checkoutu.
Čas a verze znění se ukládají ještě před odchodem na platbu.
**Proč:** Stripe k tomu nabízí jen políčko „terms of service“, které vyžaduje odkaz na podmínky
nastavený v Dashboardu a míchá souhlas s podmínkami se vzdáním se lhůty na odstoupení. Vlastní
políčko drží znění i jeho verzi v repozitáři a důkaz souhlasu v naší databázi.
**Cena:** odchylka od zadání 5.5, čeká na potvrzení uživatelem. Znění musí posoudit právník.

## 2026-09-30: Tarif se čte ze Stripe, ne z těla webhooku
**Rozhodnutí:** každá událost webhooku si předplatné načte ze Stripe a přepíše podle něj řádek
uživatele. Neznámé ID ceny tarif nemění, jen se zapíše do logu.
**Proč:** události mohou dorazit v jiném pořadí, než nastaly. Dopočítávání stavu z těla zprávy
by při přehozeném pořadí nechalo uživatele na cizím tarifu.
**Cena:** jedno volání do Stripe na každou událost.

## 2026-09-30: Interní trasy podepisuje HMAC s časovou značkou, oběma směry
**Rozhodnutí:** `POST /api/internal/render-report` (n8n volá Next.js) i události po platbě (Next.js volá n8n)
nesou `x-internal-timestamp` a `x-internal-signature` = HMAC-SHA256 nad `značka.tělo` sdíleným
`INTERNAL_HMAC_SECRET` (aspoň 32 znaků). Značka starší 5 minut se odmítne. Bez tajemství trasa vrací 503.
**Proč:** zadání 5.6. Podpis je jediná ochrana trasy, která vrací osobní data (adresy se nevracejí, ale
výběr položek ano), a nepodepsaná odchozí zpráva by n8n nedokázala odlišit od cizí.
**Cena:** dodržet přesné hodiny na obou stranách (5 minut tolerance). Ochrana proti opakování je jen
časová, žádný seznam použitých značek. Odchozí zpráva nese jen ID uživatele, tarif a stav, žádný e-mail.
Pád n8n platbu neblokuje: odeslání má časový limit 5 s a chyba se jen zaloguje.
