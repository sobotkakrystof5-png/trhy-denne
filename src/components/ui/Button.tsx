import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "primary" | "secondary" | "cta";

const base =
  "mech inline-flex items-center justify-center gap-3 font-display font-bold uppercase tracking-[0.08em] text-[0.9375rem] leading-none border-3 border-ink disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  // Hlavní akce: černá výplň, krémový text, šedý tvrdý stín.
  primary:
    "h-14 px-7 rounded-[var(--radius-btn)] bg-ink text-cream shadow-[var(--shadow-btn)] hover:shadow-[var(--shadow-btn-hover)]",
  // Vedlejší akce: krémová výplň, černý okraj.
  secondary:
    "h-14 px-7 rounded-[var(--radius-btn)] bg-cream text-ink shadow-[var(--shadow-btn)] hover:shadow-[var(--shadow-btn-hover)]",
  // CTA v hlavičce: lososové, nižší a téměř hranaté.
  cta: "h-11 px-7 rounded-[var(--radius-cta)] bg-salmon text-ink shadow-[var(--shadow-btn)] hover:shadow-[var(--shadow-btn-hover)]",
};

type ButtonProps = {
  variant?: Variant;
  /** Šipka patří k akci, která někam vede. U přepínačů se vypíná. */
  arrow?: boolean;
  children: ReactNode;
  className?: string;
};

export function buttonClass(variant: Variant = "primary", className = "") {
  return `${base} ${variants[variant]} ${className}`.trim();
}

export function Button({
  variant = "primary",
  arrow = true,
  children,
  className = "",
  ...rest
}: ButtonProps & ComponentPropsWithoutRef<"button">) {
  return (
    <button className={buttonClass(variant, className)} {...rest}>
      {children}
      {arrow ? <Arrow /> : null}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  arrow = true,
  children,
  className = "",
  ...rest
}: ButtonProps & ComponentPropsWithoutRef<"a">) {
  return (
    <a className={buttonClass(variant, className)} {...rest}>
      {children}
      {arrow ? <Arrow /> : null}
    </a>
  );
}

/** Šipka je obrázek, ne text. Čtečka ji nemá číst jako znak. */
function Arrow() {
  return (
    <svg
      width="16"
      height="12"
      viewBox="0 0 16 12"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M1 6h13M9.5 1.5 14 6l-4.5 4.5"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
