import Link from "next/link";
import { notFound } from "next/navigation";
import { ExperienceStack } from "@/components/ExperienceStack";
import { FeatureCard } from "@/components/FeatureCard";
import { ScrollGallery } from "@/components/ScrollGallery";
import { HeroBrand } from "@/components/HeroBrand";
import { LineReveal } from "@/components/motion/LineReveal";
import { Magnetic } from "@/components/motion/Magnetic";
import { Reveal } from "@/components/motion/Reveal";
import { getStore } from "@/lib/data";
import { listPublicEvents } from "@/lib/data/catalog";
import { ticketsHrefFor } from "@/lib/data/next-event";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { formatShortDate } from "@/lib/i18n/format";
import { photos } from "@/lib/media";

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

  return (
    <>
      {/* ── 1. Hero: the photo behind the whole first screen, the promise written on it ── */}
      <HeroBrand image={HERO.image} imageMobile={HERO.mobile} alt={HERO.alt[lang]}>
        <h1 className="sr-only">Sayd Social Club</h1>
        <p className="rise max-w-2xl font-display text-[clamp(2.3rem,5.6vw,4.6rem)] leading-[1] tracking-[-0.02em] [animation-delay:0.1s]">{dict.home.heroLine}</p>
        <p className="rise mt-5 max-w-md text-lg text-ink/85 [animation-delay:0.25s]">{dict.footer.desc}</p>
        <div className="rise mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 [animation-delay:0.4s]">
          <Magnetic>
            <Link
              href={next ? ticketsHrefFor(next, lang) : `/${lang}/evenements`}
              className="group inline-flex min-h-13 items-center gap-3 rounded-full bg-sable px-7 py-3.5 font-semibold text-ink transition hover:brightness-110"
            >
              {next ? `${dict.funnel.cta} · ${next.name}${nextDate ? `, ${nextDate.day} ${nextDate.month}` : ""}` : dict.home.heroCta}
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </Magnetic>
        </div>
      </HeroBrand>

      {/* ── 2. Experience: title and manifesto, then the three cards slide sideways as you scroll ── */}
      <section aria-labelledby="experience" className="pt-16 md:pt-24">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 sm:px-6 md:grid-cols-[auto_1fr] md:items-end md:gap-16 lg:px-10">
          <LineReveal id="experience" text={dict.home.pillarsTitle} className="t-h2" />
          <Reveal delay={0.1}>
            <p className="max-w-xl font-display text-[clamp(1.5rem,2.4vw,2.1rem)] leading-[1.25] text-ink/90 md:justify-self-end">{dict.home.manifesto}</p>
          </Reveal>
        </div>
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
      </section>

      {/* ── 6. Gallery teaser: drag / swipe ── */}
      <section className="pb-24 pt-14 md:pb-36 md:pt-20" aria-labelledby="ambiance">
        <div className="mx-auto mb-10 flex max-w-7xl items-end justify-between gap-6 px-5 sm:px-6 lg:px-10">
          <div>
            <LineReveal id="ambiance" text={dict.home.galleryTitle} className="t-h2" />
            <Reveal delay={0.1}><p className="mt-4 max-w-lg text-lg text-ink/80 md:text-xl">{dict.home.galleryNote}</p></Reveal>
          </div>
          <Link href={`/${lang}/galerie`} className="link-draw shrink-0 pb-1 text-lg text-ink md:text-xl">
            {dict.nav.gallery} →
          </Link>
        </div>
        <ScrollGallery
          href={`/${lang}/galerie`}
          photos={CAROUSEL.map((k) => ({ src: photos[k].src, alt: photos[k].alt[lang], portrait: photos[k].h > photos[k].w, pos: photos[k].pos }))}
        />
      </section>

      {/* ── 8. Ambassadors: photo with a floating panel ── */}
      <section className="pb-24 md:pb-36">
        <FeatureCard image={photos.trio.src} alt={photos.trio.alt[lang]} reverse>
          <LineReveal text={dict.home.ambassadorsTitle} className="font-display text-[clamp(2.6rem,6vw,5rem)] leading-[0.95]" />
          <p className="mt-6 max-w-lg text-lg text-ink/85 md:text-xl">{dict.home.ambassadorsText}</p>
          <Magnetic className="mt-9">
            <Link
              href={`/${lang}/ambassadeurs`}
              className="inline-flex min-h-13 items-center rounded-full bg-sable px-8 py-3.5 font-semibold text-ink transition hover:brightness-110"
            >
              {dict.home.ambassadorsCta}
            </Link>
          </Magnetic>
        </FeatureCard>
      </section>

    </>
  );
}
