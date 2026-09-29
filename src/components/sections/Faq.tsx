/**
 * FAQ na nativních details/summary: funguje bez JavaScriptu, klávesnicí
 * i ve čtečkách. Odpovědi nesmí slibovat nic, co není rozhodnuté
 * (čas doručení, poskytovatel dat).
 */
const questions = [
  {
    q: "Kdy report dorazí?",
    a: "Denní report chodí ráno po každém obchodním dni na americké burze. Přesný čas doručení oznámíme před spuštěním. Free dostává přehled jednou týdně, v neděli.",
  },
  {
    q: "Co je ve Startu a co v Plusu?",
    a: "Start je ranní report pro 5 položek, které si vyberete. U výrazných pohybů v něm najdete vysvětlení se zdroji. Plus pojme 25 položek. Přidává kalendář výsledků a dividend a archiv za posledních 90 dní. Odpolední report pro Plus připravujeme.",
  },
  {
    q: "Jak předplatné zruším?",
    a: "V nastavení účtu, kdykoli a bez udání důvodu. Z e-mailů se odhlásíte i odkazem v patičce každého reportu.",
  },
  {
    q: "Odkud jsou čísla?",
    a: "Ceny a změny přebíráme od poskytovatele burzovních dat. Jazykový model je nepíše ani neupravuje, jen shrnuje, co se stalo, a každé tvrzení doloží zdrojem. Na tomto webu zatím vidíte ukázková data.",
  },
  {
    q: "Je to investiční doporučení?",
    a: "Není. Report říká, co se stalo, ne co s tím dělat. Tipy na nákup nebo prodej ani cílové ceny nedáváme.",
  },
  {
    q: "Co když má americká burza zavřeno?",
    a: "O víkendech a ve dny svátků americké burzy denní report nepřijde, protože se neobchodovalo. Nedělní přehled pro Free chodí dál.",
  },
];

export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="content-width section-y-tight">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <h2 id="faq-title" className="h2 lg:sticky lg:top-40">
            Časté otázky
          </h2>
        </div>

        <div className="flex flex-col gap-4 lg:col-span-8">
          {questions.map((item) => (
            <details
              key={item.q}
              className="faq-card group rounded-[var(--radius-tile)] border-3 border-ink bg-paper open:bg-sand"
            >
              <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-4 px-5 py-5 font-display text-xl font-bold leading-snug text-ink md:px-7">
                {item.q}
                <span
                  aria-hidden="true"
                  className="grid size-9 shrink-0 place-items-center rounded-[6px] border-2 border-ink bg-paper"
                >
                  <svg
                    viewBox="0 0 14 14"
                    width="14"
                    height="14"
                    focusable="false"
                    className="transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
                  >
                    <path d="M7 1.5v11M1.5 7h11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </span>
              </summary>
              <p className="max-w-[62ch] px-5 pb-6 text-lg leading-relaxed text-text md:px-7">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
