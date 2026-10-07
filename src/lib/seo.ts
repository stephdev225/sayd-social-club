import type { Locale } from "@/lib/i18n/config";

/** Public origin of the site (custom domain once SITE_URL is set). */
export function siteUrl(): string {
  return (
    process.env.SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
  ).replace(/\/$/, "");
}

/** Canonical URL and the FR/EN versions of one page, so search engines show the right language. */
export function alternates(lang: Locale, path = "") {
  return {
    canonical: `/${lang}${path}`,
    languages: { "fr-CA": `/fr${path}`, "en-CA": `/en${path}`, "x-default": `/fr${path}` },
  };
}

/** Public pages listed in the sitemap (event pages are added from the database). */
export const PUBLIC_PATHS = ["", "/evenements", "/showcase", "/galerie", "/le-club", "/partenariats", "/ambassadeurs", "/contact", "/confidentialite", "/conditions"];
