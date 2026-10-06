import { intlLocale, type Locale } from "./config";

const TZ = "America/Toronto";

/** Replaces {key} placeholders. */
export function t(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`));
}

export function formatDate(iso: string, locale: Locale, opts: Intl.DateTimeFormatOptions = {}): string {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    ...opts,
  }).format(new Date(iso));
}

export function formatTime(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatShortDate(iso: string, locale: Locale): { day: string; month: string } {
  const d = new Date(iso);
  return {
    day: new Intl.DateTimeFormat(intlLocale[locale], { timeZone: TZ, day: "numeric" }).format(d),
    month: new Intl.DateTimeFormat(intlLocale[locale], { timeZone: TZ, month: "short" }).format(d).replace(".", ""),
  };
}
