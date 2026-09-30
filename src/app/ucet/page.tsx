import { asc, eq, inArray } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountWatchlist } from "@/components/WatchlistPicker";
import { PageShell, TaskLayout, TextLink } from "@/components/PageShell";
import { Button } from "@/components/ui/Button";
import { db, schema } from "@/db";
import { showcase } from "@/data/sample";
import { getSession } from "@/lib/auth";
import { accountsReady, paymentsReady } from "@/lib/env";
import { isTier } from "@/lib/plans";
import { monogramFor, uiKind } from "@/lib/symbols";
import { getWatchlist, loadLimits } from "@/lib/watchlist";
import { confirmFromAccount, signOut } from "./actions";
import { TierCard, type TierNotice } from "./TierCard";

export const metadata: Metadata = { title: "Účet" };

const tierNotices = new Set<TierNotice>(["hotovo", "souhlas", "pozdeji"]);

function noticeFrom(value: string | string[] | undefined): TierNotice | null {
  return typeof value === "string" && tierNotices.has(value as TierNotice)
    ? (value as TierNotice)
    : null;
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!accountsReady()) {
    return (
      <PageShell>
        <TaskLayout title="Účet" lead={<p>Účty zatím nespouštíme, web se teprve dokončuje.</p>}>
          <TextLink href="/">Na hlavní stránku</TextLink>
        </TaskLayout>
      </PageShell>
    );
  }

  const session = await getSession();
  if (!session) redirect("/prihlaseni");

  const userId = session.user.id;
  const [[user], limits, entries, params] = await Promise.all([
    db()
      .select({
        email: schema.users.email,
        tier: schema.users.tier,
        requestedTier: schema.users.requestedTier,
        confirmedAt: schema.users.emailConfirmedAt,
        unsubscribedAt: schema.users.unsubscribedAt,
        status: schema.users.status,
        currentPeriodEnd: schema.users.currentPeriodEnd,
        pastDueSince: schema.users.pastDueSince,
        cancelAtPeriodEnd: schema.users.cancelAtPeriodEnd,
        stripeCustomerId: schema.users.stripeCustomerId,
      })
      .from(schema.users)
      .where(eq(schema.users.id, userId)),
    loadLimits(),
    getWatchlist(userId),
    searchParams,
  ]);
  if (!user || !isTier(user.tier)) redirect("/prihlaseni");

  // Položky z výběru, které nejsou ve vitríně, potřebují aspoň název.
  const inShowcase = new Set(showcase.map((item) => item.ticker));
  const missing = entries.map((entry) => entry.ticker).filter((ticker) => !inShowcase.has(ticker));
  const selectedInfo = missing.length
    ? (
        await db()
          .select({ ticker: schema.symbols.ticker, name: schema.symbols.name, kind: schema.symbols.kind })
          .from(schema.symbols)
          .where(inArray(schema.symbols.ticker, missing))
          .orderBy(asc(schema.symbols.ticker))
      ).map((row) => ({
        ticker: row.ticker,
        name: row.name,
        kind: uiKind(row.kind),
        monogram: monogramFor(row.ticker),
      }))
    : [];

  const requested =
    isTier(user.requestedTier) && user.requestedTier !== user.tier ? user.requestedTier : null;
  const confirmed = Boolean(user.confirmedAt && !user.unsubscribedAt);
  const paymentsLive = paymentsReady();

  return (
    <PageShell>
      <div className="grid gap-8 md:grid-cols-12 md:items-end">
        <div className="md:col-span-7">
          <h1 className="text-[clamp(2.5rem,5.5vw,4.25rem)] font-bold leading-[1.02] tracking-[-0.03em]">
            Váš účet
          </h1>
          <p className="lead mt-6 break-words">{user.email}</p>
        </div>
        <form action={signOut} className="md:col-span-5 md:justify-self-end">
          <Button type="submit" variant="secondary" arrow={false}>
            Odhlásit se
          </Button>
        </form>
      </div>

      {/* Karty už nesou tlačítka a formuláře, definiční seznam by je nesměl obsahovat. */}
      <div className="mt-12 grid gap-6 md:grid-cols-2 md:items-start">
        <div className="rounded-[var(--radius-card)] border-3 border-ink bg-paper p-6 shadow-[var(--shadow-hard-md)] md:p-7">
          <h2 className="font-display text-[0.9375rem] font-bold text-ink">Odběr</h2>
          <div className="mt-3">
            {confirmed ? (
              <p className="text-lg leading-relaxed">
                Potvrzený. Přehledy zatím neposíláme, první dostanete po spuštění webu.
              </p>
            ) : user.unsubscribedAt ? (
              <p className="text-lg leading-relaxed">
                Odhlášený. Pokud chcete přehledy znovu, zadejte adresu do{" "}
                <Link href="/#objednat" className="font-semibold underline underline-offset-2">
                  formuláře
                </Link>
                .
              </p>
            ) : (
              <>
                <p className="text-lg leading-relaxed">
                  Nepotvrzený. Dokud odběr nepotvrdíte, nic vám posílat nebudeme.
                </p>
                <form action={confirmFromAccount} className="mt-5">
                  <Button type="submit">Potvrdit odběr</Button>
                </form>
              </>
            )}
          </div>
        </div>

        <TierCard
          tier={user.tier}
          billing={{
            status: user.status,
            pastDueSince: user.pastDueSince,
            currentPeriodEnd: user.currentPeriodEnd,
            cancelAtPeriodEnd: user.cancelAtPeriodEnd,
          }}
          requested={requested}
          hasCustomer={Boolean(user.stripeCustomerId)}
          paymentsLive={paymentsLive}
          notice={noticeFrom(params.platba)}
        />
      </div>

      <section aria-labelledby="vyber-title" className="mt-16">
        <h2 id="vyber-title" className="h2">
          Můj výběr
        </h2>
        <div className="mt-8">
          <AccountWatchlist
            items={showcase}
            selectedInfo={selectedInfo}
            tier={user.tier}
            limits={limits}
            initial={entries}
            paymentsLive={paymentsLive}
          />
        </div>
      </section>
    </PageShell>
  );
}
