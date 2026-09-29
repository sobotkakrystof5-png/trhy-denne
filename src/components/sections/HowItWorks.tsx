import type { ReactNode } from "react";

type Step = {
  title: string;
  text: string;
  tone: string;
  art: ReactNode;
};

/**
 * Jediné místo na stránce s řadou tří karet (zadání 0.2). Kroky jsou
 * skutečná posloupnost, proto čísla 01 až 03. Ilustrace jsou složené
 * z tvarů, ne ze sady ikon.
 */
const steps: Step[] = [
  {
    title: "Vyberte si tarif",
    text: "Free je zdarma a chodí jednou týdně. Start nebo Plus zvolte podle toho, kolik položek chcete sledovat.",
    tone: "bg-mist",
    art: <TiersArt />,
  },
  {
    title: "Sestavte si výběr",
    text: "Akcie a indexy najdete podle tickeru nebo názvu. Do Startu se vejde 5 položek, do Plusu 25.",
    tone: "bg-salmon",
    art: <SlotsArt />,
  },
  {
    title: "E-mail přijde sám",
    text: "Ráno po každém obchodním dni na americké burze. Nic nezapínáte a nic nehlídáte.",
    tone: "bg-sand",
    art: <LetterArt />,
  },
];

export function HowItWorks() {
  return (
    <section id="jak" aria-labelledby="jak-title" className="content-width section-y">
      <h2 id="jak-title" className="h2">
        Jak to funguje
      </h2>

      <ol className="mt-12 grid gap-4 md:gap-6 lg:grid-cols-3 lg:gap-12">
        {steps.map((step, index) => (
          <li key={step.title} className="relative flex">
            <article
              className={`flex w-full flex-col rounded-[var(--radius-card)] border-3 border-ink p-6 shadow-[var(--shadow-hard-lg)] md:p-9 ${step.tone}`}
            >
              <span
                aria-hidden="true"
                className="grid size-14 place-items-center rounded-full border-3 border-ink bg-cream font-display text-xl font-bold text-ink"
                data-numeric
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="h3 mt-6">{step.title}</h3>
              <p className="mt-3 text-[1.0625rem] leading-relaxed text-text">{step.text}</p>
              <div aria-hidden="true" className="mt-auto pt-8">
                {step.art}
              </div>
            </article>

            {index < steps.length - 1 ? <Connector /> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Tečkovaná spojnice s kosočtvercem v mezeře mezi kartami, jen na počítači. */
function Connector() {
  return (
    <span
      aria-hidden="true"
      className="absolute -right-12 top-1/2 hidden w-12 -translate-y-1/2 items-center lg:flex"
    >
      <span className="h-0 flex-1 border-t-2 border-dotted border-ink" />
      <span className="size-3 rotate-45 border-2 border-ink bg-cream" />
      <span className="h-0 flex-1 border-t-2 border-dotted border-ink" />
    </span>
  );
}

/** Tři čtverce rostoucí velikosti: tarify s různým počtem míst. */
function TiersArt() {
  return (
    <svg viewBox="0 0 120 48" width="120" height="48" focusable="false">
      <rect x="1.5" y="30.5" width="16" height="16" rx="2" className="fill-paper stroke-ink" strokeWidth="3" />
      <rect x="27.5" y="20.5" width="26" height="26" rx="3" className="fill-paper stroke-ink" strokeWidth="3" />
      <rect x="63.5" y="6.5" width="40" height="40" rx="4" className="fill-ink stroke-ink" strokeWidth="3" />
    </svg>
  );
}

/** Počítadlo míst v malém: tři obsazená, dvě volná. */
function SlotsArt() {
  return (
    <svg viewBox="0 0 150 30" width="150" height="30" focusable="false">
      {[0, 1, 2, 3, 4].map((index) => (
        <rect
          key={index}
          x={1.5 + index * 30}
          y="1.5"
          width="24"
          height="24"
          rx="3"
          className={index < 3 ? "fill-ink stroke-ink" : "fill-paper stroke-ink"}
          strokeWidth="3"
        />
      ))}
    </svg>
  );
}

/** Obálka a kroužek nad obzorem: ráno přijde dopis. */
function LetterArt() {
  return (
    <svg viewBox="0 0 120 52" width="120" height="52" focusable="false">
      <circle cx="96" cy="18" r="12" className="fill-salmon stroke-ink" strokeWidth="3" />
      <rect x="1.5" y="14.5" width="62" height="36" rx="3" className="fill-paper stroke-ink" strokeWidth="3" />
      <path d="M3 16.5 32.5 36 62 16.5" fill="none" className="stroke-ink" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}
