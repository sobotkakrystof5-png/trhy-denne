import { catalog, showcase } from "@/data/sample";
import { WatchlistPicker } from "../WatchlistPicker";

/**
 * Dashboard na prodejní stránce. Ukázka téhož nástroje, který klient
 * uvidí v účtu. Výběr návštěvníka žije jen v jeho prohlížeči.
 */
export function Dashboard() {
  return (
    <section id="dashboard" aria-labelledby="dashboard-title" className="content-width section-y">
      <div className="max-w-[46rem]">
        <h2 id="dashboard-title" className="h2">
          Vyberte si položky a uvidíte svůj přehled
        </h2>
        <p className="lead mt-6">
          Kliknutím na dlaždici ji přidáte do výběru. Šipka v rohu otevře její
          analýzu.
        </p>
      </div>

      <div className="mt-12">
        <WatchlistPicker
          items={showcase}
          catalog={catalog}
          featuredTicker="SPY"
          analysisLinks
          storageKey="trhy-denne:vyber:v1"
        />
      </div>
    </section>
  );
}
