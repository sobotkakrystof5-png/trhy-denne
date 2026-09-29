"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Nastavuje rychlost pásu na konstantních 60 px/s.
 *
 * Nejde to udělat atributem style v HTML: CSP bez 'unsafe-inline' inline
 * styly v značkách blokuje a nonce se na ně nevztahuje. Zápis přes CSSOM
 * ale CSP neřeší, takže se hodnota nastaví tady.
 *
 * Vedlejší zisk: rychlost pak nezávisí na počtu položek ani na tom, jak
 * široce se vysází písmo. Bez JavaScriptu platí výchozí hodnota z CSS.
 */
const PIXELS_PER_SECOND = 60;

export function TickerTrack({ children }: { children: ReactNode }) {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = track.current;
    if (!element) return;

    const measure = () => {
      // Řetěz je zdvojený a posouvá se o -50 %, takže ujetá dráha
      // je šířka jedné kopie.
      const distance = element.scrollWidth / 2;
      if (distance <= 0) return;
      element.style.setProperty(
        "--ticker-duration",
        `${(distance / PIXELS_PER_SECOND).toFixed(1)}s`,
      );
    };

    measure();

    // Písmo dorazí později a změní šířku. Bez toho by pás zrychlil.
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={track} className="ticker-track">
      {children}
    </div>
  );
}
