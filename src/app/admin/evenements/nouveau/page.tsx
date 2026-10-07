import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/staff/AdminShell";
import { EventForm } from "@/components/staff/EventForm";
import { getSession } from "@/lib/auth/session";
import { saveEventAction } from "../actions";

export default async function NewEventPage() {
  const session = await getSession();
  if (!session) redirect("/admin/connexion?next=/admin/evenements/nouveau");
  if (session.role !== "admin") redirect("/scan");

  return (
    <AdminShell active="events" staffName={session.name}>
      <header>
        <Link href="/admin/evenements" className="text-sm text-muted hover:text-ink">← Événements</Link>
        <h1 className="t-h1 mt-2">Nouvel événement</h1>
        <p className="mt-2 max-w-xl text-muted">Remplissez l&apos;essentiel, enregistrez, puis ajoutez les billets. Rien n&apos;apparaît sur le site avant le statut « Publié ».</p>
        <p className="mt-2 max-w-xl text-sm text-muted">Soirée passée à ajouter ? Mettez sa vraie date, une photo dans « Visuel principal » et le statut « Publié » : elle s&apos;affiche dans « Événements précédents », sans billets.</p>
      </header>
      <EventForm
        isNew
        action={saveEventAction.bind(null, null)}
        values={{
          name: "",
          slug: "",
          editionFr: "",
          editionEn: "",
          taglineFr: "",
          taglineEn: "",
          descriptionFr: "",
          descriptionEn: "",
          dressCodeFr: "",
          dressCodeEn: "",
          date: "",
          startTime: "22:00",
          endTime: "03:00",
          venueName: "",
          address: "",
          city: "Québec",
          capacity: 250,
          status: "draft",
          lineup: "",
          partners: "Sayd Social Club",
          heroImage: "",
          coverImage: "",
          externalTicketUrl: "",
        }}
      />
    </AdminShell>
  );
}
