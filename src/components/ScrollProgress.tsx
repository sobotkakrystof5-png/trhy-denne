"use client";

import { useEffect, useRef } from "react";

/**
 * Horní pruh 6 px, který se plní podle pozice ve stránce.
 * Je to jediný trvalý pohyb navázaný na scroll. Právě proto sekce
 * nepotřebují obvyklé "fade-in a posun nahoru", které zadání zakazuje.
 *
 * Píšu to ručně přes rAF místo scroll-driven animací v CSS, protože ty
 * zatím nemá Firefox. Fallback by stejně musel existovat.
 */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = bar.current;
    if (!element) return;

    // prefers-reduced-motion se tu neřeší schválně: pruh kopíruje pozici
    // scrollu jedna ku jedné, stejně jako posuvník. Není to animace.
    let frame = 0;

    const update = () => {
      frame = 0;
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
      element.style.transform = `scaleX(${Math.min(Math.max(ratio, 0), 1)})`;
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="h-1.5 w-full bg-cream" aria-hidden="true">
      <div
        ref={bar}
        className="h-full w-full origin-left scale-x-0 bg-salmon"
      />
    </div>
  );
}
