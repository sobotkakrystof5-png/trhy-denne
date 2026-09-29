import Link from "next/link";
import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { SiteHeader } from "./SiteHeader";

/**
 * Rám samostatných stránek (účet, přihlášení, potvrzení). Stejná hlava
 * a patička jako prodejní stránka, obsah v jednom sloupci obsahu.
 */
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="top" className="flex-1">
        <div className="content-width section-y">{children}</div>
      </main>
      <Footer />
    </>
  );
}

/**
 * Krátká stránka s jedním úkolem: nadpis a text vlevo, karta s akcí vpravo.
 * Na mobilu pod sebou. Používá ji přihlášení, potvrzení i poděkování.
 */
export function TaskLayout({
  title,
  lead,
  children,
  aside,
}: {
  title: string;
  lead: ReactNode;
  children: ReactNode;
  /** Drobnost pod textem vlevo, třeba odkaz zpět. */
  aside?: ReactNode;
}) {
  return (
    <div className="grid gap-10 md:grid-cols-12 md:gap-8">
      <div className="md:col-span-5">
        <h1 className="text-[clamp(2.5rem,5.5vw,4.25rem)] font-bold leading-[1.02] tracking-[-0.03em]">
          {title}
        </h1>
        <div className="lead mt-6 max-w-[34rem]">{lead}</div>
        {aside ? <div className="mt-8">{aside}</div> : null}
      </div>
      <div className="md:col-span-6 md:col-start-7 md:pt-3">
        <div className="rounded-[var(--radius-card)] border-3 border-ink bg-paper p-6 shadow-[var(--shadow-hard-lg)] md:p-9">
          {children}
        </div>
      </div>
    </div>
  );
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="font-display text-sm font-bold uppercase tracking-[0.08em] text-ink underline underline-offset-4"
    >
      {children}
    </Link>
  );
}
