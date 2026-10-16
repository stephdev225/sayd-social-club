import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { alternates } from "@/lib/seo";
import { NextEventCTA } from "@/components/NextEventCTA";
import { getNextEventSummary } from "@/lib/data/next-event";
import { Gallery } from "@/components/Gallery";
import { HeroBrand } from "@/components/HeroBrand";
import { LineReveal } from "@/components/motion/LineReveal";
import { Reveal } from "@/components/motion/Reveal";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { galleryPage, photos } from "@/lib/media";

const COVER = [photos.aerialSplit, photos.aerialDj, photos.aerialist, photos.balcony];

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
    {/* Opening: title and words beside a framed photo of the aerial show */}
    <HeroBrand slides={COVER.map((p) => ({ src: p.src, alt: p.alt[lang] }))}>
      <LineReveal as="h1" text={dict.gallery.title} className="t-hero" />
      <Reveal delay={0.2}>
        <p className="mt-6 max-w-md text-lg text-ink/85">{dict.gallery.intro}</p>
      </Reveal>
    </HeroBrand>
    <div className="mx-auto max-w-7xl px-3 pt-4 sm:px-6 md:pt-8 lg:px-10">
      <div>
        <Gallery
          labels={dict.gallery.viewer}
          photos={galleryPage.map((k) => ({
            id: k,
            src: photos[k].src,
            full: photos[k].src,
            alt: photos[k].alt[lang],
            w: photos[k].w,
            h: photos[k].h,
          }))}
        />
      </div>
    </div>
    <NextEventCTA next={next} dict={dict} lang={lang} />
    </>
  );
}
