import { redirect } from "next/navigation";
import { AdminShell } from "@/components/staff/AdminShell";
import { SubmissionsTable } from "@/components/staff/SubmissionsTable";
import { getSession } from "@/lib/auth/session";
import { getStore } from "@/lib/data";
import { listSubmissions } from "@/lib/data/submissions";

export const dynamic = "force-dynamic";

// A file download (route handler), not a page.
const EXPORT_URL = "/api/admin/abonnes";

function fmt(iso: string) {
  return new Intl.DateTimeFormat("fr-CA", { timeZone: "America/Toronto", dateStyle: "medium" }).format(new Date(iso));
}

export default async function ContactsPage() {
  const session = await getSession();
  if (!session) redirect("/admin/connexion?next=/admin/contacts");
  if (session.role !== "admin") redirect("/scan");
  const rows = await listSubmissions(getStore());
  const subscribers = rows.filter((r) => r.kind === "newsletter").length;

  return (
    <AdminShell active="contacts" staffName={session.name}>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="t-h1">Contacts</h1>
          <p className="mt-2 max-w-xl text-muted">
            Les personnes qui ont rempli un formulaire du site. <strong className="text-ink">{subscribers}</strong> veulent être prévenues de la prochaine soirée.
          </p>
        </div>
        {subscribers > 0 && (
          <a href={EXPORT_URL} download className="inline-flex min-h-11 items-center rounded-full border border-line px-5 text-sm hover:border-sable">
            Télécharger la liste « Me prévenir » (CSV)
          </a>
        )}
      </header>
      <SubmissionsTable
        rows={rows.map((r) => ({
          id: r.id,
          kind: r.kind,
          who: r.name ?? r.firstName ?? "",
          email: r.email,
          phone: r.phone,
          detail:
            r.kind === "partnership"
              ? [r.company, r.type].filter(Boolean).join(" · ")
              : r.kind === "contact"
                ? r.subject
                : r.kind === "ambassador"
                  ? r.instagram && `Instagram : ${r.instagram}`
                  : r.source && `Inscrit depuis : ${r.source}`,
          message: r.message,
          date: fmt(r.createdAt),
        }))}
      />
    </AdminShell>
  );
}
