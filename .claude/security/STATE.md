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
form-action 'self' https://checkout.stripe.com https://billing.stripe.com;
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

Cizí domény v CSP jsou od 2026-09-30 dvě, obě jen ve `form-action` (Checkout a Customer Portal
Stripe), obě s řádkem v `CSP-LOG.md`. Potřeba vznikla tím, že prohlížeč `form-action` hlídá i na
přesměrování po odeslání formuláře. **Neověřeno v prohlížeči**, sandbox Stripe zatím není.

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
| `POST /api/webhooks/stripe` | podpis nad surovým tělem (`constructEventAsync`), chybějící hlavička 400, neplatný podpis 400 bez podrobností, idempotence zápisem do `stripe_events`, tělo ani podpis se nelogují, bez klíčů 503 | ověřeno jen bez klíčů (503). Podpis a idempotence **netestované**, sandbox Stripe není |
| serverové akce `startCheckout`, `openPortal` | kontrola `Origin` od Next.js, relace, Zod nad tarifem a souhlasem, 10 pokusů na uživatele za 10 min | netestované, sandbox Stripe není |
| `POST /api/internal/render-report` | HMAC-SHA256 nad `časová značka.tělo` (hlavičky `x-internal-timestamp`, `x-internal-signature`), porovnání `timingSafeEqual`, značka nejvýš 5 minut stará, tělo do 16 kB (413), Zod (datum, typ, 1 až 100 UUID), bez `INTERNAL_HMAC_SECRET` 503, nepodepsané 401 | podpis ověřen izolovaně skriptem (platný, změněné tělo, špatný a krátký podpis, prošlá značka, chybějící hlavičky). **Trasa jako celek neprošla proti databázi**, v Neonu zatím nejsou data pipeline |

## Relace

Cookie `td.session_token`: `HttpOnly`, `SameSite=Lax`, v produkci `Secure` (Better Auth podle
protokolu). Platnost 30 dní, obnova po dni. IP adresa se k relaci neukládá
(`disableIpTracking`). Telemetrie Better Auth je vypnutá.

## Tajemství

`.gitignore` pokrývá `.env*`, `*.pem`, `*.key`, `.vercel`, `.DS_Store`, `node_modules`.
V repozitáři žádné tajemství není. `.env.example` obsahuje jen názvy (výjimka `!.env.example`
v `.gitignore`). `.env.local` je ignorovaný. Od 2026-09-30 v něm je i skutečný `DATABASE_URL` k Neonu
(role `neondb_owner`, spojení přes poolovaný endpoint, `sslmode=require`, které ovladač `pg`
vynucuje jako `verify-full`). Původní lokální adresa zůstala v souboru jako komentář.
**Heslo té role prošlo chatem s asistentem, patří tedy resetovat v konzoli Neonu.**
Dne 2026-09-30 se do `.env.example` (sledovaný soubor) dostal skutečný testovací klíč Stripe
`sk_test_…` jako hodnota. Necommitnuto, v historii Gitu není, hodnota vyprázdněna. Klíč prošel
chatem, patří rotovat v Dashboardu Stripe.
`docker-compose.yml` obsahuje heslo `postgres` k lokální databázi, která poslouchá jen na
`127.0.0.1`. Nejde o tajemství.

## Co zatím neplatí

Tohle **není** hotové a nemá se to vydávat za hotové:

- `security.txt` **není nasazený**. Šablona leží v `.claude/security/security.txt.template`,
  kontakt je otevřená otázka. (Opraveno 2026-09-29: dřívější text tu tvrdil, že je
  zástupný soubor v `public/.well-known/`, ten ale nikdy nevznikl.)
- DNS (DNSSEC, CAA, SPF, DKIM, DMARC) se neřešilo, doména neexistuje.
- Resend zatím není. Odesílací doména, SPF, DKIM a DMARC neexistují, e-maily se ve vývoji
  jen vypisují do konzole serveru.
- Databáze Neon **je** zapojená (2026-09-30, region `eu-central-1`, Postgres 18.6, migrace
  0000 až 0003 a seed nasazené). Jde ale o jediný projekt bez oddělené vývojové větve, takže
  lokální vývoj teď píše do téže databáze jako pozdější produkce. Před spuštěním rozdělit.
- Demo tabulka `playing_with_neon` z výchozího nastavení Neonu v databázi zůstala.
- Oddělený databázový uživatel pro n8n (fáze 5) zatím není.
- Podpisy HMAC pro n8n jsou napsané (2026-09-30, krok 22), `INTERNAL_HMAC_SECRET` a `N8N_EVENT_WEBHOOK_URL` ale nejsou nastavené, takže interní trasa vrací 503 a odchozí události se neposílají.
- Platby jsou **napsané, ale nevyzkoušené.** Sandbox Stripe Trhy denně neexistuje, v `.env.local`
  nejsou klíče, takže `paymentsReady()` je nesplněná a webhook i tlačítka platby vracejí 503.
  Ověření podpisu, idempotence, změna tarifu, zrušení a neúspěšná platba čekají na krok 21.
- Právní stránky `/podminky` a `/ochrana-udaju`, na které odkazuje souhlas u platby i nastavení
  Customer Portalu, jsou **prázdné**. Před první skutečnou platbou to nestačí.
- Hlavičky nebyly ověřené na veřejné adrese ani na securityheaders.com.
