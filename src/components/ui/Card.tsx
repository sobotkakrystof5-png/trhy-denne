import type { ComponentPropsWithoutRef, ReactNode } from "react";

/** Barva karty nese význam, nikdy se nevolí jako dekorace. */
export type CardTone = "mist" | "sand" | "salmon" | "paper" | "cream";

const tones: Record<CardTone, string> = {
  mist: "bg-mist", // index
  sand: "bg-sand", // akcie
  salmon: "bg-salmon", // je v mém výběru, doporučený tarif
  paper: "bg-paper", // neutrální, neaktivní
  cream: "bg-cream",
};

const base =
  "border-3 border-ink rounded-[var(--radius-card)] shadow-[var(--shadow-hard-lg)] p-6 md:p-9";

export function Card({
  tone = "paper",
  className = "",
  children,
  ...rest
}: {
  tone?: CardTone;
  className?: string;
  children: ReactNode;
} & ComponentPropsWithoutRef<"div">) {
  return (
    <div className={`${base} ${tones[tone]} ${className}`} {...rest}>
      {children}
    </div>
  );
}

/** Karta, na kterou se dá kliknout, se chová jako tlačítko včetně mechaniky. */
export function CardButton({
  tone = "paper",
  className = "",
  children,
  ...rest
}: {
  tone?: CardTone;
  className?: string;
  children: ReactNode;
} & ComponentPropsWithoutRef<"button">) {
  return (
    <button
      className={`mech text-left ${base} ${tones[tone]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
