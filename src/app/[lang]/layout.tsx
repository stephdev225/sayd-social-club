import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "@fontsource-variable/cormorant-garamond/wght.css";
import "@fontsource-variable/cormorant-garamond/wght-italic.css";
import "@fontsource-variable/dm-sans/wght.css";
import "../globals.css";
import { BackLink } from "@/components/BackLink";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { StickyTicketPill } from "@/components/StickyTicketPill";
import { getNextEventSummary } from "@/lib/data/next-event";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { hasLocale, locales } from "@/lib/i18n/config";
import { alternates, siteUrl } from "@/lib/seo";
import { site } from "@/lib/site";

// Pages are pre-rendered, then refreshed at most every 5 minutes (new event, sold out...).
// Saving an event in the admin refreshes them immediately.
export const revalidate = 300;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  themeColor: "#120f0e",
  colorScheme: "dark",
};

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: dict.meta.title, template: `%s — ${site.name}` },
    description: dict.meta.description,
    alternates: alternates(lang),
    openGraph: {
      siteName: site.name,
      locale: lang === "fr" ? "fr_CA" : "en_CA",
      type: "website",
      images: [{ url: `/brand/og-${lang}.jpg`, width: 1200, height: 630, alt: dict.meta.title }],
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const next = await getNextEventSummary(lang);

  return (
    <html lang={lang === "fr" ? "fr-CA" : "en-CA"}>
      <body className="flex min-h-svh flex-col">
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-sable focus:px-4 focus:py-2 focus:text-night"
        >
          {dict.nav.skip}
        </a>
        <SmoothScroll />
        <SiteHeader lang={lang} nav={dict.nav} ticketsHref={next?.ticketsHref ?? `/${lang}/evenements`} />
        <main id="contenu" className="relative flex-1">
          <BackLink lang={lang} home={dict.common.home} events={dict.events.all} />
          {children}
        </main>
        <SiteFooter lang={lang} dict={dict} />
        {next && (
          <StickyTicketPill
            href={next.ticketsHref}
            label={`${dict.funnel.cta} · ${next.name}`}
            detail={`${next.dateShort} · ${next.venue}`}
          />
        )}
      </body>
    </html>
  );
}
