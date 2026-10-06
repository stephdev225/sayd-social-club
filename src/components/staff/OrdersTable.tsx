"use client";

import { useMemo, useState } from "react";

export interface OrderRow {
  id: string;
  name: string;
  email: string;
  items: string;
  quantity: number;
  total: string;
  status: string;
  date: string;
  dateIso: string;
  stripeUrl?: string;
}

export interface GuestRow {
  id: string;
  name: string;
  email: string;
  type: string;
  status: string;
  checkedInAt?: string;
}

const STATUS: Record<string, { label: string; cls: string }> = {
  paid: { label: "Payé", cls: "bg-bottle text-bottle-ink" },
  pending: { label: "En attente", cls: "bg-sable/15 text-sable" },
  expired: { label: "Expiré", cls: "bg-line text-muted" },
  cancelled: { label: "Annulé", cls: "bg-line text-muted" },
  failed: { label: "Échoué", cls: "bg-terra/15 text-terra" },
  refunded: { label: "Remboursé", cls: "bg-terra/15 text-terra" },
  valid: { label: "Valide", cls: "bg-bottle text-bottle-ink" },
  used: { label: "Entré", cls: "bg-sable/15 text-sable" },
};

function Badge({ s }: { s: string }) {
  const v = STATUS[s] ?? { label: s, cls: "bg-line text-muted" };
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${v.cls}`}>{v.label}</span>;
}

function useFilter<T>(rows: T[], text: (r: T) => string, status: (r: T) => string) {
  const [q, setQ] = useState("");
  const [s, setS] = useState("all");
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => (s === "all" || status(r) === s) && (!needle || text(r).toLowerCase().includes(needle)));
  }, [rows, q, s, text, status]);
  return { q, setQ, s, setS, filtered };
}

const inputCls = "min-h-10 rounded-md border border-line bg-night px-3 text-sm text-ink placeholder:text-muted focus:border-sable focus:outline-none";

export function OrdersTable({ rows }: { rows: OrderRow[] }) {
  const { q, setQ, s, setS, filtered } = useFilter(rows, (r) => `${r.id} ${r.name} ${r.email}`, (r) => r.status);
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher nom, courriel, n° commande" aria-label="Rechercher une commande" className={`${inputCls} min-w-64 flex-1`} />
        <select value={s} onChange={(e) => setS(e.target.value)} aria-label="Filtrer par statut" className={inputCls}>
          <option value="all">Tous les statuts</option>
          <option value="paid">Payées</option>
          <option value="pending">En attente</option>
          <option value="expired">Expirées</option>
          <option value="failed">Échouées</option>
          <option value="refunded">Remboursées</option>
        </select>
      </div>
      {filtered.length === 0 ? (
        <p className="border border-dashed border-line p-8 text-center text-muted">{rows.length ? "Aucune commande ne correspond." : "Aucune commande pour l'instant. Elles apparaîtront ici dès le premier achat."}</p>
      ) : (
        <div className="overflow-x-auto border border-line">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead className="bg-night-2 text-muted">
              <tr>
                {["Commande", "Client", "Courriel", "Billets", "Qté", "Montant", "Statut", "Date", "Stripe"].map((h) => (
                  <th key={h} scope="col" className="px-3 py-2.5 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-night-2/60">
                  <td className="px-3 py-2.5 font-mono text-xs">{r.id}</td>
                  <td className="px-3 py-2.5">{r.name}</td>
                  <td className="px-3 py-2.5 text-muted">{r.email}</td>
                  <td className="px-3 py-2.5">{r.items}</td>
                  <td className="px-3 py-2.5 tabular-nums">{r.quantity}</td>
                  <td className="px-3 py-2.5 tabular-nums">{r.total}</td>
                  <td className="px-3 py-2.5"><Badge s={r.status} /></td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-muted">{r.date}</td>
                  <td className="px-3 py-2.5">{r.stripeUrl ? <a href={r.stripeUrl} target="_blank" rel="noopener noreferrer" className="text-sable underline">Voir</a> : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function GuestsTable({ rows }: { rows: GuestRow[] }) {
  const { q, setQ, s, setS, filtered } = useFilter(rows, (r) => `${r.id} ${r.name} ${r.email}`, (r) => r.status);
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un participant ou un code" aria-label="Rechercher un participant" className={`${inputCls} min-w-64 flex-1`} />
        <select value={s} onChange={(e) => setS(e.target.value)} aria-label="Filtrer par statut" className={inputCls}>
          <option value="all">Tous</option>
          <option value="valid">Pas encore entrés</option>
          <option value="used">Entrés</option>
          <option value="refunded">Remboursés</option>
        </select>
      </div>
      {filtered.length === 0 ? (
        <p className="border border-dashed border-line p-8 text-center text-muted">{rows.length ? "Aucun participant ne correspond." : "Aucun billet émis pour l'instant."}</p>
      ) : (
        <div className="overflow-x-auto border border-line">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead className="bg-night-2 text-muted">
              <tr>
                {["Nom", "Courriel", "Billet", "Code", "Statut", "Entré à"].map((h) => (
                  <th key={h} scope="col" className="px-3 py-2.5 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-night-2/60">
                  <td className="px-3 py-2.5">{r.name}</td>
                  <td className="px-3 py-2.5 text-muted">{r.email}</td>
                  <td className="px-3 py-2.5">{r.type}</td>
                  <td className="px-3 py-2.5 font-mono text-xs">{r.id}</td>
                  <td className="px-3 py-2.5"><Badge s={r.status} /></td>
                  <td className="px-3 py-2.5 text-muted">{r.checkedInAt ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
