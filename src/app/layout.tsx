import type { Metadata } from "next";
import { headers } from "next/headers";
import { site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${site.name}: ${site.tagline.toLowerCase()}`,
    template: `%s | ${site.name}`,
  },
  description:
    "Ranní přehled vybraných amerických akcií a indexů v e-mailu. Čísla a krátké vysvětlení, proč se cena pohnula.",
  // Web se neindexuje, dokud uživatel nerozhodne o spuštění.
  robots: site.indexable
    ? undefined
    : { index: false, follow: false, nocache: true },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  /*
   * Nonce čteme, i když ho sem přímo nevkládáme. Next.js si ho vytáhne
   * z hlavičky Content-Security-Policy sám a doplní ho svým skriptům,
   * ale jen u dynamicky vykreslené stránky. Tímto čtením ji vynutíme.
   */
  await headers();

  return (
    <html lang="cs" className="h-full antialiased">
      <body className="paper-grid flex min-h-full flex-col">{children}</body>
    </html>
  );
}
