import type { SaydEvent } from "@/lib/domain/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { formatDate, formatTime } from "@/lib/i18n/format";

/** Date, doors, venue and music as a definition list. */
export function EventFacts({ event, lang, dict, className = "" }: { event: SaydEvent; lang: Locale; dict: Dictionary; className?: string }) {
  const date = formatDate(event.startsAt, lang);
  const facts: [string, React.ReactNode][] = [
    [dict.events.doors, `${date.charAt(0).toUpperCase()}${date.slice(1)}, ${formatTime(event.startsAt, lang)} – ${formatTime(event.endsAt, lang)}`],
    [dict.events.venue, `${event.venueName}, ${event.address}, ${event.city}`],
  ];
  if (event.lineup.length) {
    facts.push([
      dict.events.lineup,
      event.lineup.map((name, i) => {
        const href = event.instagram?.[name];
        return (
          <span key={name}>
            {i > 0 && ", "}
            {href ? (
              <a href={href} target="_blank" rel="noopener noreferrer" className="underline decoration-sable/60 underline-offset-4 hover:decoration-sable">
                DJ {name}
              </a>
            ) : (
              `DJ ${name}`
            )}
          </span>
        );
      }),
    ]);
  }
  return (
    <dl className={`grid gap-x-6 gap-y-3 sm:grid-cols-[8rem_1fr] ${className}`}>
      {facts.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-sm text-muted sm:pt-0.5">{k}</dt>
          <dd className="text-ink">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
