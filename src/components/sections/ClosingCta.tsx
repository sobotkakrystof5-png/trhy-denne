import { SignupForm } from "../SignupForm";
import { paymentsReady } from "@/lib/env";

/** Závěrečná výzva: plný lososový pruh bez mřížky, uprostřed karta. */
export function ClosingCta() {
  return (
    <section
      id="objednat"
      aria-labelledby="objednat-title"
      className="border-t-3 border-ink bg-salmon"
    >
      <div className="content-width section-y-loose">
        <div className="mx-auto max-w-[42rem] rounded-[var(--radius-card)] border-3 border-ink bg-paper p-6 shadow-[var(--shadow-hard-lg)] md:p-10">
          <h2 id="objednat-title" className="h2">
            Stačí e-mail
          </h2>
          <p className="lead mt-4">
            Zvolte tarif a zadejte adresu, na kterou má přehled chodit.
          </p>
          <div className="mt-8">
            <SignupForm withTier paymentsLive={paymentsReady()} />
          </div>
        </div>
      </div>
    </section>
  );
}
