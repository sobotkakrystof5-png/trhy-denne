import { symbolIcons } from "@/data/icons.generated";
import type { SymbolInfo } from "@/data/sample";

/**
 * Ikona položky v kroužku. Jediné místo, kde se kreslí loga firem, aby
 * šla kdykoli nahradit monogramy (ochranné známky jsou otevřená otázka).
 * Indexy mají vždy textový monogram, nikdy oficiální logo.
 *
 * Neplést s BrandMark, což je značka tohoto webu.
 */
export function SymbolIcon({
  symbol,
  size = "md",
}: {
  symbol: Pick<SymbolInfo, "ticker" | "kind" | "monogram">;
  size?: "md" | "lg";
}) {
  const icon = symbol.kind === "stock" ? symbolIcons[symbol.ticker] : undefined;
  const large = size === "lg";

  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full border-2 border-ink bg-paper text-ink ${
        large ? "size-14" : "size-11"
      }`}
    >
      {icon ? (
        <svg
          viewBox="0 0 24 24"
          width={large ? 34 : 26}
          height={large ? 34 : 26}
          fill="currentColor"
          focusable="false"
        >
          <path d={icon.path} />
        </svg>
      ) : (
        <Monogram text={symbol.monogram} large={large} />
      )}
    </span>
  );
}

function Monogram({ text, large }: { text: string; large: boolean }) {
  // Delší zkratka dostane menší písmo, aby se vešla do čtverce.
  const fontSize =
    text.length <= 2
      ? large
        ? "text-[0.8125rem]"
        : "text-[0.6875rem]"
      : text.length === 3
        ? large
          ? "text-[0.6875rem]"
          : "text-[0.5625rem]"
        : large
          ? "text-[0.5625rem]"
          : "text-[0.4375rem]";

  return (
    <span
      className={`grid place-items-center rounded-[5px] border-[2.5px] border-ink font-display font-bold uppercase leading-none tracking-[0.02em] ${fontSize} ${
        large ? "size-9" : "size-7"
      }`}
    >
      {text}
    </span>
  );
}
