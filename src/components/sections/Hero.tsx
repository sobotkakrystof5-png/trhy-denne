import { SignupForm } from "../SignupForm";
import { HeroBoard } from "./HeroBoard";

/**
 * Hero: vlevo sdělení a formulář, vpravo tabule v rámu. Jediná
 * orchestrovaná animace na stránce, celá v CSS (globals.css), takže
 * doběhne i bez JavaScriptu a při omezeném pohybu vůbec nezačne.
 */
export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="content-width pb-20 pt-10 md:pt-16 lg:pb-28 lg:pt-20">
      <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <h1
            id="hero-title"
            className="text-[clamp(2.75rem,6vw,5rem)] font-bold leading-[1.02] tracking-[-0.03em]"
          >
            <span className="hero-line -mb-[0.16em] block overflow-hidden pb-[0.16em]">
              <span>Trh za tři minuty.</span>
            </span>
            <span className="hero-line -mb-[0.2em] block overflow-hidden pb-[0.2em] pr-3">
              <span>
                <span className="highlight hero-highlight">Ne za hodinu.</span>
              </span>
            </span>
          </h1>

          <p className="lead mt-8 max-w-[34rem] text-text">
            Ranní e-mail o amerických akciích a indexech, které si sami
            vyberete. U výrazných pohybů vysvětlíme proč, vždy se zdrojem.{" "}
            <strong className="font-semibold text-ink">
              Začít můžete zdarma nedělním přehledem.
            </strong>
          </p>

          <div className="mt-8 max-w-[38rem]">
            <SignupForm />
          </div>
        </div>

        <div className="lg:col-span-5 xl:-mr-10">
          <HeroBoard />
        </div>
      </div>
    </section>
  );
}
