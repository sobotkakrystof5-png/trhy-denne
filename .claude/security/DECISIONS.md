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

## 2026-09-29: X-XSS-Protection: 0
**Rozhodnutí:** hlavička se posílá s nulou, tedy vypnuto.
**Proč:** starý XSS filtr prohlížečů sám tvořil zranitelnosti. Ochranu dělá CSP.

## 2026-09-29: HSTS bez preload
**Rozhodnutí:** `max-age=63072000; includeSubDomains`, bez `preload`.
**Proč:** zápis do preload listu se špatně vrací zpět. Přidá se až po měsíci
čistého provozu na skutečné doméně.
