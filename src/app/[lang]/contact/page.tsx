import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SubmissionForm } from "@/components/SubmissionForm";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { t } from "@/lib/i18n/format";
import { site } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.contact.title, description: dict.contact.intro };
}

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const f = dict.forms;

  return (
    <div className="mx-auto grid max-w-7xl gap-14 px-4 pt-14 sm:px-6 lg:grid-cols-2 lg:px-10">
      <div>
        <h1 className="t-h1">{dict.contact.title}</h1>
        <p className="mt-6 max-w-md text-lg text-ink/90">{dict.contact.intro}</p>
        <dl className="mt-12 grid gap-x-6 gap-y-4 sm:grid-cols-[8rem_1fr]">
          <dt className="text-sm text-muted">{f.email}</dt>
          <dd><a href={`mailto:${site.email}`} className="underline underline-offset-4">{site.email}</a></dd>
          <dt className="text-sm text-muted">{f.phone}</dt>
          <dd><a href={site.phoneHref} className="underline underline-offset-4">{site.phone}</a></dd>
          <dt className="text-sm text-muted">WhatsApp</dt>
          <dd><a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">{site.phone}</a></dd>
          <dt className="text-sm text-muted">Instagram</dt>
          <dd><a href={site.instagram} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">{site.instagramHandle}</a></dd>
        </dl>
      </div>
      <section aria-label={dict.contact.title} className="lg:pt-4">
        <SubmissionForm
          kind="contact"
          lang={lang}
          labels={{ send: f.send, sending: f.sending, sent: f.sent, error: t(f.error, { email: site.email }) }}
          fields={[
            { name: "name", label: f.name, required: true, autoComplete: "name" },
            { name: "email", label: f.email, type: "email", required: true, autoComplete: "email" },
            { name: "subject", label: f.subject },
            { name: "message", label: f.message, type: "textarea", required: true },
          ]}
        />
      </section>
    </div>
  );
}
