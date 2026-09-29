/**
 * Pro koho ano a pro koho ne. Dvě nestejné karty, souvislý text.
 * Filtruje lidi, kterým by služba stejně nevyhovovala.
 */
export function Audience() {
  return (
    <section aria-labelledby="audience-title" className="content-width section-y-loose">
      <h2 id="audience-title" className="h2 max-w-[40rem]">
        Pro koho to je a pro koho ne
      </h2>

      <div className="mt-12 grid gap-6 md:grid-cols-12 md:items-start">
        <article className="rounded-[var(--radius-card)] border-3 border-ink bg-mist p-6 shadow-[var(--shadow-hard-lg)] md:col-span-7 md:p-9">
          <h3 className="h3">Pro koho je</h3>
          <p className="mt-4 text-lg leading-relaxed">
            Pro ty, kdo drží pár amerických akcií nebo fondů a chtějí vědět, co
            se s nimi děje, aniž by denně procházeli zprávy.
          </p>
          <p className="mt-4 text-lg leading-relaxed">
            Hodí se i k dlouhodobému investování. Na každý pohyb reagovat
            nemusíte, ale je dobré rozumět tomu, co se stalo.
          </p>
        </article>

        <article className="rounded-[var(--radius-card)] border-3 border-ink bg-paper p-6 shadow-[var(--shadow-hard-lg)] md:col-span-5 md:mt-20 md:p-9">
          <h3 className="h3">Pro koho není</h3>
          <p className="mt-4 text-lg leading-relaxed">
            Pro obchodníky, kteří potřebují ceny v reálném čase nebo signály
            k nákupu a prodeji. Čísla u nás jsou po uzavření burzy a doporučení
            nedáváme.
          </p>
        </article>
      </div>
    </section>
  );
}
