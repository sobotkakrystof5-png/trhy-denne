import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageShell, TaskLayout, TextLink } from "@/components/PageShell";
import { getSession } from "@/lib/auth";
import { LOGIN_LINK_MINUTES } from "@/lib/email";
import { accountsReady } from "@/lib/env";
import { anchorHref, ctaAnchor } from "@/lib/site";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Přihlášení" };

/** Chyby, se kterými sem vrací ověření odkazu (Better Auth, parametr error). */
const errors: Record<string, string> = {
  INVALID_TOKEN: "Odkaz už neplatí. Buď vypršel, nebo už byl použitý. Pošleme vám nový.",
  new_user_signup_disabled: "K této adrese účet nemáme. Nejdřív se přihlaste k odběru.",
  UNAVAILABLE: "Přihlášení zatím nespouštíme, web se teprve dokončuje.",
};

export default async function LoginPage({ searchParams }: PageProps<"/prihlaseni">) {
  if (accountsReady() && (await getSession())) redirect("/ucet");

  const { error } = await searchParams;
  const message = typeof error === "string" ? (errors[error] ?? errors.INVALID_TOKEN) : null;

  return (
    <PageShell>
      <TaskLayout
        title="Přihlášení"
        lead={
          <p>
            Pošleme vám odkaz na e-mail a přes něj se přihlásíte. Heslo
            nepotřebujete.
          </p>
        }
        aside={
          <p className="text-[0.9375rem] leading-normal">
            Ještě odběr nemáte?{" "}
            <TextLink href={anchorHref(ctaAnchor)}>Odebírat zdarma</TextLink>
          </p>
        }
      >
        {message ? (
          <p className="mb-6 rounded-[var(--radius-field)] border-3 border-ink bg-sand px-5 py-4 text-[0.9375rem] font-semibold leading-normal text-ink">
            {message}
          </p>
        ) : null}
        <LoginForm minutes={LOGIN_LINK_MINUTES} />
      </TaskLayout>
    </PageShell>
  );
}
