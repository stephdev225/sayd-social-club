import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { alternates } from "@/lib/seo";
import { NextEventCTA } from "@/components/NextEventCTA";
import { getNextEventSummary } from "@/lib/data/next-event";
import { Gallery } from "@/components/Gallery";
import Image from "next/image";
import { LineReveal } from "@/components/motion/LineReveal";
import { Reveal } from "@/components/motion/Reveal";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { galleryPage, photos } from "@/lib/media";

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
  const cover = photos.aerialHoop;

  return (
    <>
    {/* Cover: the photo whole over a blurred copy of itself, title at the bottom */}
    <section className="relative h-[78svh] min-h-[28rem] overflow-hidden bg-night">
      <Image src={cover.src} alt="" aria-hidden fill priority sizes="40vw" className="scale-110 object-cover opacity-50 blur-2xl" />
      <Image src={cover.src} alt={cover.alt[lang]} fill priority sizes="(min-width: 768px) 60vw, 100vw" className="object-contain" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-night to-transparent" />
      <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-5 pb-8 sm:px-6 md:pb-12 lg:px-10">
        <LineReveal as="h1" text={dict.gallery.title} className="t-h1" />
        <Reveal delay={0.2}>
          <p className="mt-4 max-w-xl text-lg text-ink/85">{dict.gallery.intro}</p>
        </Reveal>
      </div>
    </section>
    <div className="mx-auto max-w-7xl px-3 pb-10 pt-10 sm:px-6 md:pt-16 lg:px-10">
      <div>
        <Gallery
          labels={dict.gallery.viewer}
          photos={galleryPage.filter((k) => k !== "aerialHoop").map((k) => ({
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
