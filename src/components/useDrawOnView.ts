"use client";

import { useEffect, useRef } from "react";

/**
 * Nakreslí křivky uvnitř prvku, až prvek poprvé vjede do obrazovky.
 *
 * Server vykreslí křivky celé, takže bez JavaScriptu je vše vidět.
 * Schová je až tady, a jen když prvek zatím vidět není. Co je na
 * obrazovce už při načtení, zůstane v klidu, aby nic neblikalo.
 * Při prefers-reduced-motion se nic nestane.
 */
export function useDrawOnView<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) return;

    element.dataset.draw = "armed";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        element.dataset.draw = "run";
        observer.disconnect();
      },
      { threshold: 0.2 },
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
      delete element.dataset.draw;
    };
  }, []);

  return ref;
}
