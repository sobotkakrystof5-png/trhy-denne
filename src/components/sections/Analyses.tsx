import { showcase } from "@/data/sample";
import { AnalysisList } from "../AnalysisList";
import { Badge } from "../ui/Badge";

/** Analýzy seřazené podle velikosti pohybu, největší nahoře. */
export function Analyses() {
  const byMove = [...showcase].sort(
    (a, b) => Math.abs(b.quote.change) - Math.abs(a.quote.change),
  );

  return (
    <section id="analyzy" aria-labelledby="analyzy-title" className="content-width section-y-tight">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-[44rem]">
          <h2 id="analyzy-title" className="h2">
            Pohyby posledního obchodního dne
          </h2>
          <p className="lead mt-6">
            Popis firmy a graf s čísly vidí každý. Vysvětlení, proč se cena
            pohnula, patří do tarifů Start a Plus.
          </p>
        </div>
        <div className="shrink-0">
          <Badge tone="salmon">Ukázková data</Badge>
        </div>
      </div>

      <div className="mt-12">
        <AnalysisList items={byMove} />
      </div>
    </section>
  );
}
