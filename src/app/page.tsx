import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { Analyses } from "@/components/sections/Analyses";
import { Audience } from "@/components/sections/Audience";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { Dashboard } from "@/components/sections/Dashboard";
import { Faq } from "@/components/sections/Faq";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Pricing } from "@/components/sections/Pricing";
import { Problem } from "@/components/sections/Problem";
import { Trust } from "@/components/sections/Trust";
import { SectionDivider } from "@/components/ui/SectionDivider";

/**
 * Prodejní stránka. Pořadí sekcí je ze zadání (sekce 4). Struktura
 * "jedna stránka s kotvami" je závazné rozhodnutí, neměnit potichu.
 */
export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="top" className="flex-1">
        <Hero />
        <Problem />
        <HowItWorks />
        <SectionDivider />
        <Dashboard />
        <Analyses />
        <Trust />
        <Audience />
        <Pricing />
        <Faq />
        <ClosingCta />
      </main>
      <Footer />
    </>
  );
}
