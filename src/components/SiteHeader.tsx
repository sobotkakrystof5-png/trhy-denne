import { Header } from "./Header";
import { ScrollProgress } from "./ScrollProgress";
import { TickerTape } from "./TickerTape";

/**
 * Hlava webu: horní pruh, hlavička a kurzovní pás jako jeden přilepený
 * celek. Tři vodorovné linky nad sebou tvoří "hlavu tabule", proto se
 * scrollují společně a ne každá zvlášť.
 */
export function SiteHeader() {
  return (
    <div className="sticky top-0 z-50">
      <ScrollProgress />
      <Header />
      <TickerTape />
    </div>
  );
}
