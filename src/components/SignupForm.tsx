"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Button } from "./ui/Button";
import { Segmented } from "./ui/Segmented";
import { plans } from "@/lib/plans";
import {
  CONSENT_TEXT_VERSION,
  EMAIL_MAX_LENGTH,
  type SignupFieldErrors,
  type SignupTier,
  validateSignup,
} from "@/lib/signup";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "not_ready" }
  | { kind: "success"; email: string }
  | { kind: "rate_limited" }
  | { kind: "network_error" }
  | { kind: "server_error" };

const tierOptions: { value: SignupTier; label: string }[] = [
  { value: "free", label: plans.free.name },
  { value: "start", label: plans.start.name },
  { value: "plus", label: plans.plus.name },
];

/**
 * Formulář odběru. Hero má jen e-mail a souhlas, závěrečná výzva navíc
 * přepínač tarifu. Bez JavaScriptu se odešle klasicky na tutéž trasu.
 */
export function SignupForm({
  withTier = false,
  paymentsLive = false,
}: {
  withTier?: boolean;
  /** Běží platby? Mění jen to, co formulář slibuje u placených tarifů. */
  paymentsLive?: boolean;
}) {
  const id = useId();
  const emailRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [tier, setTier] = useState<SignupTier>("free");
  const [errors, setErrors] = useState<SignupFieldErrors>({});
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  // Tlačítka v ceníku vedou sem a nesou zvolený tarif.
  useEffect(() => {
    if (!withTier) return;
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest<HTMLElement>(
        "[data-signup-tier]",
      );
      const chosen = link?.dataset.signupTier;
      if (chosen === "free" || chosen === "start" || chosen === "plus") {
        setTier(chosen);
        requestAnimationFrame(() =>
          emailRef.current?.focus({ preventScroll: true }),
        );
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [withTier]);

  // Po prvním pokusu se chyby přepočítávají průběžně, dřív ne.
  // Křičet na člověka, který ještě píše, je nevlídné.
  const revalidate = (next: { email: string; consent: boolean }) => {
    if (attempted) setErrors(validateSignup(next));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status.kind === "submitting") return;
    setAttempted(true);

    const found = validateSignup({ email, consent });
    setErrors(found);
    if (found.email) return emailRef.current?.focus();
    if (found.consent) return consentRef.current?.focus();

    const company =
      (event.currentTarget.elements.namedItem("company") as HTMLInputElement | null)
        ?.value ?? "";

    setStatus({ kind: "submitting" });
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          consent,
          tier: withTier ? tier : "free",
          consentVersion: CONSENT_TEXT_VERSION,
          company,
        }),
      });

      if (response.ok) {
        setStatus({ kind: "success", email: email.trim() });
        setEmail("");
        setConsent(false);
        setAttempted(false);
        return;
      }
      if (response.status === 503) return setStatus({ kind: "not_ready" });
      if (response.status === 429) return setStatus({ kind: "rate_limited" });
      if (response.status === 400) {
        const data = (await response.json().catch(() => null)) as {
          fields?: SignupFieldErrors;
        } | null;
        if (data?.fields && Object.keys(data.fields).length > 0) {
          setErrors(data.fields);
          setStatus({ kind: "idle" });
          return;
        }
      }
      setStatus({ kind: "server_error" });
    } catch {
      setStatus({ kind: "network_error" });
    }
  };

  const submitting = status.kind === "submitting";
  const submitLabel = submitting
    ? "Odesílám"
    : tier === "free" || !withTier
      ? "Odebírat zdarma"
      : `Mám zájem o ${plans[tier].name}`;

  const submitButton = (
    <Button
      type="submit"
      disabled={submitting}
      className={withTier ? "w-full" : "shrink-0"}
    >
      {submitLabel}
    </Button>
  );

  const emailErrorId = `${id}-email-error`;
  const consentErrorId = `${id}-consent-error`;
  const helpId = `${id}-help`;

  return (
    <form
      action="/api/subscribe"
      method="post"
      noValidate
      onSubmit={onSubmit}
      className="relative"
    >
      <input type="hidden" name="consentVersion" value={CONSENT_TEXT_VERSION} />
      {withTier ? null : <input type="hidden" name="tier" value="free" />}

      <div className="honeypot" aria-hidden="true">
        <label>
          Firma
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {withTier ? (
        <div className="mb-6">
          <Segmented
            legend="Tarif"
            name="tier"
            options={tierOptions}
            value={tier}
            onChange={setTier}
          />
          <p className="mt-3 text-[0.9375rem] leading-normal text-text">
            {tier === "free"
              ? "Každou neděli tři největší pohyby týdne. Zdarma a bez platební karty."
              : paymentsLive
                ? `Nejdřív vám pošleme potvrzovací e-mail. Tarif ${plans[tier].name} pak zaplatíte ve svém účtu.`
                : `Platby zatím nespouštíme. Zapíšeme vás na Free a poznamenáme si zájem o ${plans[tier].name}. Až tarif spustíme, napíšeme vám.`}
          </p>
        </div>
      ) : null}

      <label
        htmlFor={`${id}-email`}
        className="mb-2 block font-display text-[0.9375rem] font-bold text-ink"
      >
        Váš e-mail
      </label>
      <div className={`flex flex-col gap-3 ${withTier ? "" : "sm:flex-row"}`}>
        <input
          ref={emailRef}
          id={`${id}-email`}
          type="email"
          name="email"
          inputMode="email"
          autoComplete="email"
          spellCheck={false}
          maxLength={EMAIL_MAX_LENGTH}
          placeholder="jmeno@firma.cz"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            revalidate({ email: event.target.value, consent });
          }}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? `${emailErrorId} ${helpId}` : helpId}
          className={`h-14 w-full min-w-0 rounded-[var(--radius-field)] ${withTier ? "" : "sm:w-auto sm:flex-1"} border-3 border-ink bg-paper px-5 text-lg text-ink placeholder:text-mute focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink aria-[invalid=true]:border-loss-ink`}
        />
        {withTier ? null : submitButton}
      </div>
      {errors.email ? <FieldError id={emailErrorId}>{errors.email}</FieldError> : null}

      <div className="mt-4 flex items-start gap-3">
        <span className="relative mt-0.5 grid size-6 shrink-0 place-items-center">
          <input
            ref={consentRef}
            id={`${id}-consent`}
            type="checkbox"
            name="consent"
            checked={consent}
            onChange={(event) => {
              setConsent(event.target.checked);
              revalidate({ email, consent: event.target.checked });
            }}
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? consentErrorId : undefined}
            className="peer absolute inset-0 size-6 cursor-pointer appearance-none rounded-[4px] border-3 border-ink bg-paper checked:bg-salmon focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink aria-[invalid=true]:border-loss-ink"
          />
          <svg
            viewBox="0 0 16 16"
            width="14"
            height="14"
            aria-hidden="true"
            focusable="false"
            className="pointer-events-none relative hidden text-ink peer-checked:block"
          >
            <path
              d="M2.5 8.5 6.5 12 13.5 4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <label htmlFor={`${id}-consent`} className="text-[0.9375rem] leading-normal">
          Souhlasím se zpracováním e-mailu kvůli zasílání přehledu. Podrobnosti
          jsou v{" "}
          <a href="/ochrana-udaju" className="font-semibold text-ink underline underline-offset-2">
            zásadách ochrany osobních údajů
          </a>
          .
        </label>
      </div>
      {errors.consent ? (
        <FieldError id={consentErrorId}>{errors.consent}</FieldError>
      ) : null}

      {/* Pole pod sebou: souhlas patří před tlačítko, ať pořadí fokusu
          odpovídá tomu, co je potřeba udělat. V hero je tlačítko vedle pole. */}
      {withTier ? <div className="mt-6">{submitButton}</div> : null}

      <p id={helpId} className="mt-4 text-[0.9375rem] leading-normal text-mute">
        Na zadanou adresu přijde potvrzovací odkaz. Dokud na něj nekliknete,
        nic vám posílat nebudeme.
      </p>

      <div role="status" aria-live="polite" className="empty:hidden">
        {status.kind === "not_ready" ? (
          <StatusBox>
            Odběr zatím nespouštíme, web se teprve dokončuje. Adresu jsme nikam
            neuložili.
          </StatusBox>
        ) : status.kind === "success" ? (
          <StatusBox>
            Potvrzovací e-mail jsme poslali na {status.email}. Odběr začne, až
            v něm kliknete na odkaz.
          </StatusBox>
        ) : status.kind === "rate_limited" ? (
          <StatusBox tone="error">
            Z vašeho připojení přišlo za chvíli moc pokusů. Zkuste to za pár
            minut znovu.
          </StatusBox>
        ) : status.kind === "network_error" ? (
          <StatusBox tone="error">
            Spojení se serverem se nepovedlo. Zkontrolujte připojení a zkuste to
            znovu.
          </StatusBox>
        ) : status.kind === "server_error" ? (
          <StatusBox tone="error">
            Server teď odpověděl chybou. Zkuste to za pár minut znovu.
          </StatusBox>
        ) : null}
      </div>
    </form>
  );
}

function FieldError({ id, children }: { id: string; children: string }) {
  return (
    <p
      id={id}
      className="mt-2 flex items-start gap-2 text-[0.9375rem] font-semibold leading-normal text-loss-ink"
    >
      <svg
        viewBox="0 0 16 16"
        width="16"
        height="16"
        aria-hidden="true"
        focusable="false"
        className="mt-[3px] shrink-0"
      >
        <path d="M8 1.5 15 14.5H1Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M8 6.5v3.5M8 12.2v.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {children}
    </p>
  );
}

function StatusBox({
  tone = "info",
  children,
}: {
  tone?: "info" | "error";
  children: ReactNode;
}) {
  return (
    <p
      className={`mt-5 rounded-[var(--radius-field)] border-3 px-5 py-4 text-[0.9375rem] font-semibold leading-normal ${
        tone === "error"
          ? "border-loss-ink bg-paper text-loss-ink"
          : "border-ink bg-cream text-ink"
      }`}
    >
      {children}
    </p>
  );
}
