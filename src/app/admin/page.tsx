import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { GuestsTable, OrdersTable } from "@/components/staff/OrdersTable";
import { getSession } from "@/lib/auth/session";
import { canSellOnline } from "@/lib/checkout-availability";
import { getStore, usingMemoryStore } from "@/lib/data";
import { getDashboard } from "@/lib/data/admin";
import { formatMoney, priceWithTaxes } from "@/lib/domain/money";
import { isStripeConfigured } from "@/lib/env";
import { formatDate, formatTime } from "@/lib/i18n/format";

export const dynamic = "force-dynamic";

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="border border-line bg-night-2 p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 font-display text-4xl leading-none tabular-nums">{value}</p>
      {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
    </div>
  );
}

function fmt(iso: string) {
  return new Intl.DateTimeFormat("fr-CA", { timeZone: "America/Toronto", dateStyle: "short", timeStyle: "short" }).format(new Date(iso));
}

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  const session = await getSession();
  if (!session) redirect("/admin/connexion");
  if (session.role !== "admin") redirect("/scan");
  const sp = await searchParams;
  const data = await getDashboard(getStore(), typeof sp.event === "string" ? sp.event : undefined);
  const { event, stats } = data;
  const stripeTest = !process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_");
  const fillRate = stats.capacity ? Math.round((stats.ticketsSold / stats.capacity) * 100) : 0;

  const nav = [
    ["#apercu", "Vue d'ensemble"],
    ["#billets", "Billets"],
    ["#commandes", "Commandes"],
    ["#participants", "Participants"],
  ];

  return (
    <div className="lg:grid lg:min-h-svh lg:grid-cols-[15rem_1fr]">
      <aside className="border-b border-line bg-night-2 p-5 lg:sticky lg:top-0 lg:h-svh lg:border-b-0 lg:border-r">
        <Image src="/brand/logo-ivory.png" alt="Sayd Social Club" width={319} height={134} className="h-9 w-auto" />
        <nav aria-label="Admin" className="mt-8 flex gap-4 overflow-x-auto text-sm lg:flex-col lg:gap-1">
          {nav.map(([href, label]) => (
            <a key={href} href={href} className="whitespace-nowrap rounded px-2 py-1.5 text-muted hover:bg-night hover:text-ink">{label}</a>
          ))}
          <Link href="/scan" className="whitespace-nowrap rounded px-2 py-1.5 text-sable hover:bg-night">Scanner à la porte →</Link>
          {event && (
            <a href={`/api/admin/export?event=${event.id}`} className="whitespace-nowrap rounded px-2 py-1.5 text-muted hover:bg-night hover:text-ink">Exporter la liste (CSV)</a>
          )}
        </nav>
        <form action="/api/staff/logout" method="post" className="mt-6 lg:absolute lg:bottom-5">
          <p className="text-xs text-muted">Connecté : {session.name}</p>
          <button className="mt-1 text-sm text-muted underline hover:text-ink">Se déconnecter</button>
        </form>
      </aside>

      <main className="space-y-14 p-5 sm:p-8 lg:p-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted">Événement</p>
            <h1 className="t-h1">{event?.name ?? "Aucun événement"}</h1>
            {event && (
              <p className="mt-2 text-muted first-letter:uppercase">
                {formatDate(event.startsAt, "fr")}, {formatTime(event.startsAt, "fr")} — {event.venueName}
              </p>
            )}
          </div>
          {data.events.length > 1 && (
            <form className="flex gap-2">
              <select name="event" defaultValue={event?.id} aria-label="Choisir l'événement" className="min-h-10 rounded-md border border-line bg-night px-3 text-sm">
                {data.events.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
              <button className="rounded-md border border-line px-3 text-sm">Afficher</button>
            </form>
          )}
        </header>

        {(usingMemoryStore() || !isStripeConfigured() || stripeTest) && (
          <div className="border-l-2 border-sable bg-sable/10 p-4 text-sm">
            <p className="font-semibold text-sable">Configuration</p>
            <ul className="mt-1 space-y-0.5 text-ink/90">
              <li>Base de données : {usingMemoryStore() ? "⚠️ mémoire temporaire (Firebase non branché)" : "Firestore ✓"}</li>
              <li>Stripe : {isStripeConfigured() ? (stripeTest ? "mode Test ✓" : "mode LIVE") : "⚠️ clé ou webhook manquant"}</li>
              <li>Vente en ligne : {canSellOnline() ? "ouverte ✓" : "fermée"}</li>
            </ul>
          </div>
        )}

        <section id="apercu" aria-labelledby="t-apercu" className="scroll-mt-6">
          <h2 id="t-apercu" className="sr-only">Vue d&apos;ensemble</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Revenus (taxes incluses)" value={formatMoney(stats.revenueCents, "fr")} hint={`dont taxes ${formatMoney(stats.taxCents, "fr")}`} />
            <Stat label="Billets vendus" value={String(stats.ticketsSold)} hint={`${fillRate} % de la capacité (${stats.capacity})`} />
            <Stat label="Billets disponibles" value={String(stats.ticketsAvailable)} hint={`${stats.pendingOrders} commande(s) en cours de paiement`} />
            <Stat label="Entrés à la porte" value={`${stats.checkedIn} / ${stats.ticketsSold}`} hint={`${stats.paidOrders} commande(s) payée(s)`} />
          </div>
        </section>

        <section id="billets" aria-labelledby="t-billets" className="scroll-mt-6">
          <h2 id="t-billets" className="t-h3 mb-4">Billets</h2>
          <div className="overflow-x-auto border border-line">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="bg-night-2 text-muted">
                <tr>{["Type", "Canal", "Prix (taxes incl.)", "Stock", "Vendus", "En cours", "Disponibles", "Statut"].map((h) => <th key={h} scope="col" className="px-3 py-2.5 font-medium">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.types.map((t) => (
                  <tr key={t.id}>
                    <td className="px-3 py-2.5">{t.name.fr}</td>
                    <td className="px-3 py-2.5 text-muted">{(t.channels ?? ["online"]).map((c) => (c === "online" ? "En ligne" : "Porte")).join(", ")}</td>
                    <td className="px-3 py-2.5 tabular-nums">{formatMoney(priceWithTaxes(t.priceCents), "fr")}</td>
                    <td className="px-3 py-2.5 tabular-nums">{t.quantityTotal}</td>
                    <td className="px-3 py-2.5 tabular-nums">{t.quantitySold}</td>
                    <td className="px-3 py-2.5 tabular-nums">{t.quantityReserved}</td>
                    <td className="px-3 py-2.5 tabular-nums">{t.available}</td>
                    <td className="px-3 py-2.5">{t.active ? "Actif" : "Inactif"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="commandes" aria-labelledby="t-commandes" className="scroll-mt-6">
          <h2 id="t-commandes" className="t-h3 mb-4">Commandes</h2>
          <OrdersTable
            rows={data.orders.map((o) => ({
              id: o.id,
              name: o.customerName,
              email: o.customerEmail,
              items: o.items.map((i) => `${i.quantity} × ${i.name}`).join(", "),
              quantity: o.items.reduce((s, i) => s + i.quantity, 0),
              total: formatMoney(o.totalCents, "fr"),
              status: o.status,
              date: fmt(o.createdAt),
              dateIso: o.createdAt,
              stripeUrl: o.stripePaymentIntentId
                ? `https://dashboard.stripe.com/${stripeTest ? "test/" : ""}payments/${o.stripePaymentIntentId}`
                : undefined,
            }))}
          />
        </section>

        <section id="participants" aria-labelledby="t-participants" className="scroll-mt-6">
          <h2 id="t-participants" className="t-h3 mb-4">Participants</h2>
          <GuestsTable
            rows={data.tickets.map((t) => ({
              id: t.id,
              name: t.holderName,
              email: data.orders.find((o) => o.id === t.orderId)?.customerEmail ?? "",
              type: t.ticketTypeName,
              status: t.status,
              checkedInAt: t.checkedInAt ? `${fmt(t.checkedInAt)}${t.checkedInBy ? ` (${t.checkedInBy})` : ""}` : undefined,
            }))}
          />
        </section>
      </main>
    </div>
  );
}
