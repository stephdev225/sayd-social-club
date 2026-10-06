import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TicketCard } from "@/components/TicketCard";
import { getStore } from "@/lib/data";
import { normalizeTicketCode } from "@/lib/domain/ids";
import type { SaydEvent, Ticket } from "@/lib/domain/types";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { formatDate, formatTime } from "@/lib/i18n/format";
import { ticketQrSvg } from "@/lib/qr";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false }, referrer: "no-referrer" };

/** Personal ticket page linked from the confirmation email. The code itself is the secret. */
export default async function TicketPage({ params }: PageProps<"/[lang]/billet/[code]">) {
  const { lang, code: raw } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const code = normalizeTicketCode(decodeURIComponent(raw));
  const store = getStore();
  const ticket = code ? await store.get<Ticket & Record<string, unknown>>("tickets", code) : null;
  if (!ticket) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 sm:px-6">
        <h1 className="t-h1">{dict.ticketPage.notFound}</h1>
      </div>
    );
  }
  const event = await store.get<SaydEvent & Record<string, unknown>>("events", ticket.eventId);
  const qr = await ticketQrSvg(ticket.id);
  const statusLabel = dict.ticketPage[ticket.status];

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      {event && (
        <>
          <h1 className="t-h1">{event.name}</h1>
          <p className="mt-3 text-muted first-letter:uppercase">
            {formatDate(event.startsAt, lang)}, {formatTime(event.startsAt, lang)} — {event.venueName}
          </p>
        </>
      )}
      <p className={`mt-6 font-semibold ${ticket.status === "valid" ? "text-bottle-ink" : "text-terra"}`}>{statusLabel}</p>
      <div className="mt-4">
        <TicketCard ticket={ticket} qrSvg={qr} labels={{ holder: dict.confirmation.holder, ticket: dict.confirmation.ticket }} />
      </div>
      <p className="mt-5 text-sm text-muted">{dict.confirmation.ticketHint}</p>
    </div>
  );
}
