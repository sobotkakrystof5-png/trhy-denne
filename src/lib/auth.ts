import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { magicLink } from "better-auth/plugins/magic-link";
import { headers } from "next/headers";
import { db, schema } from "@/db";
import { LOGIN_LINK_MINUTES, sendLoginEmail } from "@/lib/email";
import { env, siteUrl } from "@/lib/env";
import { site } from "@/lib/site";

function createAuth() {
  const secret = env().BETTER_AUTH_SECRET;
  if (!secret) throw new Error("BETTER_AUTH_SECRET není nastavená.");

  return betterAuth({
    appName: site.name,
    baseURL: siteUrl(),
    basePath: "/api/auth",
    secret,
    database: drizzleAdapter(db(), {
      provider: "pg",
      schema: {
        users: schema.users,
        sessions: schema.sessions,
        accounts: schema.accounts,
        verifications: schema.verifications,
      },
    }),
    user: { modelName: "users" },
    session: {
      modelName: "sessions",
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24,
    },
    account: { modelName: "accounts" },
    verification: { modelName: "verifications" },
    // Jediný způsob přihlášení je odkaz v e-mailu. Žádná hesla.
    emailAndPassword: { enabled: false },
    advanced: {
      database: { generateId: "uuid" },
      cookiePrefix: "td",
      // IP adresu k relaci neukládáme, nepotřebujeme ji.
      ipAddress: { disableIpTracking: true },
    },
    telemetry: { enabled: false },
    plugins: [
      magicLink({
        // Účet vzniká jen odběrem se souhlasem, ne přihlášením.
        disableSignUp: true,
        storeToken: "hashed",
        expiresIn: LOGIN_LINK_MINUTES * 60,
        // Odkaz nevede přímo na ověření, ale na stránku s tlačítkem.
        // Bezpečnostní skenery pošty odkazy otevírají a jednorázový
        // token by spotřebovaly dřív než člověk.
        sendMagicLink: async ({ email, token }) => {
          const url = new URL("/prihlaseni/overit", siteUrl());
          url.searchParams.set("token", token);
          await sendLoginEmail(email, url.toString());
        },
      }),
      // Musí být poslední: propisuje cookies z volání na serveru.
      nextCookies(),
    ],
  });
}

let instance: ReturnType<typeof createAuth> | null = null;

export function auth() {
  instance ??= createAuth();
  return instance;
}

/** Přihlášený uživatel, nebo null. Jen na serveru. */
export async function getSession() {
  return auth().api.getSession({ headers: await headers() });
}
