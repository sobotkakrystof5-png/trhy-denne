import { SiteHeader } from "@/components/SiteHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ChangeChip } from "@/components/ui/ChangeChip";
import { SectionDivider } from "@/components/ui/SectionDivider";

/**
 * Fáze 1 staví jen kostru a základní komponenty. Sekce prodejní stránky
 * (hero, dashboard, ceník, FAQ) přijdou ve fázi 2. Tahle stránka je
 * zatím přehled hotových dílů, aby šly posoudit vedle sebe.
 */
export default function Home() {
  return (
    <>
      <SiteHeader />

      <main id="top" className="flex-1">
        <section className="content-width py-16 md:py-24">
          <p className="label-caps">Fáze 1</p>
          <h1 className="mt-4 text-[clamp(2.75rem,7.2vw,6.25rem)] font-bold leading-none tracking-[-0.03em]">
            Kostra a základní díly
          </h1>
          <p className="mt-6 max-w-[60ch] text-xl leading-relaxed">
            Hlavička, kurzovní pás a horní pruh stojí. Níže jsou komponenty,
            ze kterých se ve fázi 2 poskládá prodejní stránka.
          </p>
        </section>

        <SectionDivider />

        <section className="content-width py-16 md:py-24">
          <h2 className="text-[clamp(2rem,4.4vw,3.5rem)] font-bold leading-[1.05] tracking-[-0.02em]">
            Tlačítka a štítky
          </h2>

          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Button>Odebírat zdarma</Button>
            <Button variant="secondary">Zobrazit ukázku</Button>
            <Badge tone="salmon">Doporučený tarif</Badge>
            <Badge>Brzy</Badge>
            <ChangeChip change={1.84} />
            <ChangeChip change={-0.42} />
            <ChangeChip change={0} />
          </div>
        </section>

        <section className="content-width pb-24">
          <h2 className="text-[clamp(2rem,4.4vw,3.5rem)] font-bold leading-[1.05] tracking-[-0.02em]">
            Karty
          </h2>
          <p className="label-caps mt-4">Barva nese význam</p>

          <div className="mt-10 grid gap-4 md:grid-cols-3 md:gap-6">
            <Card tone="mist">
              <h3 className="text-[1.75rem] font-bold leading-tight tracking-[-0.01em]">
                Index
              </h3>
              <p className="mt-3 text-base">
                Modrošedá patří indexům a přehledu trhu.
              </p>
            </Card>
            <Card tone="sand">
              <h3 className="text-[1.75rem] font-bold leading-tight tracking-[-0.01em]">
                Akcie
              </h3>
              <p className="mt-3 text-base">
                Písková patří jednotlivým akciím.
              </p>
            </Card>
            <Card tone="salmon">
              <h3 className="text-[1.75rem] font-bold leading-tight tracking-[-0.01em]">
                Ve výběru
              </h3>
              <p className="mt-3 text-base">
                Lososová říká, že položku odebíráte.
              </p>
            </Card>
          </div>
        </section>
      </main>
    </>
  );
}
