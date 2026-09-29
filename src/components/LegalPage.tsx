import Link from "next/link";
import { Footer } from "./Footer";
import { SiteHeader } from "./SiteHeader";

/**
 * Prázdná právní stránka. Právní text Claude nepíše (zadání 9), doplní
 * ho právník před spuštěním. Stránka to říká otevřeně.
 */
export function LegalPage({ title }: { title: string }) {
  return (
    <>
      <SiteHeader />
      <main id="top" className="flex-1">
        <section className="content-width section-y">
          <h1 className="text-[clamp(2.5rem,5.5vw,4.5rem)] font-bold leading-[1.02] tracking-[-0.03em]">
            {title}
          </h1>
          <div className="mt-10 max-w-[42rem] rounded-[var(--radius-card)] border-3 border-dashed border-ink bg-paper p-6 md:p-9">
            <p className="text-lg leading-relaxed">
              Text této stránky připravuje právník. Doplníme ho před spuštěním
              webu.
            </p>
          </div>
          <Link
            href="/#top"
            className="mt-10 inline-block font-display text-sm font-bold uppercase tracking-[0.08em] text-ink underline underline-offset-4"
          >
            Zpět na hlavní stránku
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
