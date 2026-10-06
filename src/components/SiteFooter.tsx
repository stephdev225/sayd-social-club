import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { site } from "@/lib/site";
import { NotifyForm } from "./NotifyForm";
import { LineReveal } from "./motion/LineReveal";

export function SiteFooter({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-24 overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 pb-10 pt-20 sm:px-6 lg:px-10">
        <LineReveal text={dict.notify.title} className="max-w-3xl font-display text-[clamp(2.4rem,7vw,5.5rem)] leading-[0.95]" />
        <p className="mt-5 max-w-lg text-ink/75">{dict.notify.text}</p>
        <div className="mt-10 max-w-4xl">
          <NotifyForm lang={lang} source="footer" labels={dict.notify} />
        </div>

        <div className="mt-20 grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Image src="/brand/logo-ivory.png" alt="Sayd Social Club" width={319} height={134} className="h-10 w-auto" />
            <p className="mt-4 max-w-xs text-sm text-ink/60">{dict.footer.desc}</p>
          </div>
          <nav aria-label="Pied de page" className="grid grid-cols-2 gap-3 text-ink/75 sm:grid-cols-1">
            <Link href={`/${lang}/evenements`} className="hover:text-ink">{dict.nav.events}</Link>
            <Link href={`/${lang}/galerie`} className="hover:text-ink">{dict.nav.gallery}</Link>
            <Link href={`/${lang}/le-club`} className="hover:text-ink">{dict.nav.about}</Link>
            <Link href={`/${lang}/ambassadeurs`} className="hover:text-ink">{dict.nav.ambassadors}</Link>
            <Link href={`/${lang}/contact`} className="hover:text-ink">{dict.nav.contact}</Link>
          </nav>
          <div className="grid grid-cols-2 gap-3 text-ink/75 sm:grid-cols-1">
            <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-ink">Instagram</a>
            <a href={site.tiktok} target="_blank" rel="noopener noreferrer" className="hover:text-ink">TikTok</a>
            <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-ink">WhatsApp</a>
            <a href={`mailto:${site.email}`} className="break-all hover:text-ink">{site.email}</a>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 text-xs text-ink/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}. {dict.footer.rights} · {dict.footer.photoCredit}
          </p>
          <div className="flex gap-6">
            <Link href={`/${lang}/confidentialite`} className="hover:text-ink">{dict.footer.privacy}</Link>
            <Link href={`/${lang}/conditions`} className="hover:text-ink">{dict.footer.terms}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
