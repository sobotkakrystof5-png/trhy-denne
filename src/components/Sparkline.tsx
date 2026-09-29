/**
 * Křivka v inkoustu. Záměrně černá, ne zelená a červená: směr nesou
 * znaménko a štítek změny, ne barva čáry.
 *
 * SVG se natahuje na šířku rodiče (preserveAspectRatio="none"), proto
 * má čára i koncový bod non-scaling-stroke. Koncový bod je čára nulové
 * délky s kulatým zakončením, takže zůstane kulatý při jakémkoli poměru
 * stran. Kroužek z <circle> by se na široké dlaždici roztáhl do elipsy.
 *
 * Rozměr určuje rodič přes className, takže rozložení se neposune.
 */
export function Sparkline({
  values,
  className = "h-12",
  strokeWidth = 2.5,
  label,
}: {
  values: number[];
  className?: string;
  strokeWidth?: number;
  /** Když chybí, graf je pro čtečky skrytý, protože čísla nese text vedle. */
  label?: string;
}) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const last = values.length - 1;

  const points = values.map((value, index) => {
    const x = (index / last) * 100;
    // 6 až 94, aby tlustá čára nesedla přesně na okraj.
    const y = 94 - ((value - min) / span) * 88;
    return [round(x), round(y)] as const;
  });

  const d = points
    .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x} ${y}`)
    .join("");
  const [endX, endY] = points[last];
  const dot = `M${endX} ${endY}h0`;

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      focusable="false"
      className={`spark-draw block w-full overflow-visible ${className}`}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    >
      <path
        d={d}
        fill="none"
        className="stroke-ink"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={dot}
        className="stroke-ink"
        strokeWidth={14}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={dot}
        className="stroke-salmon"
        strokeWidth={10}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
