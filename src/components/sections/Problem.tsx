import { TimeCalculator } from "../TimeCalculator";

/** Problém. Nadpis vlevo, kalkulačka vpravo posunutá o řádek mřížky dolů. */
export function Problem() {
  return (
    <section aria-labelledby="problem-title" className="content-width section-y-tight">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <h2 id="problem-title" className="h2">
            Kolik času vám denně zabere zjistit, co se na trhu stalo?
          </h2>
          <p className="lead mt-6 max-w-[34rem]">
            Obvykle to znamená projít několik webů a pak ještě hledat, proč se
            cena pohnula. Posuňte jezdec na svůj běžný čas a uvidíte, kolik
            hodin to dělá za rok.
          </p>
        </div>
        <div className="lg:col-span-7 lg:mt-10">
          <TimeCalculator />
        </div>
      </div>
    </section>
  );
}
