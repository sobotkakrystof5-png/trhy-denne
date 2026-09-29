import Link from "next/link";
import { BrandMark } from "./BrandMark";
import { SAMPLE_DATA_SENTENCE } from "@/data/sample";
import { accountsReady } from "@/lib/env";
import { legalPages, site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="on-ink bg-ink text-cream">
      <div className="content-width py-14 md:py-20">
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-4">
            <Link href="/#top" className="inline-flex items-center gap-3 text-cream no-underline">
              <BrandMark size={32} />
              <span className="font-display text-xl font-bold">{site.name}</span>
            </Link>
            <p className="mt-3 text-[0.9375rem] text-cream">{site.tagline}</p>
          </div>

          <div className="md:col-span-5">
            <p className="font-display text-2xl font-bold leading-snug text-cream">
              Nejde o investiční doporučení.
            </p>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-cream">
              Web i reporty popisují pohyby, které už proběhly. Nic z toho není
              rada k nákupu nebo prodeji.
            </p>
          </div>

          <nav aria-label="Právní informace" className="md:col-span-3">
            <ul className="flex flex-col gap-3">
              {legalPages.map((page) => (
                <li key={page.href}>
                  <a
                    href={page.href}
                    className="text-[0.9375rem] font-semibold text-salmon underline underline-offset-4"
                  >
                    {page.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="mt-12 border-t-2 border-cream/25 pt-6 text-[0.9375rem] text-cream">
          {SAMPLE_DATA_SENTENCE}
          {accountsReady() ? null : " Web zatím neslouží k odběru."}
        </p>
      </div>
    </footer>
  );
}
