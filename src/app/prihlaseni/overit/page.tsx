import type { Metadata } from "next";
import { PageShell, TaskLayout, TextLink } from "@/components/PageShell";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Přihlášení" };

/**
 * Sem vede odkaz z e-mailu. Token se spotřebuje až po kliknutí na tlačítko:
 * skenery pošty odkaz otevřou, ale formulář neodešlou. Formulář jde přímo
 * na ověření Better Auth, které nastaví relaci a přesměruje do účtu.
 */
const TOKEN = /^[A-Za-z0-9]{32}$/;

export default async function VerifyLoginPage({ searchParams }: PageProps<"/prihlaseni/overit">) {
  const { token } = await searchParams;
  const valid = typeof token === "string" && TOKEN.test(token);

  return (
    <PageShell>
      <TaskLayout
        title="Přihlášení"
        lead={
          valid ? (
            <p>Odkaz je v pořádku. Přihlášení dokončíte tlačítkem.</p>
          ) : (
            <p>Tento odkaz není úplný. Zkopírujte ho z e-mailu celý, nebo si pošlete nový.</p>
          )
        }
      >
        {valid ? (
          <form method="get" action="/api/auth/magic-link/verify">
            <input type="hidden" name="token" value={token} />
            <input type="hidden" name="callbackURL" value="/ucet" />
            <input type="hidden" name="errorCallbackURL" value="/prihlaseni" />
            <Button type="submit" className="w-full">
              Přihlásit se
            </Button>
          </form>
        ) : (
          <TextLink href="/prihlaseni">Poslat nový odkaz</TextLink>
        )}
      </TaskLayout>
    </PageShell>
  );
}
