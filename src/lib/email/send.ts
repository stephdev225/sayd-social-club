import "server-only";

export interface OutgoingEmail {
  to: { email: string; name?: string }[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  attachments?: { name: string; contentBase64: string }[];
}

/**
 * Sends through Brevo's transactional API (already chosen in the original project).
 * Without BREVO_API_KEY, logs instead of sending so local development keeps working.
 */
export async function sendEmail(mail: OutgoingEmail): Promise<{ sent: boolean }> {
  const apiKey = process.env.BREVO_API_KEY;
  const from = process.env.EMAIL_FROM ?? "billets@saydsocialclub.com";
  const fromName = process.env.EMAIL_FROM_NAME ?? "Sayd Social Club";
  if (!apiKey) {
    console.info(`[email] BREVO_API_KEY not set — would send "${mail.subject}" to ${mail.to.map((t) => t.email).join(", ")}`);
    return { sent: false };
  }
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { accept: "application/json", "content-type": "application/json", "api-key": apiKey },
    body: JSON.stringify({
      sender: { email: from, name: fromName },
      to: mail.to,
      subject: mail.subject,
      htmlContent: mail.html,
      textContent: mail.text,
      ...(mail.replyTo ? { replyTo: { email: mail.replyTo } } : {}),
      ...(mail.attachments?.length
        ? { attachment: mail.attachments.map((a) => ({ name: a.name, content: a.contentBase64 })) }
        : {}),
    }),
  });
  if (!res.ok) throw new Error(`Brevo responded ${res.status}: ${await res.text().catch(() => "")}`);
  return { sent: true };
}
