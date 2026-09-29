/**
 * Tečkovaný předěl s prázdným kosočtvercem uprostřed.
 * Zadání říká výslovně: mezi některými sekcemi, ne mezi všemi.
 */
export function SectionDivider() {
  return (
    <div className="content-width" aria-hidden="true">
      <div className="relative flex items-center">
        <span className="h-px flex-1 border-t border-dotted border-rule" />
        <span className="mx-4 size-3.5 rotate-45 border-2 border-ink bg-cream" />
        <span className="h-px flex-1 border-t border-dotted border-rule" />
      </div>
    </div>
  );
}
