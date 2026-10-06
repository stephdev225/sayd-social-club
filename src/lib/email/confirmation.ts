import "server-only";
import type { Order, SaydEvent, Ticket } from "@/lib/domain/types";
import type { Store } from "@/lib/data/store";
import { formatMoney } from "@/lib/domain/money";
import { env } from "@/lib/env";
import { escapeHtml } from "@/lib/html";
import { formatDate, formatTime } from "@/lib/i18n/format";
import { ticketQrPng } from "@/lib/qr";
import { site } from "@/lib/site";
import { sendEmail } from "./send";

const copy = {
  fr: {
    subject: (e: string) => `Vos billets — ${e}`,
    hello: (n: string) => `Bonjour ${n},`,
    intro: "Votre paiement est confirmé. Voici vos billets.",
    order: "Commande",
    when: "Quand",
    where: "Où",
    tickets: "Billets",
    total: "Total payé",
    each: "Un code QR par personne, en pièce jointe et sur ces liens :",
    open: "Ouvrir le billet",
    rules: [
      "Présentez le code QR à l'entrée, sur votre téléphone ou imprimé.",
      "Chaque code ne passe qu'une seule fois. Ne le partagez pas.",
      "Billets non remboursables.",
    ],
    questions: "Une question ? Répondez à ce courriel ou écrivez-nous sur WhatsApp.",
  },
  en: {
    subject: (e: string) => `Your tickets — ${e}`,
    hello: (n: string) => `Hi ${n},`,
    intro: "Your payment is confirmed. Here are your tickets.",
    order: "Order",
    when: "When",
    where: "Where",
    tickets: "Tickets",
    total: "Total paid",
    each: "One QR code per person, attached and at these links:",
    open: "Open ticket",
    rules: [
      "Show the QR code at the door, on your phone or printed.",
      "Each code works once only. Don't share it.",
      "Tickets are non-refundable.",
    ],
    questions: "Questions? Reply to this email or message us on WhatsApp.",
  },
};

/** Sends the confirmation once per order (guarded by order.emailSentAt). */
export async function sendOrderConfirmation(store: Store, order: Order, tickets: Ticket[], event: SaydEvent) {
  const fresh = await store.get<Order & Record<string, unknown>>("orders", order.id);
  if (fresh?.emailSentAt) return;

  const lang = order.locale;
  const c = copy[lang];
  const firstName = order.customerName.split(" ")[0];
  const when = `${formatDate(event.startsAt, lang)}, ${formatTime(event.startsAt, lang)}`;
  const where = `${event.venueName}, ${event.address}, ${event.city}`;
  const ticketUrl = (code: string) => `${env.siteUrl}/${lang}/billet/${encodeURIComponent(code)}`;
  const lines = order.items.map((i) => `${i.quantity} × ${i.name}`).join(", ");

  const html = `<!doctype html><html lang="${lang}"><body style="margin:0;background:#f4f0ea;font-family:Helvetica,Arial,sans-serif;color:#120f0e">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff">
<tr><td style="background:#120f0e;color:#efe6d8;padding:28px 32px;font-family:Georgia,serif;font-size:28px">${escapeHtml(event.name)}</td></tr>
<tr><td style="padding:28px 32px;font-size:15px;line-height:1.6">
<p>${escapeHtml(c.hello(firstName))}</p><p>${escapeHtml(c.intro)}</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0;font-size:15px">
<tr><td style="color:#6b625a;padding:4px 16px 4px 0">${c.order}</td><td><strong>${escapeHtml(order.id)}</strong></td></tr>
<tr><td style="color:#6b625a;padding:4px 16px 4px 0">${c.when}</td><td>${escapeHtml(when)}</td></tr>
<tr><td style="color:#6b625a;padding:4px 16px 4px 0">${c.where}</td><td>${escapeHtml(where)}</td></tr>
<tr><td style="color:#6b625a;padding:4px 16px 4px 0">${c.tickets}</td><td>${escapeHtml(lines)}</td></tr>
<tr><td style="color:#6b625a;padding:4px 16px 4px 0">${c.total}</td><td>${escapeHtml(formatMoney(order.totalCents, lang))}</td></tr>
</table>
<p>${escapeHtml(c.each)}</p>
<ul style="padding-left:18px">${tickets
    .map((t) => `<li style="margin:6px 0"><a href="${escapeHtml(ticketUrl(t.id))}" style="color:#5a1420">${c.open} ${escapeHtml(t.id)}</a> — ${escapeHtml(t.ticketTypeName)}</li>`)
    .join("")}</ul>
<ul style="padding-left:18px;color:#3b3430">${c.rules.map((r) => `<li>${escapeHtml(r)}</li>`).join("")}</ul>
<p style="color:#6b625a">${escapeHtml(c.questions)} ${escapeHtml(site.phone)}</p>
</td></tr></table></td></tr></table></body></html>`;

  const text = [
    c.hello(firstName),
    c.intro,
    `${c.order}: ${order.id}`,
    `${c.when}: ${when}`,
    `${c.where}: ${where}`,
    `${c.tickets}: ${lines}`,
    `${c.total}: ${formatMoney(order.totalCents, lang)}`,
    "",
    c.each,
    ...tickets.map((t) => `- ${t.id} (${t.ticketTypeName}): ${ticketUrl(t.id)}`),
    "",
    ...c.rules.map((r) => `• ${r}`),
    "",
    `${c.questions} ${site.phone}`,
  ].join("\n");

  const attachments = await Promise.all(
    tickets.map(async (t) => ({ name: `${t.id}.png`, contentBase64: (await ticketQrPng(t.id)).toString("base64") })),
  );

  const { sent } = await sendEmail({
    to: [{ email: order.customerEmail, name: order.customerName }],
    subject: c.subject(event.name),
    html,
    text,
    replyTo: site.email,
    attachments,
  });
  if (sent) await store.update("orders", order.id, { emailSentAt: new Date().toISOString() });
}
