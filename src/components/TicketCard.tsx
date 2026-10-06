import type { Ticket } from "@/lib/domain/types";

/** A ticket with its QR code. The SVG comes from our own server-side generator (lib/qr.ts). */
export function TicketCard({ ticket, qrSvg, labels }: { ticket: Ticket; qrSvg: string; labels: { holder: string; ticket: string } }) {
  return (
    <div className="flex flex-col items-center gap-4 bg-ink p-6 text-night sm:flex-row sm:items-center sm:gap-6">
      <div className="w-52 max-w-full shrink-0 bg-white" dangerouslySetInnerHTML={{ __html: qrSvg }} aria-label={ticket.id} role="img" />
      <dl className="text-center sm:text-left">
        <dt className="text-sm text-night/60">{labels.ticket}</dt>
        <dd className="font-mono text-lg font-semibold tracking-wide">{ticket.id}</dd>
        <dd className="mt-1">{ticket.ticketTypeName}</dd>
        <dt className="mt-3 text-sm text-night/60">{labels.holder}</dt>
        <dd>{ticket.holderName}</dd>
      </dl>
    </div>
  );
}
