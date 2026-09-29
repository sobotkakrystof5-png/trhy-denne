"use client";

import { useEffect, useRef } from "react";
import { formatPercentChange } from "@/lib/format";

/**
 * Dopočítá procentní změnu od nuly, jednou, při prvním vstupu do obrazovky.
 *
 * Server vykreslí konečné číslo. Text se mění přímo v DOM, ne přes stav,
 * aby animace nepřekreslovala React 60× za sekundu. Na konci vždy zůstane
 * přesně totéž, co vykreslil server.
 */
export function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Co je vidět už při načtení, nechá se být. Skok na nulu by blikl.
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) return;

    const final = formatPercentChange(value);
    let frame = 0;
    element.textContent = formatPercentChange(0);

    const run = () => {
      const start = performance.now();
      const duration = 900;
      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent =
          progress < 1 ? formatPercentChange(value * eased) : final;
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        run();
      },
      { threshold: 0.6 },
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      element.textContent = final;
    };
  }, [value]);

  return <span ref={ref}>{formatPercentChange(value)}</span>;
}
