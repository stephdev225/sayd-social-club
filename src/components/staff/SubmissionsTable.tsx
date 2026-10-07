"use client";

import { useMemo, useState } from "react";

export interface SubmissionRow {
  id: string;
  kind: "newsletter" | "contact" | "ambassador" | "partnership";
  who: string;
  email: string;
  phone?: string;
  detail?: string;
  message?: string;
  date: string;
}

const TABS: { key: SubmissionRow["kind"] | "all"; label: string }[] = [
  { key: "all", label: "Tout" },
  { key: "newsletter", label: "Me prévenir" },
  { key: "contact", label: "Messages" },
  { key: "partnership", label: "Partenariats" },
  { key: "ambassador", label: "Ambassadeurs" },
];

export function SubmissionsTable({ rows }: { rows: SubmissionRow[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    for (const r of rows) c[r.kind] = (c[r.kind] ?? 0) + 1;
    return c;
  }, [rows]);
  const shown = rows.filter(
    (r) => (tab === "all" || r.kind === tab) && (!q || `${r.who} ${r.email} ${r.detail ?? ""} ${r.message ?? ""}`.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div role="tablist" aria-label="Type" className="flex flex-wrap gap-1 rounded-full border border-line p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className="rounded-full px-3.5 py-1.5 text-sm text-muted transition-colors aria-selected:bg-sable aria-selected:text-night"
            >
              {t.label} <span className="tabular-nums opacity-70">{counts[t.key] ?? 0}</span>
            </button>
          ))}
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher un nom, un courriel…"
          aria-label="Rechercher"
          className="min-h-10 min-w-56 flex-1 rounded-md border border-line bg-night px-3 text-sm text-ink placeholder:text-muted focus:border-sable focus:outline-none"
        />
      </div>

      {shown.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line p-8 text-center text-muted">
          {rows.length === 0 ? "Personne pour l'instant. Les formulaires du site arrivent ici." : "Aucun résultat."}
        </p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-night-2">
          {shown.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => setOpen(open === r.id ? null : r.id)}
                aria-expanded={r.message ? open === r.id : undefined}
                className="grid w-full grid-cols-[1fr_auto] gap-x-4 gap-y-1 p-4 text-left text-sm sm:grid-cols-[9rem_1fr_1fr_8rem]"
              >
                <span className="text-xs uppercase tracking-wide text-sable">{TABS.find((t) => t.key === r.kind)?.label}</span>
                <span className="order-first font-medium sm:order-none">{r.who || "—"}</span>
                <span className="col-span-2 truncate text-muted sm:col-span-1">
                  <a href={`mailto:${r.email}`} onClick={(e) => e.stopPropagation()} className="hover:text-ink hover:underline">{r.email}</a>
                  {r.phone && <span> · {r.phone}</span>}
                </span>
                <span className="text-xs tabular-nums text-muted sm:text-right">{r.date}</span>
                {r.detail && <span className="col-span-2 text-xs text-muted sm:col-span-4">{r.detail}</span>}
              </button>
              {r.message && open === r.id && <p className="whitespace-pre-wrap border-t border-line px-4 py-4 text-sm text-ink/90">{r.message}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
