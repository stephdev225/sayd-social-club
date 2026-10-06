import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmationWatcher } from "@/components/ConfirmationWatcher";
import { TicketCard } from "@/components/TicketCard";
import { getStore } from "@/lib/data";
import { getOrderView } from "@/lib/data/orders";
import { formatMoney } from "@/lib/domain/money";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { t } from "@/lib/i18n/format";
import { ticketQrSvg } from "@/lib/qr";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false } };

/**
 * Shows what the DATABASE says about the order. Landing here proves nothing:
 * only the Stripe webhook can mark an order paid.
 */
export default async function ConfirmationPage({ params, searchParams }: PageProps<"/[lang]/billetterie/confirmation">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const sp = await searchParams;
  const sessionId = typeof sp.session_id === "string" ? sp.session_id : "";
  const cancelled = sp.cancelled === "1";
  const dict = await getDictionary(lang);
  const c = dict.confirmation;

  const view = /^cs_(test|live)_[A-Za-z0-9]{10,200}$/.test(sessionId) ? await getOrderView(getStore(), sessionId) : null;

  if (!view) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 sm:px-6">
        <h1 className="t-h1">{c.notFound}</h1>
        <Link href={`/${lang}/evenements`} className="mt-8 inline-block text-sable underline underline-offset-4">
          {dict.nav.events}
        </Link>
      </div>
    );
  }

  const { order, event, tickets } = view;
  const status = cancelled && order.status === "pending" ? "cancelled" : order.status;
  const heading = {
    pending: [c.pendingTitle, c.pendingText],
    paid: [c.paidTitle, t(c.paidText, { email: order.customerEmail })],
    failed: [c.failedTitle, c.failedText],
    expired: [c.expiredTitle, c.expiredText],
    cancelled: [c.cancelledTitle, c.cancelledText],
    refunded: [c.failedTitle, c.failedText],
  }[status];
  const qrs = await Promise.all(tickets.map((tk) => ticketQrSvg(tk.id)));

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <ConfirmationWatcher sessionId={sessionId} pending={order.status === "pending"} cancelled={cancelled} />

      <div role="status" aria-live="polite">
        {status === "pending" && (
          <span aria-hidden className="mb-6 block h-1 w-24 animate-pulse bg-sable motion-reduce:animate-none" />
        )}
        <h1 className={`t-h1 ${status === "paid" ? "text-ink" : ""}`}>{heading[0]}</h1>
        <p className="mt-5 max-w-xl text-lg text-muted">{heading[1]}</p>
      </div>

      <dl className="mt-10 grid gap-x-6 gap-y-2 border-y border-line py-6 sm:grid-cols-[8rem_1fr]">
        <dt className="text-sm text-muted">{c.order}</dt>
        <dd className="font-mono">{order.id}</dd>
        {event && (
          <>
            <dt className="text-sm text-muted">{dict.events.venue}</dt>
            <dd>
              {event.name} — {event.venueName}
            </dd>
          </>
        )}
        <dt className="text-sm text-muted">{dict.tickets.title}</dt>
        <dd>{order.items.map((i) => `${i.quantity} × ${i.name}`).join(", ")}</dd>
        <dt className="text-sm text-muted">{dict.tickets.total}</dt>
        <dd>{formatMoney(order.totalCents, lang)}</dd>
      </dl>

      {status === "paid" && (
        <section className="mt-10 space-y-5" aria-label={dict.tickets.title}>
          <p className="text-muted">{c.ticketHint}</p>
          {tickets.map((tk, i) => (
            <TicketCard key={tk.id} ticket={tk} qrSvg={qrs[i]} labels={{ holder: c.holder, ticket: c.ticket }} />
          ))}
        </section>
      )}

      {status !== "paid" && status !== "pending" && event && (
        <Link
          href={`/${lang}/evenements/${event.slug}#billets`}
          className="mt-10 inline-flex min-h-12 items-center rounded-full bg-sable px-7 font-semibold text-night"
        >
          {c.backToEvent}
        </Link>
      )}
    </div>
  );
}
