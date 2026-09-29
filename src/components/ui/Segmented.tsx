import type { ReactNode } from "react";

export type SegmentOption<T extends string> = {
  value: T;
  label: ReactNode;
};

/**
 * Segmentový přepínač. Uvnitř jsou nativní přepínače (radio), takže
 * šipky, tabulátor i čtečky fungují bez vlastní logiky klávesnice.
 */
export function Segmented<T extends string>({
  legend,
  name,
  options,
  value,
  onChange,
  className = "",
}: {
  legend: ReactNode;
  name: string;
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <fieldset className={className}>
      <legend className="label-caps mb-2">{legend}</legend>
      <div className="flex overflow-hidden rounded-[var(--radius-btn)] border-3 border-ink bg-paper">
        {options.map((option, index) => {
          const checked = option.value === value;
          return (
            <label
              key={option.value}
              // Fokus je uvnitř segmentu, protože obrys vně by zakryl sousedy.
              // Na černém aktivním segmentu krémový, jinak černý.
              className={`relative flex min-h-11 flex-1 cursor-pointer items-center justify-center px-3 text-center font-display text-sm font-bold uppercase leading-tight tracking-[0.08em] transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:-outline-offset-[7px] ${
                index > 0 ? "border-l-3 border-ink" : ""
              } ${
                checked
                  ? "bg-ink text-cream has-[:focus-visible]:outline-cream"
                  : "text-ink hover:bg-cream has-[:focus-visible]:outline-ink"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
