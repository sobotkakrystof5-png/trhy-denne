/**
 * Jediný plný černý pruh mezi krémovými sekcemi. Seznam definic, ne
 * karty. Formulace drží pravidla obsahu ze zadání 1.2.
 */
const points = [
  {
    term: "Čísla",
    text: "Ceny a změny pocházejí přímo z datového zdroje. Jazykový model je nepíše a neopravuje.",
  },
  {
    term: "Vysvětlení",
    text: "Proč se cena pohnula, píšeme jen tam, kde to umíme doložit odkazem na zdroj. Shrnutí připravuje jazykový model.",
  },
  {
    term: "Kontrola",
    text: "Před odesláním porovnáme každé číslo v textu s daty. Report, který kontrolou neprojde, neodejde.",
  },
  {
    term: "Žádná doporučení",
    text: "Popisujeme, co se stalo. Neradíme, co koupit ani prodat, a nedáváme cílové ceny.",
  },
];

export function Trust() {
  return (
    <section aria-labelledby="trust-title" className="on-ink bg-ink text-cream">
      <div className="content-width section-y grid gap-10 lg:grid-cols-12 lg:gap-12">
        <h2 id="trust-title" className="h2 text-cream lg:col-span-5">
          Čísla z dat, text se zdroji
        </h2>
        <dl className="lg:col-span-7">
          {points.map((point, index) => (
            <div
              key={point.term}
              className={`grid gap-2 py-6 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-8 ${
                index === 0 ? "pt-0" : "border-t-2 border-cream"
              }`}
            >
              <dt className="font-display text-xl font-bold text-salmon">{point.term}</dt>
              <dd className="text-lg leading-relaxed text-cream">{point.text}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
