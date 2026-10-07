import { redirect } from "next/navigation";
import { AdminShell } from "@/components/staff/AdminShell";
import { GuestsTable, OrdersTable } from "@/components/staff/OrdersTable";
import { SetupChecklist } from "@/components/staff/SetupChecklist";
import { getSession } from "@/lib/auth/session";
import { getStore } from "@/lib/data";
import { getDashboard } from "@/lib/data/admin";
import { formatMoney, priceWithTaxes } from "@/lib/domain/money";
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
    <AdminShell
      active="dashboard"
      staffName={session.name}
      extraLinks={[
        ...nav.map(([href, label]) => ({ href, label })),
        ...(event ? [{ href: `/api/admin/export?event=${event.id}`, label: "Exporter la liste (CSV)" }] : []),
      ]}
    >
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

        <SetupChecklist />

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
    </AdminShell>
  );
}
