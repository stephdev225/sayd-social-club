/**
 * Events happen in Québec: the admin types local times ("2026-10-11", "22:00"),
 * the database stores ISO instants. These helpers convert between the two for
 * America/Toronto (same rules as Québec), including daylight saving changes.
 */
export const EVENT_TIME_ZONE = "America/Toronto";

function offsetMinutes(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return Math.round((asUtc - instant.getTime()) / 60000);
}

/** "2026-10-11" + "22:00" (Québec time) → "2026-10-12T02:00:00.000Z". */
export function localToIso(date: string, time: string, timeZone = EVENT_TIME_ZONE): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const t = /^(\d{2}):(\d{2})$/.exec(time);
  if (!m || !t) throw new Error("Invalid date or time");
  const naive = Date.UTC(+m[1], +m[2] - 1, +m[3], +t[1], +t[2]);
  // Two passes handle the hour around a daylight-saving change.
  let utc = naive - offsetMinutes(new Date(naive), timeZone) * 60000;
  utc = naive - offsetMinutes(new Date(utc), timeZone) * 60000;
  return new Date(utc).toISOString();
}

/** ISO instant → { date: "2026-10-11", time: "22:00" } in Québec time. */
export function isoToLocal(iso: string, timeZone = EVENT_TIME_ZONE): { date: string; time: string } {
  const d = new Date(iso);
  const local = new Date(d.getTime() + offsetMinutes(d, timeZone) * 60000);
  const s = local.toISOString();
  return { date: s.slice(0, 10), time: s.slice(11, 16) };
}

/** Start and end of a night: an end time earlier than the start means "after midnight". */
export function nightRange(date: string, start: string, end: string): { startsAt: string; endsAt: string } {
  const startsAt = localToIso(date, start);
  let endsAt = localToIso(date, end);
  if (endsAt <= startsAt) endsAt = new Date(new Date(endsAt).getTime() + 24 * 3600 * 1000).toISOString();
  return { startsAt, endsAt };
}
