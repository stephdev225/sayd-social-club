import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/staff/AdminShell";
import { getSession } from "@/lib/auth/session";
import { getStore } from "@/lib/data";
import { listAllEvents, listAllTicketTypes } from "@/lib/data/events-admin";
import { STATUS_LABEL } from "@/lib/admin-labels";
import { formatDate, formatTime } from "@/lib/i18n/format";

export const dynamic = "force-dynamic";


export default async function EventsAdminPage() {
  const session = await getSession();
  if (!session) redirect("/admin/connexion?next=/admin/evenements");
  if (session.role !== "admin") redirect("/scan");
  const store = getStore();
  const events = await listAllEvents(store);
  const sold = await Promise.all(
    events.map(async (e) => (await listAllTicketTypes(store, e.id)).reduce((s, t) => s + t.quantitySold, 0)),
  );
  const now = new Date().toISOString();

  return (
    <AdminShell active="events" staffName={session.name}>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="t-h1">Événements</h1>
          <p className="mt-2 text-muted">Annoncez une soirée, réglez les billets, ouvrez ou fermez la vente.</p>
        </div>
        <Link href="/admin/evenements/nouveau" className="inline-flex min-h-11 items-center rounded-full bg-sable px-6 font-semibold text-night hover:brightness-110">
          + Nouvel événement
        </Link>
      </header>

      {events.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line p-10 text-center">
          <p className="font-display text-2xl">Aucun événement</p>
          <p className="mt-2 text-muted">Créez votre première soirée : elle restera en brouillon jusqu&apos;à ce que vous la publiiez.</p>
        </div>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line">
          {events.map((e, i) => {
            const [label, cls] = STATUS_LABEL[e.status] ?? [e.status, ""];
            const past = e.endsAt < now;
            const img = e.heroImage ?? e.coverImage;
            return (
              <li key={e.id}>
                <Link href={`/admin/evenements/${encodeURIComponent(e.id)}`} className="grid grid-cols-[4rem_1fr_auto] items-center gap-4 bg-night-2 p-4 transition-colors hover:bg-night sm:grid-cols-[5rem_1fr_8rem_7rem_auto]">
                  <span className="relative block aspect-square overflow-hidden rounded-md bg-night">
                    {img && <Image src={img} alt="" fill sizes="5rem" className="object-cover" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-display text-2xl leading-tight">{e.name}</span>
                    <span className="block truncate text-sm text-muted first-letter:uppercase">
                      {formatDate(e.startsAt, "fr")}, {formatTime(e.startsAt, "fr")} · {e.venueName}
                    </span>
                  </span>
                  <span className="hidden text-sm tabular-nums text-muted sm:block">{sold[i]} billet(s) vendu(s)</span>
                  <span className="hidden sm:block">
                    <span className={`rounded-full px-2.5 py-1 text-xs ${cls}`}>{past && e.status === "published" ? "Passé" : label}</span>
                  </span>
                  <span aria-hidden className="text-muted">→</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </AdminShell>
  );
}
