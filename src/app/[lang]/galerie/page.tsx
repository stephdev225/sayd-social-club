import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { alternates } from "@/lib/seo";
import { NextEventCTA } from "@/components/NextEventCTA";
import { getNextEventSummary } from "@/lib/data/next-event";
import { Gallery } from "@/components/Gallery";
import { LineReveal } from "@/components/motion/LineReveal";
import { Reveal } from "@/components/motion/Reveal";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { ambiance, galleryPage, pexels } from "@/lib/media";

export async function generateMetadata({ params }: PageProps<"/[lang]/galerie">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.gallery.title, description: dict.gallery.intro, alternates: alternates(lang, "/galerie") };
}

export default async function GalleryPage({ params }: PageProps<"/[lang]/galerie">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const next = await getNextEventSummary(lang);

  return (
    <>
    <div className="mx-auto max-w-7xl px-3 pb-10 pt-28 sm:px-6 md:pt-36 lg:px-10">
      <div className="px-2 sm:px-0">
        <LineReveal as="h1" text={dict.gallery.title} className="t-h1" />
        <Reveal delay={0.2}>
          <p className="mt-5 max-w-xl text-lg text-ink/80">{dict.gallery.intro}</p>
        </Reveal>
      </div>
      <div className="mt-12">
        <Gallery
          labels={dict.gallery.viewer}
          photos={galleryPage.map((k) => ({
            id: ambiance[k].id,
            src: pexels(ambiance[k].id, 900),
            full: pexels(ambiance[k].id, 2000),
            alt: ambiance[k].alt[lang],
            w: ambiance[k].w,
            h: ambiance[k].h,
          }))}
        />
      </div>
    </div>
    <NextEventCTA next={next} dict={dict} lang={lang} />
    </>
  );
}
