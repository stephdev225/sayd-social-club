import { requireRole } from "@/lib/auth/session";
import { getStore } from "@/lib/data";
import { listSubmissions } from "@/lib/data/submissions";

function csvCell(v: unknown): string {
  let s = String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // neutralise spreadsheet formula injection
  return `"${s.replace(/"/g, '""')}"`;
}

/** People who asked to be told about the next party, as CSV (for Brevo or any mailing tool). Admin only. */
export async function GET() {
  if (!(await requireRole("admin"))) return new Response("Unauthorized", { status: 401 });
  const rows = (await listSubmissions(getStore())).filter((s) => s.kind === "newsletter");
  const csv =
    "﻿" +
    [["Courriel", "Prénom", "Langue", "Source", "Inscrit le"], ...rows.map((r) => [r.email, r.firstName ?? "", r.locale, r.source ?? "", r.createdAt])]
      .map((r) => r.map(csvCell).join(","))
      .join("\r\n");
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="sayd-liste-prochain-event-${new Date().toISOString().slice(0, 10)}.csv"`,
      "cache-control": "no-store",
    },
  });
}
