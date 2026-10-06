import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { NextEventCTA } from "@/components/NextEventCTA";
import { SubmissionForm } from "@/components/SubmissionForm";
import { LineReveal } from "@/components/motion/LineReveal";
import { Reveal } from "@/components/motion/Reveal";
import { getNextEventSummary } from "@/lib/data/next-event";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { t } from "@/lib/i18n/format";
import { ambiance, pexels } from "@/lib/media";
import { site } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/partenariats">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.partners.title, description: dict.partners.intro };
}

export default async function PartnersPage({ params }: PageProps<"/[lang]/partenariats">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const p = dict.partners;
  const f = dict.forms;
  const next = await getNextEventSummary(lang);

  return (
    <>
      <div className="relative">
        <div aria-hidden className="absolute inset-x-0 top-0 h-[75svh] [mask-image:linear-gradient(to_bottom,black_25%,transparent)]">
          <Image src={pexels(ambiance.toast.id, 2000)} alt="" fill priority sizes="100vw" className="object-cover opacity-35" />
        </div>
        <div className="relative mx-auto max-w-7xl px-5 pt-32 sm:px-6 md:pt-44 lg:px-10">
          <LineReveal as="h1" text={p.title} className="t-hero" />
          <Reveal delay={0.2}><p className="mt-6 max-w-xl text-lg text-ink/85">{p.intro}</p></Reveal>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-24 px-5 pt-24 sm:px-6 md:space-y-32 md:pt-32 lg:px-10">
        <section aria-labelledby="why">
          <LineReveal id="why" text={p.whyTitle} className="t-h2" />
          <div className="mt-10 grid gap-10 md:grid-cols-3">
            {p.why.map((w, i) => (
              <Reveal key={w.t} delay={i * 0.08}>
                <p className="font-display text-5xl text-sable/60">0{i + 1}</p>
                <h3 className="mt-3 font-display text-3xl">{w.t}</h3>
                <p className="mt-3 text-ink/75">{w.d}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <section aria-labelledby="types">
          <LineReveal id="types" text={p.typesTitle} className="t-h2" />
          <ul className="mt-8">
            {p.types.map((ty, i) => (
              <Reveal key={ty.t} delay={i * 0.05}>
                <li className="grid gap-2 py-6 md:grid-cols-[1fr_1.3fr] md:items-baseline">
                  <span className="font-display text-[clamp(2rem,6vw,3.5rem)] leading-none">{ty.t}</span>
                  <span className="text-ink/75">{ty.d}</span>
                </li>
              </Reveal>
            ))}
          </ul>
        </section>

        <section aria-labelledby="partner-form" className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <LineReveal id="partner-form" text={p.formTitle} className="t-h2" />
            <Reveal delay={0.1}>
              <ul className="mt-8 space-y-3 text-lg">
                <li><a href={`mailto:${site.email}`} className="link-draw pb-0.5">{site.email}</a></li>
                <li><a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="link-draw pb-0.5">WhatsApp — {site.phone}</a></li>
              </ul>
            </Reveal>
          </div>
          <SubmissionForm
            kind="partnership"
            lang={lang}
            labels={{ send: f.send, sending: f.sending, sentTitle: p.sentTitle, sentText: p.sentText, error: t(f.error, { email: site.email }) }}
            fields={[
              { name: "company", label: p.company, required: true, autoComplete: "organization" },
              { name: "name", label: f.name, required: true, autoComplete: "name" },
              { name: "email", label: f.email, type: "email", required: true, autoComplete: "email" },
              { name: "phone", label: f.phone, type: "tel", autoComplete: "tel" },
              { name: "type", label: p.type, type: "select", options: p.typeOptions },
              { name: "message", label: f.message, type: "textarea", required: true },
            ]}
          />
        </section>
      </div>

      <NextEventCTA next={next} dict={dict} lang={lang} />
    </>
  );
}
