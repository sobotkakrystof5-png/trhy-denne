import type { Metadata } from "next";
import { PageShell, TaskLayout, TextLink } from "@/components/PageShell";
import { Button } from "@/components/ui/Button";
import { anchorHref, ctaAnchor } from "@/lib/site";

export const metadata: Metadata = { title: "Potvrzení odběru" };

/**
 * Potvrzení odběru (double opt-in). Odkaz z e-mailu sem přinese token,
 * odběr potvrdí až tlačítko (POST /api/confirm). Trasa pak přesměruje
 * zpět s parametrem stav.
 */
const TOKEN = /^[A-Za-z0-9_-]{43}$/;

const states: Record<string, { title: string; text: string; next?: "login" | "subscribe" }> = {
  potvrzeno: {
    title: "Odběr je potvrzený",
    // Reporty zatím neběží (fáze 5). Stránka nesmí slibovat, kdy přijdou.
    text: "Přehledy zatím neposíláme, první dostanete po spuštění webu. Tarif a výběr položek najdete v účtu.",
    next: "login",
  },
  neplatny: {
    title: "Odkaz už neplatí",
    text: "Buď vypršel, nebo už byl použitý. Pokud jste odběr potvrdili, nemusíte dělat nic. Jinak zadejte e-mail do formuláře znovu a pošleme nový odkaz.",
    next: "subscribe",
  },
  pozdeji: {
    title: "Příliš mnoho pokusů",
    text: "Z vašeho připojení přišlo za chvíli moc pokusů. Zkuste odkaz otevřít za pár minut znovu.",
  },
  nedostupne: {
    title: "Potvrzení teď nejde",
    text: "Odběr zatím nespouštíme, web se teprve dokončuje.",
  },
  chyba: {
    title: "Něco se pokazilo",
    text: "Server odpověděl chybou. Zkuste odkaz z e-mailu otevřít za pár minut znovu.",
  },
};

export default async function ConfirmPage({ searchParams }: PageProps<"/potvrzeni">) {
  const { token, stav } = await searchParams;
  const result = typeof stav === "string" ? states[stav] : undefined;
  const validToken = typeof token === "string" && TOKEN.test(token);

  if (result) {
    return (
      <PageShell>
        <TaskLayout title={result.title} lead={<p>{result.text}</p>}>
          {result.next === "login" ? (
            <TextLink href="/prihlaseni">Přihlásit se do účtu</TextLink>
          ) : result.next === "subscribe" ? (
            <TextLink href={anchorHref(ctaAnchor)}>Zpět k formuláři</TextLink>
          ) : (
            <TextLink href="/">Na hlavní stránku</TextLink>
          )}
        </TaskLayout>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <TaskLayout
        title="Potvrzení odběru"
        lead={
          validToken ? (
            <p>Posledním krokem je tlačítko. Bez něj vám nic posílat nebudeme.</p>
          ) : (
            <p>Tento odkaz není úplný. Zkopírujte ho z e-mailu celý.</p>
          )
        }
      >
        {validToken ? (
          <form method="post" action="/api/confirm">
            <input type="hidden" name="token" value={token} />
            <Button type="submit" className="w-full">
              Potvrdit odběr
            </Button>
          </form>
        ) : (
          <TextLink href="/">Na hlavní stránku</TextLink>
        )}
      </TaskLayout>
    </PageShell>
  );
}
