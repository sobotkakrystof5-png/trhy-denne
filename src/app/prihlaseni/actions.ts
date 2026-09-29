"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { after } from "next/server";
import { db, schema } from "@/db";
import { auth } from "@/lib/auth";
import { accountsReady } from "@/lib/env";
import { clientIp, hit, limits } from "@/lib/rate-limit";
import { EMAIL_MAX_LENGTH, EMAIL_PATTERN, signupMessages } from "@/lib/signup";

export type LoginState =
  | { kind: "idle" }
  | { kind: "sent"; email: string }
  | { kind: "invalid"; message: string; email: string }
  | { kind: "rate_limited" }
  | { kind: "not_ready" }
  | { kind: "error" };

/**
 * Žádost o odkaz pro přihlášení. Odpověď je vždy stejná, ať účet
 * existuje, nebo ne, a e-mail se posílá až po odeslání odpovědi (after).
 * Podle obsahu ani podle doby odpovědi tak nejde zjistit, kdo má účet.
 *
 * Better Auth by odkaz poslal i na cizí adresu (disableSignUp se hlídá
 * až při ověření), proto se existence účtu kontroluje tady.
 */
export async function requestLoginLink(_: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "").trim();
  if (!email) return { kind: "invalid", message: signupMessages.emailMissing, email };
  if (email.length > EMAIL_MAX_LENGTH || !EMAIL_PATTERN.test(email)) {
    return { kind: "invalid", message: signupMessages.emailInvalid, email };
  }
  if (!accountsReady()) return { kind: "not_ready" };

  const requestHeaders = await headers();
  const limit = await hit(limits.loginIp, clientIp(requestHeaders) ?? "unknown");
  if (!limit.ok) return { kind: "rate_limited" };

  const normalized = email.toLowerCase();
  after(async () => {
    try {
      const [user] = await db()
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(eq(schema.users.email, normalized));
      if (!user) return;
      const perAddress = await hit(limits.emailPerAddress, normalized);
      if (!perAddress.ok) return;
      await auth().api.signInMagicLink({
        body: { email: normalized, callbackURL: "/ucet" },
        headers: requestHeaders,
      });
    } catch (error) {
      console.error("[login-link]", error);
    }
  });

  return { kind: "sent", email };
}
