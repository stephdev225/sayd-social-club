import { NextResponse } from "next/server";
import { getStore, usingMemoryStore } from "@/lib/data";
import { sendEmail } from "@/lib/email/send";
import { escapeHtml } from "@/lib/html";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { site } from "@/lib/site";
import { formSchema } from "@/lib/validation";

const TITLES = { newsletter: "Inscription newsletter", contact: "Message de contact", ambassador: "Candidature ambassadeur" };

/** Contact, ambassador and newsletter submissions: validated, stored, and forwarded to the team by email. */
export async function POST(request: Request) {
  if (!rateLimit(`forms:${clientIp(request)}`, 5, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  const raw = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  // Honeypot filled → pretend success, store nothing.
  if (raw && typeof raw.website === "string" && raw.website.length > 0) return NextResponse.json({ ok: true });

  const parsed = formSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const data = parsed.data;
  const { website: _honeypot, ...fields } = data;
  void _honeypot;

  if (usingMemoryStore() && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  await getStore().add("submissions", { ...fields, createdAt: new Date().toISOString() });

  if (data.kind !== "newsletter") {
    const rows = Object.entries(fields)
      .filter(([k]) => k !== "kind" && k !== "locale")
      .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666">${escapeHtml(k)}</td><td>${escapeHtml(v)}</td></tr>`)
      .join("");
    try {
      await sendEmail({
        to: [{ email: process.env.TEAM_EMAIL ?? site.email }],
        subject: `${TITLES[data.kind]} — ${data.name}`,
        html: `<h2>${TITLES[data.kind]}</h2><table>${rows}</table>`,
        text: Object.entries(fields).map(([k, v]) => `${k}: ${v}`).join("\n"),
        replyTo: data.email,
      });
    } catch (err) {
      console.error("[forms] team email failed", err); // stored anyway; visible in the admin later
    }
  }
  return NextResponse.json({ ok: true });
}
