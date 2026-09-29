# STATE: skutečný stav zabezpečení

Co je opravdu nasazené. Nepsat sem plány, ty patří do `DECISIONS.md`.
Poslední ověření: 2026-09-29 (fáze 2), lokálně na `npm run start`, ne na veřejné adrese.

## Hlavičky odpovědi

Nastavuje `src/proxy.ts` pro všechny trasy mimo `/api`, statické soubory a prefetch.
Pro `/api` je zvlášť blok v `next.config.ts`.

| Hlavička | Hodnota | Ověřeno |
| --- | --- | --- |
| `Content-Security-Policy` | viz níže, s nonce a `strict-dynamic` | ano, lokálně |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains` | ano, lokálně (mimo vývoj) |
| `X-Content-Type-Options` | `nosniff` | ano |
| `X-Frame-Options` | `DENY` | ano |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | ano |
| `Cross-Origin-Opener-Policy` | `same-origin` | ano |
| `Cross-Origin-Resource-Policy` | `same-origin` | ano |
| `X-XSS-Protection` | `0` | ano |
| `Permissions-Policy` | 14 zakázaných funkcí, `fullscreen=(self)` | ano |
| `X-Powered-By` | odstraněna (`poweredByHeader: false`) | ano |

`preload` u HSTS **není** a nebude do měsíce čistého provozu.

## CSP

```
default-src 'self';
script-src 'self' 'nonce-<náhodný>' 'strict-dynamic';
style-src 'self' 'nonce-<náhodný>';
img-src 'self' blob: data:;
font-src 'self';
connect-src 'self';
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
frame-src 'none';
manifest-src 'self';
upgrade-insecure-requests
```

Ve vývoji přibývá `'unsafe-eval'` ve `script-src` (React ho potřebuje na stopy chyb)
a `'unsafe-inline'` ve `style-src`. V produkci ani jedno.

**`style-src` je bez `unsafe-inline` a ověřeně to stačí.** Stránka fáze 1 nemá
jediný inline styl ani `<style>` a v konzoli není žádné porušení CSP.
Rychlost kurzovního pásu se nastavuje přes CSSOM (`style.setProperty`), což CSP
neomezuje, ne atributem `style` v HTML, který by nonce nepokryl.

Platí i pro celou prodejní stránku z fáze 2 (ověřeno v Chrome i WebKitu). Veškerý
pohyb je v CSS třídách a atributech `data-*`, knihovna Motion se nepoužívá, protože
její `initial` by na serveru vykreslil atribut `style`.

**Pozor při testu v Safari na `http://localhost`:** direktiva `upgrade-insecure-requests`
přepíše požadavky na https a stránka se nenačte. Chrome localhost vyjímá, WebKit ne.
Na HTTPS v produkci to nevadí. Lokální test ve WebKitu proto jde přes proxy, která
odebere jen tuto direktivu. Snímek obrazovky v Playwrightu navíc sám vkládá `<style>`
(skrytí kurzoru), což WebKit nahlásí jako porušení `style-src-elem`. Nejde o chybu webu.

Žádná cizí doména v CSP zatím není, `CSP-LOG.md` je proto prázdný.

## Trasy API

| Trasa | Ochrana | Stav |
| --- | --- | --- |
| `POST /api/subscribe` | kontrola `Origin` (403), jen JSON nebo formulář (415), tělo do 2 kB (413), Zod, past na roboty se stejnou odpovědí jako člověk | nic neukládá, platný požadavek dostane pravdivě 503. Ověřeno curl i z prohlížeče |

## Tajemství

`.gitignore` pokrývá `.env*`, `*.pem`, `*.key`, `.vercel`, `.DS_Store`, `node_modules`.
V repozitáři zatím žádné tajemství není, protože žádná integrace neběží.
`.env.example` vznikne ve fázi 3 s databází.

## Co zatím neplatí

Tohle **není** hotové a nemá se to vydávat za hotové:

- `security.txt` **není nasazený**. Šablona leží v `.claude/security/security.txt.template`,
  kontakt je otevřená otázka. (Opraveno 2026-09-29: dřívější text tu tvrdil, že je
  zástupný soubor v `public/.well-known/`, ten ale nikdy nevznikl.)
- DNS (DNSSEC, CAA, SPF, DKIM, DMARC) se neřešilo, doména neexistuje.
- `POST /api/subscribe` nemá omezení počtu požadavků. Vědomě: nic neukládá ani
  neposílá. Limit přijde ve fázi 3 spolu s databází a Resendem.
- Podpisy HMAC a webhook Stripe přijdou ve fázích 4 a 5.
- Hlavičky nebyly ověřené na veřejné adrese ani na securityheaders.com.
