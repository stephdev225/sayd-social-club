import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "@fontsource-variable/cormorant-garamond/wght.css";
import "@fontsource-variable/cormorant-garamond/wght-italic.css";
import "@fontsource-variable/dm-sans/wght.css";
import "../globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { hasLocale, locales } from "@/lib/i18n/config";
import { site } from "@/lib/site";

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
  const base =
    process.env.SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");
  return {
    metadataBase: new URL(base),
    title: { default: dict.meta.title, template: `%s — ${site.name}` },
    description: dict.meta.description,
    alternates: { languages: { fr: "/fr", en: "/en" } },
    openGraph: {
      siteName: site.name,
      locale: lang === "fr" ? "fr_CA" : "en_CA",
      type: "website",
    },
  };
}

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

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
        <SiteHeader lang={lang} nav={dict.nav} />
        <main id="contenu" className="flex-1">
          {children}
        </main>
        <SiteFooter lang={lang} dict={dict} />
      </body>
    </html>
  );
}
