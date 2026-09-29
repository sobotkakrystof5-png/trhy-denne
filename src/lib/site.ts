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

/** Přihlášený uživatel se z /prihlaseni přesměruje rovnou do účtu. */
export const loginHref = "/prihlaseni";
export const loginLabel = "Přihlásit";

/**
 * Odkazy na kotvy vedou přes "/", aby fungovaly i z právních stránek.
 * Na hlavní stránce jde o posun v rámci dokumentu, ne o nové načtení.
 */
export const anchorHref = (id: string) => `/#${id}`;

/** Právní stránky. Texty dodá právník, do té doby jsou prázdné. */
export const legalPages = [
  { href: "/podminky", label: "Obchodní podmínky" },
  { href: "/ochrana-udaju", label: "Ochrana osobních údajů" },
  { href: "/disclaimer", label: "Upozornění k obsahu" },
] as const;

export type NavItem = (typeof navItems)[number];
