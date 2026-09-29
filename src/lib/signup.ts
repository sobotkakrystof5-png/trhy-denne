/**
 * Pravidla formuláře odběru. Stejnou funkci volá prohlížeč i server,
 * aby klient nepustil nic, co server odmítne, a naopak.
 */
export const signupTiers = ["free", "start", "plus"] as const;
export type SignupTier = (typeof signupTiers)[number];

/**
 * Verze znění souhlasu. Znění dodá právník (Otevřené otázky), do té doby
 * je to návrh. Server verzi ukládá k souhlasu jako důkaz (users.consent_text_version).
 */
export const CONSENT_TEXT_VERSION = "navrh-2026-09-29";

export const EMAIL_MAX_LENGTH = 254;

// Záměrně volné. Skutečnou existenci adresy ověří až potvrzovací e-mail.
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type SignupFieldErrors = { email?: string; consent?: string };

export const signupMessages = {
  emailMissing: "Zadejte e-mail, na který má přehled chodit.",
  emailInvalid: "Zadejte platný e-mail, třeba jmeno@firma.cz.",
  consentMissing: "Bez souhlasu vám přehled posílat nemůžeme. Zaškrtněte ho.",
} as const;

export function validateSignup(input: {
  email: string;
  consent: boolean;
}): SignupFieldErrors {
  const errors: SignupFieldErrors = {};
  const email = input.email.trim();
  if (!email) errors.email = signupMessages.emailMissing;
  else if (email.length > EMAIL_MAX_LENGTH || !EMAIL_PATTERN.test(email))
    errors.email = signupMessages.emailInvalid;
  if (!input.consent) errors.consent = signupMessages.consentMissing;
  return errors;
}
