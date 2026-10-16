import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExperienceStack } from "@/components/ExperienceStack";
import { ScrollGallery } from "@/components/ScrollGallery";
import { HeroBrand } from "@/components/HeroBrand";
import { LineReveal } from "@/components/motion/LineReveal";
import { Magnetic } from "@/components/motion/Magnetic";
import { Reveal } from "@/components/motion/Reveal";
import { TextReveal } from "@/components/motion/TextReveal";
import { VelocityMarquee } from "@/components/motion/VelocityMarquee";
import { getStore } from "@/lib/data";
import { listPublicEvents } from "@/lib/data/catalog";
import { ticketsHrefFor } from "@/lib/data/next-event";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { formatShortDate } from "@/lib/i18n/format";
import { photos } from "@/lib/media";
import { site } from "@/lib/site";

export const revalidate = 60;

// Home opening: the DJ from above (08606), sharp high-resolution versions, no aerial show.
const HERO = { image: "/photos/mora-08606-hero.webp", mobile: "/photos/mora-08296-hero.webp", alt: photos.decks.alt };
const PILLAR_IMAGES = [photos.djDecks, photos.couple, photos.crowd] as const;
const CAROUSEL = ["duo", "wine", "veuve", "decks", "glow", "bar", "bucket", "sparklers", "sign", "service"] as const;

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const store = getStore();
  const { upcoming } = await listPublicEvents(store);
  const next = upcoming[0];
  const nextDate = next ? formatShortDate(next.startsAt, lang) : null;
  const sound = dict.about.sound.split(", ").map((w) => w.charAt(0).toUpperCase() + w.slice(1));

  return (
    <>
      {/* ── 1. Hero: the photo behind the whole first screen, the promise written on it ── */}
      <HeroBrand image={HERO.image} imageMobile={HERO.mobile} alt={HERO.alt[lang]}>
        <h1 className="sr-only">Sayd Social Club</h1>
        <p className="rise max-w-3xl font-display text-[clamp(2.6rem,7vw,5.6rem)] leading-[0.98] tracking-[-0.02em] [animation-delay:0.1s]">{dict.home.heroLine}</p>
        <p className="rise mt-6 max-w-md text-lg text-ink/80 [animation-delay:0.25s]">{dict.footer.desc}</p>
        <div className="rise mt-9 flex flex-wrap items-center gap-x-6 gap-y-4 [animation-delay:0.4s]">
          <Magnetic>
            <Link
              href={next ? ticketsHrefFor(next, lang) : `/${lang}/evenements`}
              className="group inline-flex min-h-13 items-center gap-3 rounded-full bg-sable px-7 py-3.5 font-semibold text-ink transition hover:brightness-110"
            >
              {next ? `${dict.funnel.cta} · ${next.name}${nextDate ? `, ${nextDate.day} ${nextDate.month}` : ""}` : dict.home.heroCta}
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </Magnetic>
          <Link href={`/${lang}/galerie`} className="link-draw pb-1 text-ink/85">{dict.nav.gallery}</Link>
        </div>
      </HeroBrand>

      {/* ── 2. The sound, drifting with your scroll speed ── */}
      <VelocityMarquee items={[...sound, site.city]} className="py-8 font-display text-[clamp(1.7rem,5.2vw,3.4rem)] italic leading-none text-ink/85 md:py-12" />

      {/* ── 3. Manifesto: words light up as you read ── */}
      <section className="mx-auto max-w-7xl px-5 pb-20 pt-10 sm:px-6 md:pb-32 lg:px-10">
        <TextReveal text={dict.home.manifesto} className="max-w-[20ch] font-display text-[clamp(2.1rem,7vw,4.6rem)] leading-[1.06] text-ink" />
      </section>

      {/* ── 4. Experience: photo cards that pin and stack as you scroll ── */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 md:pb-36 lg:px-10" aria-labelledby="experience">
        <LineReveal id="experience" text={dict.home.pillarsTitle} className="t-h2 mb-10 px-1 md:mb-14" />
        <div className="mx-auto max-w-5xl">
        <ExperienceStack
          items={dict.home.pillars.map((p, i) => ({
            title: p.t,
            text: p.d,
            image: PILLAR_IMAGES[i].src,
            imageWide: PILLAR_IMAGES[i].land,
            pos: PILLAR_IMAGES[i].pos,
            alt: PILLAR_IMAGES[i].alt[lang],
          }))}
        />
        </div>
      </section>

      {/* ── 6. Gallery teaser: drag / swipe ── */}
      <section className="pb-24 pt-10 md:pb-36" aria-labelledby="ambiance">
        <div className="mx-auto mb-10 flex max-w-7xl items-end justify-between gap-6 px-5 sm:px-6 lg:px-10">
          <div>
            <LineReveal id="ambiance" text={dict.home.galleryTitle} className="t-h2" />
            <Reveal delay={0.1}><p className="mt-3 max-w-md text-ink/70">{dict.home.galleryNote}</p></Reveal>
          </div>
          <Link href={`/${lang}/galerie`} className="link-draw shrink-0 pb-1 text-ink">
            {dict.nav.gallery} →
          </Link>
        </div>
        <ScrollGallery
          href={`/${lang}/galerie`}
          photos={CAROUSEL.map((k) => ({ src: photos[k].src, alt: photos[k].alt[lang], portrait: photos[k].h > photos[k].w, pos: photos[k].pos }))}
        />
      </section>

      {/* ── 8. Ambassadors: the photo whole, the invitation beside it ── */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-24 sm:px-6 md:grid-cols-2 md:gap-16 md:pb-36 lg:px-10">
        <Reveal>
          <div className="relative mx-auto aspect-[2/3] w-full max-w-md overflow-hidden rounded-[1.75rem] md:max-h-[80svh] md:w-auto">
            <Image src={photos.trio.src} alt={photos.trio.alt[lang]} fill sizes="(min-width: 768px) 28rem, 100vw" className="object-cover" />
          </div>
        </Reveal>
        <div>
          <LineReveal text={dict.home.ambassadorsTitle} className="max-w-3xl font-display text-[clamp(2.6rem,9vw,6rem)] leading-[0.92]" />
          <Reveal delay={0.15}>
            <p className="mt-6 max-w-lg text-lg text-ink/85">{dict.home.ambassadorsText}</p>
            <Magnetic className="mt-9">
              <Link
                href={`/${lang}/ambassadeurs`}
                className="inline-flex min-h-13 items-center rounded-full bg-sable px-8 py-3.5 font-semibold text-ink transition hover:brightness-110"
              >
                {dict.home.ambassadorsCta}
              </Link>
            </Magnetic>
          </Reveal>
        </div>
      </section>

    </>
  );
}
