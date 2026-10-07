import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { alternates } from "@/lib/seo";
import Image from "next/image";
import { NextEventCTA } from "@/components/NextEventCTA";
import { getNextEventSummary } from "@/lib/data/next-event";
import { SubmissionForm } from "@/components/SubmissionForm";
import { Reveal } from "@/components/motion/Reveal";
import { SplitTitle } from "@/components/motion/SplitTitle";
import { ambiance, pexels } from "@/lib/media";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { t } from "@/lib/i18n/format";
import { site } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/ambassadeurs">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.ambassadors.title, description: dict.ambassadors.intro, alternates: alternates(lang, "/ambassadeurs") };
}

export default async function AmbassadorsPage({ params }: PageProps<"/[lang]/ambassadeurs">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const f = dict.forms;
  const next = await getNextEventSummary(lang);

  return (
    <>
    <div className="mx-auto grid max-w-7xl gap-14 px-5 pt-28 sm:px-6 md:pt-36 lg:grid-cols-2 lg:px-10">
      <div>
        <h1 className="t-h1"><SplitTitle text={dict.ambassadors.title} /></h1>
        <p className="mt-6 max-w-lg text-lg text-ink/90">{dict.ambassadors.intro}</p>
        <Reveal kind="mask" className="relative mt-10 aspect-[4/3] overflow-hidden">
          <Image src={pexels(ambiance.toast.id, 1400)} alt={ambiance.toast.alt[lang]} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </Reveal>
        <h2 className="mt-12 text-muted">{dict.ambassadors.perksTitle}</h2>
        <ul className="mt-4 border-t border-line">
          {dict.ambassadors.perks.map((p) => (
            <li key={p} className="border-b border-line py-4 font-display text-2xl">
              {p}
            </li>
          ))}
        </ul>
      </div>
      <section aria-labelledby="candidature" className="lg:pt-4">
        <h2 id="candidature" className="t-h3 mb-6">{dict.ambassadors.formTitle}</h2>
        <SubmissionForm
          kind="ambassador"
          lang={lang}
          labels={{ send: f.send, sending: f.sending, sentTitle: f.sentTitle, sentText: f.sentText, error: t(f.error, { email: site.email }) }}
          fields={[
            { name: "name", label: f.name, required: true, autoComplete: "name" },
            { name: "email", label: f.email, type: "email", required: true, autoComplete: "email" },
            { name: "phone", label: f.phone, type: "tel", required: true, autoComplete: "tel" },
            { name: "instagram", label: f.instagram },
            { name: "message", label: f.why, type: "textarea", required: true },
          ]}
        />
      </section>
    </div>
    <NextEventCTA next={next} dict={dict} lang={lang} />
    </>
  );
}
