# CSP-LOG: proč je v politice která doména

Každá doména navíc v CSP musí mít řádek tady. Bez řádku se nepřidává.

| Datum | Direktiva | Doména | Kdo ji potřebuje | Kdo rozhodl |
| --- | --- | --- | --- | --- |
| 2026-09-30 | `form-action` | `https://checkout.stripe.com` | Tlačítko platby v `/ucet`. Serverová akce odpoví přesměrováním na hostovaný Checkout. | Claude, fáze 4 |
| 2026-09-30 | `form-action` | `https://billing.stripe.com` | Tlačítko „Spravovat předplatné“ v `/ucet`, přesměrování na Customer Portal. | Claude, fáze 4 |

Obě položky jsou celé domény bez zástupných znaků a platí jen pro cíl odeslání
formuláře. Nic se nevkládá do stránky, `frame-src` zůstává `'none'` a
`script-src` se nemění.

**Proč to vůbec je potřeba:** prohlížeče hlídají `form-action` i na
přesměrování, které přijde jako odpověď na odeslaný formulář, ne jen na první
cíl. Se zapnutým JavaScriptem serverovou akci odesílá `fetch` a přesměrování
provede router, takže by politika stačila `'self'`. Bez JavaScriptu jde o
klasické odeslání formuláře a bez těchto dvou domén by platba skončila
zablokovaným přesměrováním.

**Co k tomu říká Stripe** (ověřeno 2026-09-30 na `docs.stripe.com/security/guide`):
oficiální seznam direktiv pro Checkout uvádí `connect-src`, `frame-src` a
`script-src` na `https://checkout.stripe.com` a `img-src` na `https://*.stripe.com`.
To platí pro **vloženou** variantu přes Stripe.js. My používáme hostovanou stránku
s přesměrováním, takže nic z toho nepotřebujeme a nepřidává se to. O `form-action`
dokumentace Stripe **nemluví vůbec**, potřeba vychází z chování prohlížeče a
potvrzují ji jen cizí zdroje. **V prohlížeči zatím neověřeno**, sandbox není.
Ověřit při testu fáze 4 a tento odstavec pak upravit.

**Očekávané přírůstky:** PostHog (EU) do `connect-src` ve fázi 5, po rozhodnutí
o souhlasu s cookies. Nic ze Stripe do `script-src`, `frame-src` ani
`connect-src`: platí se odchodem na hostovanou stránku, ne vloženým rámem.
Kdyby někdo někdy sáhl po vloženém Checkoutu, platí ten oficiální seznam výš
a je to změna politiky, ne drobnost.
