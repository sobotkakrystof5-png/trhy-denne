import { Link } from "@react-email/components";
import { ActionButton, EmailLayout, Note, Paragraph } from "./Layout";
import { site } from "@/lib/site";

/**
 * Texty transakčních e-mailů. Prošly skillem humanize-text-cs.
 * Každá šablona má i textovou verzi, kterou vyrobí render s plainText.
 */

export function ConfirmSubscriptionEmail({
  url,
  hours,
  requestedTierName,
}: {
  url: string;
  hours: number;
  requestedTierName?: string;
}) {
  return (
    <EmailLayout preview="Jedno kliknutí a odběr začne.">
      <Paragraph>
        Tuto adresu někdo zadal do formuláře na webu {site.name}. Pokud jste to
        byli vy, potvrďte odběr tlačítkem. Do té doby vám nic posílat nebudeme.
      </Paragraph>
      <ActionButton href={url}>Potvrdit odběr</ActionButton>
      {requestedTierName ? (
        <Paragraph>
          Zájem o tarif {requestedTierName} máme poznamenaný. Platby zatím
          nespouštíme, a až tarif spustíme, ozveme se.
        </Paragraph>
      ) : null}
      <Note>
        Odkaz platí {hours} hodin. O odběr jste nežádali? E-mail smažte, bez
        potvrzení se nic nestane.
      </Note>
      <Note>
        Tlačítko nefunguje? Zkopírujte do prohlížeče tuto adresu:{" "}
        <Link href={url}>{url}</Link>
      </Note>
    </EmailLayout>
  );
}

export function LoginEmail({ url, minutes }: { url: string; minutes: number }) {
  return (
    <EmailLayout preview="Odkaz pro přihlášení do účtu.">
      <Paragraph>
        Tlačítkem se přihlásíte do svého účtu. Odkaz platí {minutes} minut a
        použít ho jde jen jednou.
      </Paragraph>
      <ActionButton href={url}>Přihlásit se</ActionButton>
      <Note>
        O přihlášení jste nežádali? E-mail smažte. Bez odkazu se do účtu nikdo
        nedostane.
      </Note>
      <Note>
        Tlačítko nefunguje? Zkopírujte do prohlížeče tuto adresu:{" "}
        <Link href={url}>{url}</Link>
      </Note>
    </EmailLayout>
  );
}

export function AlreadySubscribedEmail({
  loginUrl,
  requestedTierName,
}: {
  loginUrl: string;
  requestedTierName?: string;
}) {
  return (
    <EmailLayout preview="Odběr už máte potvrzený.">
      <Paragraph>
        Na webu {site.name} někdo znovu zadal tuto adresu. Odběr už máte
        potvrzený, takže dělat nemusíte nic.
      </Paragraph>
      {requestedTierName ? (
        <Paragraph>
          Zájem o tarif {requestedTierName} máme poznamenaný. Platby zatím
          nespouštíme, a až tarif spustíme, ozveme se.
        </Paragraph>
      ) : null}
      <Paragraph>Tarif a výběr položek najdete ve svém účtu.</Paragraph>
      <ActionButton href={loginUrl}>Do účtu</ActionButton>
    </EmailLayout>
  );
}
