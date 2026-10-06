import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/session";
import { getStore } from "@/lib/data";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { checkInTicket } from "@/lib/services/checkin";

const schema = z.object({ code: z.string().min(1).max(200), eventId: z.string().max(100).optional() });

/** Door scanner endpoint. Staff or admin only. */
export async function POST(request: Request) {
  const session = await requireRole("admin", "staff");
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!rateLimit(`scan:${clientIp(request)}`, 120, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const out = await checkInTicket(getStore(), parsed.data.code, { eventId: parsed.data.eventId, scannedBy: session.name });
  if (out.result === "invalid") return NextResponse.json({ result: "invalid" });
  const t = out.ticket;
  return NextResponse.json({
    result: out.result,
    ticket: { id: t.id, holderName: t.holderName, ticketTypeName: t.ticketTypeName, checkedInAt: t.checkedInAt, checkedInBy: t.checkedInBy },
  });
}
