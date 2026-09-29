/**
 * Jediné místo, kde žije název značky. Doména ani finální název zatím nejsou
 * rozhodnuté (viz Otevřené otázky v memory/memory.md), takže se všude používá
 * pracovní název odsud. Přejmenování je pak změna jednoho řádku.
 */
export const site = {
  name: "Trhy denně",
  /** Popisek vedle loga v hlavičce. Musí být pravdivý, ne slib funkce navíc. */
  tagline: "Přehled akcií v e-mailu",
  /** Web je noindex, dokud uživatel nerozhodne o spuštění. */
  indexable: false,
} as const;

/** Kotvy prodejní stránky. Pořadí drží navigaci i scrollspy. */
export const navItems = [
  { id: "jak", label: "Jak to funguje" },
  { id: "dashboard", label: "Dashboard" },
  { id: "analyzy", label: "Analýzy" },
  { id: "cenik", label: "Ceník" },
  { id: "faq", label: "FAQ" },
] as const;

export const ctaAnchor = "objednat";
export const ctaLabel = "Odebírat";

export type NavItem = (typeof navItems)[number];
