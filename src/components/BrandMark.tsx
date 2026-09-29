/**
 * Značka webu. Kroužek z cr-8 se vědomě nekopíruje (je to jeho podpis).
 * Místo něj čtvercový rám se třemi linkami různé délky, což je zápis
 * sloupce kurzů. Papírový jazyk, ale patří finančnímu produktu.
 */
export function BrandMark({
  size = 32,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <rect
        x="1.5"
        y="1.5"
        width="29"
        height="29"
        rx="5"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        d="M8 11h16M8 16h11M8 21h7"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
