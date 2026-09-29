"use client";

import { useActionState, useId } from "react";
import { Button } from "@/components/ui/Button";
import { EMAIL_MAX_LENGTH } from "@/lib/signup";
import { requestLoginLink, type LoginState } from "./actions";

/** Formulář odkazu pro přihlášení. Bez JavaScriptu se odešle jako běžný formulář. */
export function LoginForm({ minutes }: { minutes: number }) {
  const id = useId();
  const [state, action, pending] = useActionState<LoginState, FormData>(requestLoginLink, {
    kind: "idle",
  });

  const errorId = `${id}-error`;
  const invalid = state.kind === "invalid";

  if (state.kind === "sent") {
    return (
      <div role="status">
        <p className="font-display text-2xl font-bold leading-tight text-ink">Zkontrolujte e-mail</p>
        <p className="mt-4 text-lg leading-relaxed">
          Pokud k adrese {state.email} patří účet, poslali jsme na ni odkaz pro
          přihlášení. Platí {minutes} minut.
        </p>
        <p className="mt-4 text-[0.9375rem] leading-normal text-mute">
          Nic nepřišlo? Podívejte se do spamu. Odkaz chodí jen na adresy, které
          se přihlásily k odběru.
        </p>
      </div>
    );
  }

  return (
    <form action={action} noValidate>
      <label htmlFor={`${id}-email`} className="mb-2 block font-display text-[0.9375rem] font-bold text-ink">
        Váš e-mail
      </label>
      <input
        id={`${id}-email`}
        type="email"
        name="email"
        inputMode="email"
        autoComplete="email"
        spellCheck={false}
        required
        maxLength={EMAIL_MAX_LENGTH}
        placeholder="jmeno@firma.cz"
        defaultValue={invalid ? state.email : ""}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? errorId : undefined}
        className="h-14 w-full rounded-[var(--radius-field)] border-3 border-ink bg-cream px-5 text-lg text-ink placeholder:text-mute focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink aria-[invalid=true]:border-loss-ink"
      />
      {invalid ? (
        <p id={errorId} className="mt-2 text-[0.9375rem] font-semibold leading-normal text-loss-ink">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="mt-6 w-full">
        {pending ? "Odesílám" : "Poslat odkaz"}
      </Button>

      <div role="status" aria-live="polite" className="empty:hidden">
        {state.kind === "rate_limited" ? (
          <Problem>Pokusů bylo za chvíli moc. Zkuste to za pár minut znovu.</Problem>
        ) : state.kind === "not_ready" ? (
          <Problem>Přihlášení zatím nespouštíme, web se teprve dokončuje.</Problem>
        ) : state.kind === "error" ? (
          <Problem>Server teď odpověděl chybou. Zkuste to za pár minut znovu.</Problem>
        ) : null}
      </div>
    </form>
  );
}

function Problem({ children }: { children: string }) {
  return (
    <p className="mt-5 rounded-[var(--radius-field)] border-3 border-loss-ink bg-paper px-5 py-4 text-[0.9375rem] font-semibold leading-normal text-loss-ink">
      {children}
    </p>
  );
}
