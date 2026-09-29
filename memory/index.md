# INDEX: mapa paměti

Čti to jako první v každé relaci, před jakoukoli prací. Tento soubor sám nic neobsahuje, jen říká, kde co najdeš a v jakém stavu projekt je.

## 1. Stav projektu (jedna věta)
**Fáze:** Fáze 3 schválená a commitnutá. Probíhá fáze 4, platby (Stripe). Chybí skutečný Neon, Resend a Stripe sandbox.
Podrobnosti vždy v `memory.md`, sekce Aktuální stav.

## 2. Systémové soubory
| Soubor | Obsahuje | Sahej na něj, když |
| --- | --- | --- |
| `memory/index.md` (tento) | mapa, stav v jedné větě | vznikne nový systémový soubor nebo se změní fáze |
| `memory/pravidla.md` | pravidla vedení paměti | jen na výslovný pokyn uživatele |
| `memory/memory.md` | stav, rozhodnutí, otevřené otázky, záznamy změn | po každé změně projektu |
| `CLAUDE.md` | pravidla chování a procesu | zřídka, jen na výslovné rozhodnutí uživatele |
| `AGENTS.md` | technická fakta, stack, struktura, konvence, bezpečnostní pravidla | když se změní stack, struktura, konvence nebo bezpečnostní konfigurace |
| `PROJECT-BRIEF.md` | úplné zadání (design, obsah, backend, fáze, otevřené otázky) | když uživatel změní zadání. Sekce 0 se nezkracuje |
| `reference/` | screenshoty cr-8.cz, podle kterých se staví vzhled | když uživatel dodá další reference (ben.ai, chase.ai) |
| `.claude/security/` | STATE, DECISIONS, CSP-LOG, AUDIT-LOG | při každé změně zabezpečení (vznikne ve fázi 1) |

## 3. Pořadí přednosti při rozporu
Živé zadání uživatele, `CLAUDE.md`, `memory/pravidla.md`, `memory/memory.md`, `AGENTS.md`. Rozpor se nikdy neřeší potichu, vždy se pojmenuje.

## 4. Mapa projektu
Cílová struktura je v `AGENTS.md`, sekce Struktura repozitáře. Dnes existuje: `src/app/` (stránka, tři právní stránky, `api/subscribe`), `src/proxy.ts`, `src/components/` (+ `sections/`, `ui/`), `src/lib/`, `src/data/`, `scripts/gen-icons.mjs`, `.claude/security/`, `.github/workflows/`, `public/`, konfigurace v kořeni. Od fáze 3 také `src/db/`, `src/emails/`, `drizzle/`, `docker-compose.yml`, `scripts/seed.mts`.

## 5. Rychlý start relace
1. Přečti `CLAUDE.md`, `memory/index.md`, `memory/pravidla.md`, `memory/memory.md`, `AGENTS.md`.
2. V `memory.md` zjisti, kde se skončilo a co je otevřené.
3. Zkontroluj nové zadání proti Klíčovým rozhodnutím a Záměrně nedělám. Kolizi řekni hned, ne až po implementaci.
4. Pracuj.
5. Každou změnu zapiš do `memory.md` ve stejném tahu.
