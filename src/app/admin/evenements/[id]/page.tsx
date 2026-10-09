import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminShell } from "@/components/staff/AdminShell";
import { EventForm } from "@/components/staff/EventForm";
import { TicketTypesPanel } from "@/components/staff/TicketTypesPanel";
import { STATUS_LABEL } from "@/lib/admin-labels";
import { getSession } from "@/lib/auth/session";
import { canSellOnline } from "@/lib/checkout-availability";
import { getStore } from "@/lib/data";
import { lineupToText, listAllTicketTypes } from "@/lib/data/events-admin";
import { availableQuantity } from "@/lib/domain/inventory";
import { formatMoney, priceWithTaxes } from "@/lib/domain/money";
import type { SaydEvent } from "@/lib/domain/types";
import { isoToLocal } from "@/lib/time";
import { saveEventAction, saveTicketTypeAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditEventPage({ params, searchParams }: PageProps<"/admin/evenements/[id]">) {
  const session = await getSession();
  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId);
  if (!session) redirect(`/admin/connexion?next=/admin/evenements/${encodeURIComponent(id)}`);
  if (session.role !== "admin") redirect("/scan");
  const store = getStore();
  const event = await store.get<SaydEvent & Record<string, unknown>>("events", id);
  if (!event) notFound();
  const types = await listAllTicketTypes(store, id);
  const sp = await searchParams;
  const created = typeof sp.cree === "string";
  const saved = typeof sp.enregistre === "string";
  const start = isoToLocal(event.startsAt);
  const end = isoToLocal(event.endsAt);
  const [statusLabel, statusCls] = STATUS_LABEL[event.status] ?? [event.status, ""];
  const online = canSellOnline();
  const sellsSomewhere = online || Boolean(event.externalTicketUrl);

  return (
    <AdminShell active="events" staffName={session.name}>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/admin/evenements" className="text-sm text-muted hover:text-ink">← Événements</Link>
          <h1 className="t-h1 mt-2">{event.name}</h1>
          <p className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <span className={`rounded-full px-2.5 py-1 text-xs ${statusCls}`}>{statusLabel}</span>
            {event.status === "published" && (
              <a href={`/fr/evenements/${event.slug}`} target="_blank" rel="noopener" className="text-muted underline hover:text-ink">
                Voir la page publique →
              </a>
            )}
            <Link href={`/admin?event=${encodeURIComponent(event.id)}`} className="text-muted underline hover:text-ink">Ventes et participants</Link>
          </p>
        </div>
      </header>

      {saved && (
        <p role="status" className="border-l-2 border-sable bg-sable/10 p-4 text-sm">
          Événement enregistré. {event.status === "published" ? "Le site public est à jour." : "Il n'est pas visible sur le site tant que le statut n'est pas « Publié »."}
        </p>
      )}
      {created && event.status === "draft" && (
        <p role="status" className="border-l-2 border-sable bg-sable/10 p-4 text-sm">
          Événement créé en brouillon. Ajoutez les billets ci-dessous, puis passez le statut à « Publié » pour l&apos;annoncer.
        </p>
      )}
      {event.status === "published" && types.filter((t) => t.active).length === 0 && (
        <p className="border-l-2 border-terra bg-terra/10 p-4 text-sm">Publié sans billet actif : la page s&apos;affiche mais personne ne peut acheter.</p>
      )}
      {event.status === "published" && !sellsSomewhere && (
        <p className="border-l-2 border-terra bg-terra/10 p-4 text-sm">
          La vente en ligne du site est fermée (Stripe ou base de données non configurés) et aucun lien de billetterie externe n&apos;est renseigné.
        </p>
      )}

      <section aria-labelledby="t-billets" className="space-y-4">
        <div>
          <h2 id="t-billets" className="font-display text-3xl">Billets</h2>
          <p className="text-sm text-muted">Prix affichés taxes incluses, comme les clients les paient.</p>
        </div>
        <TicketTypesPanel
          createAction={saveTicketTypeAction.bind(null, event.id, null)}
          rows={types.map((t) => {
            const allIn = priceWithTaxes(t.priceCents);
            return {
              id: t.id,
              allInLabel: formatMoney(allIn, "fr"),
              sold: t.quantitySold,
              reserved: t.quantityReserved,
              available: availableQuantity(t),
              action: saveTicketTypeAction.bind(null, event.id, t.id),
              values: {
                nameFr: t.name.fr,
                nameEn: t.name.en,
                descriptionFr: t.description.fr,
                descriptionEn: t.description.en,
                allInPrice: (allIn / 100).toFixed(2).replace(".", ","),
                quantityTotal: t.quantityTotal,
                maxPerOrder: t.maxPerOrder,
                sortOrder: t.sortOrder,
                online: (t.channels ?? ["online"]).includes("online"),
                door: (t.channels ?? []).includes("door"),
                active: t.active,
              },
            };
          })}
        />
      </section>

      {/* key: remount with the saved values after each save (React resets forms after an action) */}
      <EventForm
        key={String(event.updatedAt ?? "")}
        isNew={false}
        action={saveEventAction.bind(null, event.id)}
        values={{
          name: event.name,
          slug: event.slug,
          editionFr: event.edition?.fr ?? "",
          editionEn: event.edition?.en ?? "",
          taglineFr: event.tagline.fr,
          taglineEn: event.tagline.en,
          descriptionFr: event.description.fr,
          descriptionEn: event.description.en,
          dressCodeFr: event.dressCode?.fr ?? "",
          dressCodeEn: event.dressCode?.en ?? "",
          date: start.date,
          startTime: start.time,
          endTime: end.time,
          venueName: event.venueName,
          address: event.address,
          city: event.city,
          capacity: event.capacity,
          status: event.status,
          lineup: lineupToText(event),
          partners: event.partners.join(", "),
          heroImage: event.heroImage ?? "",
          coverImage: event.coverImage ?? "",
          externalTicketUrl: event.externalTicketUrl ?? "",
        }}
      />
    </AdminShell>
  );
}
