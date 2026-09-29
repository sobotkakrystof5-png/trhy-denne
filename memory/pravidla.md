# PRAVIDLA: jak se vede paměť tohoto projektu

## 1. Základní zásada
Každá změna projektu se zapíše do `memory.md` okamžitě, ve stejném tahu. Ne na konci relace a ne po připomenutí.

## 2. Co se zapisuje
Vytvořený, přejmenovaný nebo smazaný soubor či složka. Změna obsahu, designu nebo textů. Technická rozhodnutí (stack, knihovna, hosting, integrace, změna schématu databáze). Co jsme zkusili a **nefungovalo**. Co je záměrně odložené a proč. Otevřené otázky, které čekají na uživatele. Změny bezpečnostní konfigurace (navíc i do `.claude/security/`).

## 3. Co se nikdy nezapisuje
Vyprávění o postupu ("nejdřív jsem hledal, pak jsem…"). Cokoli, co je vidět přímo v kódu. Sebechvála a shrnutí typu "vše hotovo a funguje". Duplicita toho, co už je v `CLAUDE.md` nebo `AGENTS.md`. Relace, ve kterých se nic nezměnilo.

## 4. Formát záznamu v seznamu změn
Nejnovější nahoře:

```
### RRRR-MM-DD: Krátký název
- **Co:** jedna nebo dvě věcné věty v minulém čase.
- **Proč:** důvod, nebo "na pokyn uživatele", pokud jiný není.
- **Dopad:** čeho dalšího se to týká (jiné sekce, zabezpečení, responzivita, stack). "Izolované", pokud ničeho.
- **Soubory:** `cesta/k/souboru`
```

Vždy absolutní data. Žádná vymyšlená fakta o produktu, tarifech, cenách nebo klientech. Chybějící informace patří do Otevřených otázek, nikdy do projektu jako předpoklad.

## 5. Údržba ostatních sekcí `memory.md`
| Sekce | Aktualizuje se, když | 
| --- | --- |
| Aktuální stav | se posune fáze nebo se dokončí velký celek. Přepisuje se, nepřidává |
| Klíčová rozhodnutí | padne rozhodnutí, které se nebude znovu otevírat. Jen se přidává |
| Otevřené otázky | vznikne otázka pro uživatele. Zodpovězená se **maže** (odpověď přejde do Klíčových rozhodnutí nebo do záznamu změn), nenechává se přeškrtnutá |
| Záměrně nedělám | se něco vědomě přeskočí. Chrání to před tím, aby to další relace "opravila" jako chybu |

## 6. Kdy sahat na ostatní soubory
- `CLAUDE.md`: jen na výslovnou změnu chování, tónu nebo procesu od uživatele. Nikdy se do něj nezapisuje průběžný stav.
- `AGENTS.md`: když se změní stack, struktura, příkazy, konvence nebo bezpečnostní pravidla.
- `memory/index.md`: když vznikne systémový soubor nebo se změní fáze.
- `memory/pravidla.md`: jen na výslovný pokyn uživatele. Tato pravidla si Claude sám neupravuje.
- `PROJECT-BRIEF.md`: když uživatel změní zadání. Při úpravě zkontroluj rozpory v ostatních částech (změna struktury webu se musí promítnout do sekcí 3 a 4 zadání i do `CLAUDE.md` a `AGENTS.md`).

## 7. Začátek a konec relace
**Začátek:** přečti `CLAUDE.md`, `index.md`, `pravidla.md`, `memory.md`. Každé nové zadání zkontroluj proti Klíčovým rozhodnutím a Záměrně nedělám dřív, než začneš jednat. Kolizi řekni hned.
**Konec:** ověř, že každá provedená změna je v záznamu, že Aktuální stav platí a že v Otevřených otázkách nezůstala zodpovězená otázka.

## 8. Ověřuj, nepředpokládej
Pokud `memory.md` tvrdí něco o souboru, funkci nebo nastavení, na které se chystáš spolehnout, nejdřív si ověř, že to v projektu pořád platí. Paměť popisuje stav v době zápisu, ne nutně teď.

## 9. Zvláštní pravidlo tohoto projektu
Ukázková data a jejich označení jsou vedená jako stav. Dokud v `memory.md` stojí "ukázková data", nesmí web tvrdit, že čísla jsou skutečná. Po zapojení API se změna zapíše a označení se odstraní.
