import type { ReactNode } from "react";

/**
 * Odznak. Mírné natočení má působit jako nalepený štítek na papíru.
 * Používá se na "brzy", "doporučený tarif" a "ukázková data".
 */
export function Badge({
  tone = "cream",
  children,
}: {
  tone?: "cream" | "salmon";
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-block -rotate-2 border-2 border-ink px-2.5 py-1 font-display text-[0.8125rem] font-bold uppercase tracking-[0.08em] leading-none text-ink ${
        tone === "salmon" ? "bg-salmon" : "bg-cream"
      }`}
    >
      {children}
    </span>
  );
}
