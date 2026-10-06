import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { t } from "@/lib/i18n/format";
import { site } from "@/lib/site";
import { NewsletterForm } from "./NewsletterForm";

export function SiteFooter({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-10">
        <div>
          <p className="t-h3 mb-5 max-w-sm">{dict.footer.newsletterTitle}</p>
          <NewsletterForm
            lang={lang}
            labels={{
              label: dict.forms.newsletterLabel,
              cta: dict.forms.newsletterCta,
              done: dict.forms.newsletterDone,
              sending: dict.forms.sending,
              error: t(dict.forms.error, { email: site.email }),
            }}
          />
        </div>

        <nav aria-label="Pied de page" className="flex flex-col gap-3 text-muted">
          <Link href={`/${lang}/evenements`} className="hover:text-ink">{dict.nav.events}</Link>
          <Link href={`/${lang}/le-club`} className="hover:text-ink">{dict.nav.about}</Link>
          <Link href={`/${lang}/ambassadeurs`} className="hover:text-ink">{dict.nav.ambassadors}</Link>
          <Link href={`/${lang}/contact`} className="hover:text-ink">{dict.nav.contact}</Link>
        </nav>

        <div className="flex flex-col gap-3 text-muted">
          <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-ink">Instagram</a>
          <a href={site.tiktok} target="_blank" rel="noopener noreferrer" className="hover:text-ink">TikTok</a>
          <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-ink">WhatsApp</a>
          <a href={`mailto:${site.email}`} className="hover:text-ink">{site.email}</a>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-line px-4 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
        <p>
          © {year} {site.name}. {dict.footer.rights}
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href={`/${lang}/confidentialite`} className="hover:text-ink">{dict.footer.privacy}</Link>
          <Link href={`/${lang}/conditions`} className="hover:text-ink">{dict.footer.terms}</Link>
        </div>
      </div>
    </footer>
  );
}
