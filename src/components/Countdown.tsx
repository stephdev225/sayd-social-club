"use client";

import { useEffect, useState } from "react";

const LABELS = {
  fr: { d: "jours", h: "heures", m: "min", s: "sec", live: "C'est ce soir" },
  en: { d: "days", h: "hours", m: "min", s: "sec", live: "It's tonight" },
};

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

/** Live countdown to doors. Renders nothing until mounted (no hydration mismatch). */
export function Countdown({ to, lang }: { to: string; lang: "fr" | "en" }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, []);
  const L = LABELS[lang];
  if (now === null) return <div className="h-[3.75rem]" aria-hidden />;
  const left = new Date(to).getTime() - now;
  if (left <= 0) return <p className="font-display text-2xl italic text-sable">{L.live}</p>;
  const p = parts(left);
  const cells: [number, string][] = [
    [p.d, L.d],
    [p.h, L.h],
    [p.m, L.m],
    [p.s, L.s],
  ];
  return (
    <div className="flex items-end gap-5 sm:gap-7" role="timer" aria-live="off">
      {cells.map(([v, label]) => (
        <div key={label} className="text-center">
          <span className="block font-display text-4xl leading-none tabular-nums text-ink sm:text-5xl">{String(v).padStart(2, "0")}</span>
          <span className="mt-1 block text-xs text-muted">{label}</span>
        </div>
      ))}
    </div>
  );
}
