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
