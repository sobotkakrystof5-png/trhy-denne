"use client";

import { useEffect, useId, useState } from "react";
import { BrandMark } from "./BrandMark";
import { buttonClass } from "./ui/Button";
import { anchorHref, ctaAnchor, ctaLabel, loginHref, loginLabel, navItems, site } from "@/lib/site";

/**
 * Hlavička s kotvami a scrollspy. Přilepení řeší SiteHeader, aby se
 * hlavička, pruh a pás chovaly jako jeden celek.
 * Popisek vedle loga přebírá formu z cr-8, ale text je vlastní a pravdivý.
 */
export function Header() {
  const active = useActiveSection();
  const [open, setOpen] = useState(false);
  const panelId = useId();

  // Otevřený mobilní panel nesmí nechat stránku scrollovat pod sebou.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Escape zavírá panel, jinak by z něj klávesnice neměla cestu ven.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="on-ink bg-ink text-cream">
      <div className="content-width flex h-18 items-center justify-between gap-6">
        <a
          href={anchorHref("top")}
          className="flex shrink-0 items-center gap-3 text-cream no-underline"
        >
          <BrandMark size={32} />
          <span className="font-display text-xl font-bold tracking-[-0.01em]">
            {site.name}
          </span>
          <span
            aria-hidden="true"
            className="ml-1 hidden h-6 w-px bg-cream/30 min-[1440px]:block"
          />
          {/* Popisek až od 1440 px. S odkazem Přihlásit se na 1280 px
              navigace nevešla na řádek a "Jak to funguje" se zalomilo. */}
          <span className="nav-caps hidden text-cream/55 min-[1440px]:block">
            {site.tagline}
          </span>
        </a>

        <nav aria-label="Hlavní" className="hidden items-center gap-6 whitespace-nowrap lg:flex xl:gap-7">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={anchorHref(item.id)}
              aria-current={active === item.id ? "true" : undefined}
              className={`nav-caps border-b-3 pb-1 no-underline transition-colors ${
                active === item.id
                  ? "border-salmon text-cream"
                  : "border-transparent text-cream/85 hover:text-cream"
              }`}
            >
              {item.label}
            </a>
          ))}
          <a
            href={loginHref}
            className="nav-caps border-b-3 border-transparent pb-1 text-cream/85 no-underline transition-colors hover:text-cream"
          >
            {loginLabel}
          </a>
          <a href={anchorHref(ctaAnchor)} className={buttonClass("cta", "no-underline")}>
            {ctaLabel}
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={panelId}
          className="mech grid size-11 shrink-0 place-items-center border-3 border-cream bg-ink lg:hidden"
        >
          <span className="sr-only">
            {open ? "Zavřít menu" : "Otevřít menu"}
          </span>
          <HamburgerIcon open={open} />
        </button>
      </div>

      {open ? (
        <div
          id={panelId}
          className="border-t-3 border-cream/20 bg-ink lg:hidden"
        >
          <nav aria-label="Hlavní, mobilní" className="content-width py-4">
            <ul className="flex flex-col">
              {navItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={anchorHref(item.id)}
                    onClick={() => setOpen(false)}
                    aria-current={active === item.id ? "true" : undefined}
                    className={`nav-caps flex min-h-11 items-center border-b border-cream/15 no-underline ${
                      active === item.id ? "text-salmon" : "text-cream"
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={loginHref}
                  className="nav-caps flex min-h-11 items-center border-b border-cream/15 text-cream no-underline"
                >
                  {loginLabel}
                </a>
              </li>
            </ul>
            <a
              href={anchorHref(ctaAnchor)}
              onClick={() => setOpen(false)}
              className={buttonClass("cta", "mt-5 w-full no-underline")}
            >
              {ctaLabel}
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

/**
 * Scrollspy. Na právních stránkách žádné sekce nejsou, proto se musí
 * umět chovat i bez nich.
 */
function useActiveSection() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const sections = navItems
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => element !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      // Pás je aktivní v horní třetině obrazovky, pod přilepenou hlavičkou.
      { rootMargin: "-128px 0px -66% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return active;
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="20"
      height="16"
      viewBox="0 0 20 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {open ? (
        <path
          d="M3 3l14 10M17 3L3 13"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M1 2h18M1 8h18M1 14h18"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
