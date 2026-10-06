import { requireRole } from "@/lib/auth/session";
import { getStore } from "@/lib/data";
import { getDashboard } from "@/lib/data/admin";

function csvCell(v: unknown): string {
  let s = String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // neutralise spreadsheet formula injection
  return `"${s.replace(/"/g, '""')}"`;
}

/** Guest list as CSV (backup for the door if the network fails). Admin only. */
export async function GET(request: Request) {
  if (!(await requireRole("admin"))) return new Response("Unauthorized", { status: 401 });
  const eventId = new URL(request.url).searchParams.get("event") ?? undefined;
  const data = await getDashboard(getStore(), eventId);
  const byOrder = new Map(data.orders.map((o) => [o.id, o]));
  const rows = [
    ["Billet", "Nom", "Courriel", "Type", "Statut", "Entré à", "Commande", "Payé le"],
    ...data.tickets.map((t) => {
      const o = byOrder.get(t.orderId);
      return [t.id, t.holderName, o?.customerEmail ?? "", t.ticketTypeName, t.status, t.checkedInAt ?? "", t.orderId, o?.paidAt ?? ""];
    }),
  ];
  const csv = "﻿" + rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="participants-${data.event?.slug ?? "sayd"}.csv"`,
      "cache-control": "no-store",
    },
  });
}
