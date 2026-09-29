"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth, getSession } from "@/lib/auth";
import { confirmSubscriptionForUser } from "@/lib/subscriptions";

export async function signOut() {
  await auth().api.signOut({ headers: await headers() });
  redirect("/");
}

/** Potvrzení odběru z účtu, pro toho, kdo se přihlásil dřív, než potvrdil. */
export async function confirmFromAccount() {
  const session = await getSession();
  if (!session) redirect("/prihlaseni");
  await confirmSubscriptionForUser(session.user.id);
  revalidatePath("/ucet");
}
