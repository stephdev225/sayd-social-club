import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { alternates } from "@/lib/seo";
import { SubmissionForm } from "@/components/SubmissionForm";
import { LineReveal } from "@/components/motion/LineReveal";
import { Reveal } from "@/components/motion/Reveal";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { t } from "@/lib/i18n/format";
import { photos } from "@/lib/media";
import { site } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.contact.title, description: dict.contact.intro, alternates: alternates(lang, "/contact") };
}

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const f = dict.forms;

  return (
    <>
      <div className="relative">
        {/* Image fades into the page: no visible frame */}
        <div aria-hidden className="absolute inset-x-0 top-0 h-[70svh] [mask-image:linear-gradient(to_bottom,black_30%,transparent)]">
          <Image src={photos.barWide.src} alt="" fill priority sizes="100vw" className="object-cover opacity-35" />
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-16 px-5 pb-10 pt-32 sm:px-6 md:pt-44 lg:grid-cols-[1fr_1.1fr] lg:px-10">
          <div>
            <LineReveal as="h1" text={dict.contact.title} className="t-hero" />
            <Reveal delay={0.2}>
              <p className="mt-6 max-w-md text-lg text-ink/85">{dict.contact.intro}</p>
            </Reveal>
            <Reveal delay={0.3}>
              <ul className="mt-12 space-y-4 text-lg">
                <li><a href={`mailto:${site.email}`} className="link-draw pb-0.5">{site.email}</a></li>
                <li><a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="link-draw pb-0.5">WhatsApp — {site.phone}</a></li>
                <li><a href={site.instagram} target="_blank" rel="noopener noreferrer" className="link-draw pb-0.5">Instagram {site.instagramHandle}</a></li>
              </ul>
            </Reveal>
          </div>
          <section aria-label={dict.contact.title} className="lg:pt-6">
            <SubmissionForm
              kind="contact"
              lang={lang}
              labels={{ send: f.send, sending: f.sending, sentTitle: dict.contact.sentTitle, sentText: dict.contact.sentText, error: t(f.error, { email: site.email }) }}
              fields={[
                { name: "name", label: f.name, required: true, autoComplete: "name" },
                { name: "email", label: f.email, type: "email", required: true, autoComplete: "email" },
                { name: "subject", label: dict.contact.subjectLabel, type: "select", options: dict.contact.subjects },
                { name: "message", label: f.message, type: "textarea", required: true },
              ]}
            />
          </section>
        </div>
      </div>
    </>
  );
}
