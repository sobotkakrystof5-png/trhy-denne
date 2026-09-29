import "server-only";
import { render } from "@react-email/render";
import type { ReactElement } from "react";
import { Resend } from "resend";
import {
  AlreadySubscribedEmail,
  ConfirmSubscriptionEmail,
  LoginEmail,
} from "@/emails/templates";
import { env, isDev, siteUrl } from "@/lib/env";
import { site } from "@/lib/site";

/**
 * Transakční e-maily jdou přímo z Next.js přes Resend (zadání 5.6),
 * protože musí dorazit hned. Reporty posílá n8n.
 *
 * Bez klíče Resendu se ve vývoji e-mail vypíše do konzole serveru, aby šel
 * celý tok vyzkoušet. V produkci bez klíče se nic nepředstírá a volající
 * trasa odpoví 503 (viz accountsReady v env.ts).
 */
async function send(to: string, subject: string, element: ReactElement) {
  const { RESEND_API_KEY, EMAIL_FROM } = env();
  const [html, text] = await Promise.all([
    render(element),
    render(element, { plainText: true }),
  ]);

  if (RESEND_API_KEY && EMAIL_FROM) {
    const resend = new Resend(RESEND_API_KEY);
    const { error } = await resend.emails.send({ from: EMAIL_FROM, to, subject, html, text });
    if (error) throw new Error(`Resend: ${error.name}: ${error.message}`);
    return;
  }

  if (isDev) {
    console.info(`\n[e-mail, jen vývoj] komu: ${to}\npředmět: ${subject}\n\n${text}\n`);
    return;
  }

  throw new Error("E-mail není nastavený (RESEND_API_KEY, EMAIL_FROM).");
}

export const CONFIRM_LINK_HOURS = 48;

export function sendConfirmEmail(to: string, url: string, requestedTierName?: string) {
  return send(
    to,
    `Potvrďte odběr: ${site.name}`,
    <ConfirmSubscriptionEmail url={url} hours={CONFIRM_LINK_HOURS} requestedTierName={requestedTierName} />,
  );
}

export function sendAlreadySubscribedEmail(to: string, requestedTierName?: string) {
  return send(
    to,
    `Odběr už máte: ${site.name}`,
    <AlreadySubscribedEmail loginUrl={`${siteUrl()}/prihlaseni`} requestedTierName={requestedTierName} />,
  );
}

/** Platnost odkazu pro přihlášení. E-maily občas chodí se zpožděním. */
export const LOGIN_LINK_MINUTES = 15;

export function sendLoginEmail(to: string, url: string) {
  return send(to, `Přihlášení: ${site.name}`, <LoginEmail url={url} minutes={LOGIN_LINK_MINUTES} />);
}
