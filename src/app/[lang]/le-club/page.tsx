import type { Metadata } from "next";
import { FeatureCard } from "@/components/FeatureCard";
import Link from "next/link";
import { NextEventCTA } from "@/components/NextEventCTA";
import { getNextEventSummary } from "@/lib/data/next-event";
import { Reveal } from "@/components/motion/Reveal";
import { SplitTitle } from "@/components/motion/SplitTitle";
import { photos } from "@/lib/media";
import { notFound } from "next/navigation";
import { alternates } from "@/lib/seo";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { site } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/le-club">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.about.title, description: dict.about.lead, alternates: alternates(lang, "/le-club") };
}

export default async function AboutPage({ params }: PageProps<"/[lang]/le-club">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const next = await getNextEventSummary(lang);

  return (
    <>
    <div className="mx-auto max-w-4xl px-5 pt-28 sm:px-6 md:pt-36 lg:px-10">
      <h1 className="t-h1"><SplitTitle text={dict.about.title} /></h1>
      <Reveal><p className="mt-10 max-w-[30ch] font-display text-[clamp(1.8rem,3.6vw,2.8rem)] leading-[1.15]">{dict.about.lead}</p></Reveal>
    </div>
    <div className="mt-14 md:mt-20">
      <FeatureCard image={photos.ben.src} alt={photos.ben.alt[lang]}>
        <p className="font-display text-[clamp(1.7rem,2.8vw,2.5rem)] leading-[1.2]">{dict.about.body}</p>
        <p className="mt-8 font-display text-[clamp(1.5rem,2.4vw,2.1rem)] italic leading-tight text-ink/75">{dict.about.sound}</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href={`/${lang}/evenements`} className="inline-flex min-h-13 items-center rounded-full bg-sable px-8 font-semibold text-ink transition hover:brightness-110">
            {dict.nav.events}
          </Link>
          <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-13 items-center rounded-full border border-ink/25 px-8 text-ink transition hover:bg-ink hover:text-night">
            Instagram
          </a>
        </div>
      </FeatureCard>
    </div>
    <NextEventCTA next={next} dict={dict} lang={lang} />
    </>
  );
}
