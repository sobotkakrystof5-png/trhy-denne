# STATE: skutečný stav zabezpečení

Co je opravdu nasazené. Nepsat sem plány, ty patří do `DECISIONS.md`.
Poslední ověření: 2026-09-29 (fáze 3), lokálně na `npm run start` a `npm run dev`, ne na veřejné adrese.

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

Společné pro všechny: bez databáze, `BETTER_AUTH_SECRET` a e-mailu (Resend, nebo vývoj)
odpovídají pravdivě 503 (`accountsReady()` v `src/lib/env.ts`). Omezení počtu požadavků je
v tabulce `rate_limits` (pevné okno, atomický `INSERT … ON CONFLICT`), klíč je SHA-256
z rozsahu a IP nebo e-mailu, takže v tabulce neleží osobní údaje.

| Trasa | Ochrana | Stav |
| --- | --- | --- |
| `POST /api/subscribe` | `Origin` (403), JSON nebo formulář (415), tělo do 2 kB (413), Zod, past na roboty se stejnou odpovědí, 5 pokusů na IP za 10 min (429), nejvýš 3 e-maily na adresu za hodinu (další se tiše zahodí), stejná odpověď pro novou i existující adresu | ukládá souhlas s časem, IP a verzí, token jen jako SHA-256. Ověřeno curl |
| `GET /api/confirm` | jen přesměruje na `/potvrzeni` | nic nemění, skener pošty nic nepotvrdí |
| `POST /api/confirm` | `Origin` (403), formát tokenu, 20 pokusů na IP za 10 min, token jednorázový a platný 48 h, spotřeba tokenu a potvrzení v jednom příkazu SQL | ověřeno: GET nepotvrdí, POST ano, druhé použití odmítnuto |
| `GET /api/auth/magic-link/verify` | jediná povolená cesta Better Auth, ostatní vrací 404. Token uložený jako hash (`storeToken: "hashed"`), platnost 15 min, jednorázový | ověřeno: použitý odkaz vrací `INVALID_TOKEN` |
| `POST /api/auth/*` (ostatní) | 404. Odeslání odkazu a odhlášení jdou přes serverové akce s vlastními limity | ověřeno, `sign-in/magic-link` přímo vrací 404 |
| serverová akce `requestLoginLink` | kontrola `Origin` od Next.js, 5 pokusů na IP za 10 min, e-mail se posílá jen existujícímu účtu a až po odpovědi (`after`), odpověď stejná pro všechny adresy | ověřeno: cizí adresa nedostane nic a vidí stejný text |
| `GET/PUT /api/watchlist` | relace (401), `Origin` u PUT (403), JSON do 512 B, Zod, 60 změn za minutu na uživatele, limit tarifu v transakci se `SELECT … FOR UPDATE` | ověřeno v logu Postgresu, souběh viz AUDIT-LOG |
| `GET /api/symbols/search` | Zod (1 až 40 znaků), 60 dotazů za minutu na IP, zástupné znaky LIKE escapované, parametrizovaný dotaz | veřejná |

## Relace

Cookie `td.session_token`: `HttpOnly`, `SameSite=Lax`, v produkci `Secure` (Better Auth podle
protokolu). Platnost 30 dní, obnova po dni. IP adresa se k relaci neukládá
(`disableIpTracking`). Telemetrie Better Auth je vypnutá.

## Tajemství

`.gitignore` pokrývá `.env*`, `*.pem`, `*.key`, `.vercel`, `.DS_Store`, `node_modules`.
V repozitáři žádné tajemství není. `.env.example` obsahuje jen názvy (výjimka `!.env.example`
v `.gitignore`). `.env.local` je ignorovaný a drží jen lokální vývojové hodnoty.
`docker-compose.yml` obsahuje heslo `postgres` k lokální databázi, která poslouchá jen na
`127.0.0.1`. Nejde o tajemství.

## Co zatím neplatí

Tohle **není** hotové a nemá se to vydávat za hotové:

- `security.txt` **není nasazený**. Šablona leží v `.claude/security/security.txt.template`,
  kontakt je otevřená otázka. (Opraveno 2026-09-29: dřívější text tu tvrdil, že je
  zástupný soubor v `public/.well-known/`, ten ale nikdy nevznikl.)
- DNS (DNSSEC, CAA, SPF, DKIM, DMARC) se neřešilo, doména neexistuje.
- Databáze Neon ani Resend zatím nejsou. Všechno ve fázi 3 je ověřené jen lokálně
  (Postgres v Dockeru přes proxy, která napodobuje Neon). Odesílací doména, SPF, DKIM
  a DMARC neexistují.
- Oddělený databázový uživatel pro n8n (fáze 5) zatím není.
- Podpisy HMAC a webhook Stripe přijdou ve fázích 4 a 5.
- Hlavičky nebyly ověřené na veřejné adrese ani na securityheaders.com.
