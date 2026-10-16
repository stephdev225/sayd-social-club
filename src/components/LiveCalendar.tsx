"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

const TZ = "America/Toronto"; // Québec time

/** Year, month (0-11) and day of a date as seen in Québec. */
function partsInQuebec(d: Date) {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "numeric", day: "numeric" }).formatToParts(d);
  const get = (t: string) => Number(p.find((x) => x.type === t)?.value);
  return { y: get("year"), m: get("month") - 1, d: get("day") };
}

/**
 * Live month calendar (Québec time): the month's name, then the whole month with today
 * in red. It follows the clock, so it moves to the next day at midnight on its own.
 * No frame and no visible edge: the days float on a soft glow that fades into the page,
 * with a slow drift. Announced party dates get a red dot.
 * Rendered after mount only (the date may differ between server and browser).
 */
export function LiveCalendar({ lang, eventDates = [] }: { lang: "fr" | "en"; eventDates?: string[] }) {
  const reduce = useReducedMotion();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = setTimeout(tick, 0);
    const t = setInterval(tick, 30_000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, []);

  if (!now) return <div aria-hidden className="h-[24rem]" />;

  const locale = lang === "fr" ? "fr-CA" : "en-CA";
  const today = partsInQuebec(now);
  const first = new Date(Date.UTC(today.y, today.m, 1, 12));
  const daysInMonth = new Date(Date.UTC(today.y, today.m + 1, 0, 12)).getUTCDate();
  const offset = (first.getUTCDay() + 6) % 7; // Monday first
  const events = new Set(
    eventDates.map((iso) => {
      const p = partsInQuebec(new Date(iso));
      return p.y === today.y && p.m === today.m ? p.d : -1;
    }),
  );
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(locale, { weekday: "narrow", timeZone: "UTC" }).format(new Date(Date.UTC(2024, 0, 1 + i, 12))),
  );
  const month = new Intl.DateTimeFormat(locale, { timeZone: TZ, month: "long", year: "numeric" }).format(now);
  const monthLabel = month.charAt(0).toUpperCase() + month.slice(1);

  return (
    <motion.div
      className="relative"
      animate={reduce ? undefined : { y: [0, -12, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Soft glow behind the days, fading to nothing: no edge, no frame */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-10 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(245,243,240,0.07)_0%,rgba(193,18,31,0.06)_40%,transparent_72%)] blur-2xl"
      />

      <p className="font-display text-[clamp(2rem,3.6vw,3rem)] lining-nums leading-none">{monthLabel}</p>

      <div className="mt-8 grid grid-cols-7 gap-y-2 text-center">
        {weekdays.map((w, i) => (
          <span key={i} className="pb-2 text-sm uppercase tracking-wider text-ink/45">
            {w}
          </span>
        ))}
        {Array.from({ length: offset }, (_, i) => (
          <span key={`e${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const d = i + 1;
          const isToday = d === today.d;
          const past = d < today.d;
          return (
            <span key={d} className="relative mx-auto grid h-11 w-11 place-items-center text-lg">
              <span
                className={`grid h-10 w-10 place-items-center rounded-full tabular-nums ${
                  isToday ? "bg-sable font-semibold text-ink shadow-[0_10px_30px_-6px_rgba(193,18,31,0.7)]" : past ? "text-ink/30" : "text-ink/85"
                }`}
                aria-current={isToday ? "date" : undefined}
              >
                {d}
              </span>
              {events.has(d) && !isToday && <span aria-hidden className="absolute bottom-0 h-1.5 w-1.5 rounded-full bg-sable" />}
            </span>
          );
        })}
      </div>
    </motion.div>
  );
}
