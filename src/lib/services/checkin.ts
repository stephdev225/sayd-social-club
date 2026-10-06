import { randomUUID } from "node:crypto";
import { normalizeTicketCode } from "@/lib/domain/ids";
import type { Ticket } from "@/lib/domain/types";
import type { Store } from "@/lib/data/store";

export type CheckInResult =
  | { result: "ok"; ticket: Ticket }
  | { result: "already_used"; ticket: Ticket }
  | { result: "refunded" | "cancelled"; ticket: Ticket }
  | { result: "wrong_event"; ticket: Ticket }
  | { result: "invalid" };

/**
 * Door check-in. One transaction: read the ticket, flip valid → used, log the scan.
 * A copied QR code therefore passes once; every later scan says "already used" with the time.
 */
export async function checkInTicket(
  store: Store,
  rawCode: string,
  opts: { eventId?: string; scannedBy: string; now?: Date },
): Promise<CheckInResult> {
  const code = normalizeTicketCode(rawCode);
  const now = opts.now ?? new Date();
  const log = (tx: Parameters<Parameters<Store["runTransaction"]>[0]>[0], result: string, ticketId: string | null, eventId?: string) =>
    tx.set("checkins", randomUUID(), {
      ticketId,
      eventId: eventId ?? opts.eventId ?? null,
      result,
      scannedBy: opts.scannedBy,
      scannedAt: now.toISOString(),
      raw: code ? null : rawCode.slice(0, 80),
    });

  return store.runTransaction<CheckInResult>(async (tx) => {
    const ticket = code ? await tx.get<Ticket & Record<string, unknown>>("tickets", code) : null;
    if (!ticket) {
      log(tx, "invalid", code);
      return { result: "invalid" };
    }
    if (opts.eventId && ticket.eventId !== opts.eventId) {
      log(tx, "wrong_event", ticket.id, ticket.eventId);
      return { result: "wrong_event", ticket };
    }
    if (ticket.status === "used") {
      log(tx, "already_used", ticket.id, ticket.eventId);
      return { result: "already_used", ticket };
    }
    if (ticket.status === "refunded" || ticket.status === "cancelled") {
      log(tx, ticket.status, ticket.id, ticket.eventId);
      return { result: ticket.status, ticket };
    }
    const used: Ticket = { ...ticket, status: "used", checkedInAt: now.toISOString(), checkedInBy: opts.scannedBy };
    tx.update("tickets", ticket.id, { status: "used", checkedInAt: used.checkedInAt, checkedInBy: opts.scannedBy });
    log(tx, "ok", ticket.id, ticket.eventId);
    return { result: "ok", ticket: used };
  });
}
