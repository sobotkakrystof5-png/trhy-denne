import type { Metadata } from "next";
import { PageShell, TaskLayout, TextLink } from "@/components/PageShell";
import { CONFIRM_LINK_HOURS } from "@/lib/email";

export const metadata: Metadata = { title: "Zkontrolujte e-mail" };

/**
 * Sem přesměruje formulář odběru odeslaný bez JavaScriptu. S JavaScriptem
 * se totéž ukáže přímo pod formulářem.
 */
export default function ThanksPage() {
  return (
    <PageShell>
      <TaskLayout
        title="Zkontrolujte e-mail"
        lead={
          <p>
            Poslali jsme vám potvrzovací odkaz. Odběr začne, až na něj
            kliknete.
          </p>
        }
      >
        <p className="text-lg leading-relaxed">
          Odkaz platí {CONFIRM_LINK_HOURS} hodin. Nic nepřišlo? Podívejte se do spamu, nebo
          zadejte adresu do formuláře znovu.
        </p>
        <div className="mt-6">
          <TextLink href="/">Na hlavní stránku</TextLink>
        </div>
      </TaskLayout>
    </PageShell>
  );
}
