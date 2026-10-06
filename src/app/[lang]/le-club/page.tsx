import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { NextEventCTA } from "@/components/NextEventCTA";
import { getNextEventSummary } from "@/lib/data/next-event";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { SplitTitle } from "@/components/motion/SplitTitle";
import { ambiance, pexels } from "@/lib/media";
import { notFound } from "next/navigation";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { site } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/le-club">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.about.title, description: dict.about.lead };
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
    <Parallax amount={8} className="grain relative mx-auto mt-16 aspect-[16/9] max-w-7xl md:aspect-[21/9]">
      <div className="relative h-full w-full">
        <Image src={pexels(ambiance.group.id, 2000)} alt={ambiance.group.alt[lang]} fill sizes="100vw" className="object-cover" />
      </div>
    </Parallax>
    <div className="mx-auto max-w-4xl px-4 pt-16 sm:px-6 lg:px-10">
      <Reveal><p className="max-w-2xl text-lg leading-relaxed text-ink/90">{dict.about.body}</p></Reveal>
      <Reveal><p className="mt-16 font-display text-[clamp(2rem,6vw,4.5rem)] italic leading-none text-sable">{dict.about.sound}</p></Reveal>
      <div className="mt-16 flex flex-wrap gap-4">
        <Link href={`/${lang}/evenements`} className="inline-flex min-h-12 items-center rounded-full bg-sable px-7 font-semibold text-night">
          {dict.nav.events}
        </Link>
        <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center rounded-full border border-line px-7 text-ink">
          Instagram
        </a>
      </div>
    </div>
    <NextEventCTA next={next} dict={dict} lang={lang} />
    </>
  );
}
