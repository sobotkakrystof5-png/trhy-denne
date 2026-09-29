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
import { accountsReady } from "@/lib/env";
import { isTier, plans } from "@/lib/plans";
import { monogramFor, uiKind } from "@/lib/symbols";
import { getWatchlist, loadLimits } from "@/lib/watchlist";
import { confirmFromAccount, signOut } from "./actions";

export const metadata: Metadata = { title: "Účet" };

export default async function AccountPage() {
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
  const [[user], limits, entries] = await Promise.all([
    db()
      .select({
        email: schema.users.email,
        tier: schema.users.tier,
        requestedTier: schema.users.requestedTier,
        confirmedAt: schema.users.emailConfirmedAt,
        unsubscribedAt: schema.users.unsubscribedAt,
      })
      .from(schema.users)
      .where(eq(schema.users.id, userId)),
    loadLimits(),
    getWatchlist(userId),
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

  const tier = plans[user.tier];
  const requested = isTier(user.requestedTier) && user.requestedTier !== user.tier ? plans[user.requestedTier] : null;
  const confirmed = Boolean(user.confirmedAt && !user.unsubscribedAt);

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

      <dl className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="rounded-[var(--radius-card)] border-3 border-ink bg-paper p-6 shadow-[var(--shadow-hard-md)] md:p-7">
          <dt className="font-display text-[0.9375rem] font-bold text-ink">Odběr</dt>
          <dd className="mt-3">
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
          </dd>
        </div>

        <div className="rounded-[var(--radius-card)] border-3 border-ink bg-paper p-6 shadow-[var(--shadow-hard-md)] md:p-7">
          <dt className="font-display text-[0.9375rem] font-bold text-ink">Tarif</dt>
          <dd className="mt-3">
            <p className="text-lg leading-relaxed">
              {tier.name}
              {tier.priceCzk > 0 ? `, ${tier.priceCzk} Kč měsíčně` : ", zdarma"}.
              {requested ? ` Máte zájem o ${requested.name}.` : ""}
            </p>
            <p className="mt-2 text-[0.9375rem] leading-normal text-mute">
              Placené tarify zatím nespouštíme. Až je spustíme, přejdete na ně tady.
            </p>
          </dd>
        </div>
      </dl>

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
          />
        </div>
      </section>
    </PageShell>
  );
}
