import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExperienceStack } from "@/components/ExperienceStack";
import { ScrollGallery } from "@/components/ScrollGallery";
import { HeroBrand } from "@/components/HeroBrand";
import { LineReveal } from "@/components/motion/LineReveal";
import { Magnetic } from "@/components/motion/Magnetic";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { TextReveal } from "@/components/motion/TextReveal";
import { VelocityMarquee } from "@/components/motion/VelocityMarquee";
import { getStore } from "@/lib/data";
import { listPublicEvents } from "@/lib/data/catalog";
import { ticketsHrefFor } from "@/lib/data/next-event";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { formatShortDate } from "@/lib/i18n/format";
import { ambiance, pexels } from "@/lib/media";
import { site } from "@/lib/site";

export const revalidate = 60;

const PILLAR_IMAGES = [ambiance.djHands, ambiance.duo, ambiance.dancing] as const;
const CAROUSEL = ["toast", "party", "cocktail", "decks", "monochrome", "blueDance", "bar", "concertBw"] as const;

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
      {/* ── 1. Brand hero: photo zooms, wordmark lifts away on scroll ── */}
      <HeroBrand image={pexels(ambiance.crowd.id, 2400)}>
        <div className="mt-8 flex flex-col gap-7 md:mt-10 md:flex-row md:items-end md:justify-between">
          <div className="rise max-w-md [animation-delay:1.1s]">
            <p className="font-display text-[1.45rem] leading-snug text-ink/90 sm:text-[1.7rem]">{dict.home.heroLine}</p>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Magnetic>
                <Link
                  href={next ? ticketsHrefFor(next, lang) : `/${lang}/evenements`}
                  className="group inline-flex min-h-14 items-center gap-3 rounded-full bg-sable px-7 py-4 font-semibold text-night transition hover:brightness-110"
                >
                  {next ? dict.funnel.cta : dict.home.heroCta}
                  <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>
              </Magnetic>
              <Link href={`/${lang}/evenements`} className="link-draw pb-1 text-ink/85">{dict.home.heroCta}</Link>
            </div>
          </div>

          {next && nextDate && (
            <Link
              href={`/${lang}/evenements/${next.slug}`}
              className="rise group flex max-w-full items-center gap-4 self-start rounded-2xl bg-night/55 p-2.5 pr-4 backdrop-blur-md transition hover:bg-night/80 md:self-auto [animation-delay:1.3s]"
            >
              {next.coverImage && (
                <Image src={next.coverImage} alt="" width={1080} height={1920} sizes="3.5rem" className="aspect-[3/4] w-14 rounded-lg object-cover" />
              )}
              <span className="min-w-0">
                <span className="block whitespace-nowrap text-xs text-ink/60">{dict.home.nextShort}</span>
                <span className="block truncate font-display text-xl leading-tight">{next.name}</span>
                <span className="block text-sm text-ink/75">{nextDate.day} {nextDate.month} · {next.venueName}</span>
              </span>
              <span aria-hidden className="ml-auto shrink-0 pl-2 text-sable transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          )}
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
        <ExperienceStack
          items={dict.home.pillars.map((p, i) => ({
            title: p.t,
            text: p.d,
            image: pexels(PILLAR_IMAGES[i].id, 1800),
            alt: PILLAR_IMAGES[i].alt[lang],
          }))}
        />
      </section>

      {/* ── 6. Gallery teaser: drag / swipe ── */}
      <section className="pb-24 pt-10 md:pb-36" aria-labelledby="ambiance">
        <div className="mx-auto mb-10 flex max-w-7xl items-end justify-between gap-6 px-5 sm:px-6 lg:px-10">
          <div>
            <LineReveal id="ambiance" text={dict.home.galleryTitle} className="t-h2" />
            <Reveal delay={0.1}><p className="mt-3 max-w-md text-ink/70">{dict.home.galleryNote}</p></Reveal>
          </div>
          <Link href={`/${lang}/galerie`} className="link-draw shrink-0 pb-1 text-sable">
            {dict.nav.gallery} →
          </Link>
        </div>
        <ScrollGallery
          href={`/${lang}/galerie`}
          photos={CAROUSEL.map((k) => ({ src: pexels(ambiance[k].id, 900), alt: ambiance[k].alt[lang], portrait: ambiance[k].h > ambiance[k].w }))}
        />
      </section>

      {/* ── 7. Radio ── */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-24 sm:px-6 md:grid-cols-[1fr_1.3fr] md:pb-36 lg:px-10" aria-labelledby="radio">
        <div>
          <LineReveal id="radio" text={dict.home.radioTitle} className="t-h2" />
          <Reveal delay={0.1}>
            <p className="mt-4 max-w-md text-ink/70">{dict.home.radioText}</p>
            <a href={site.spotifyPlaylist} target="_blank" rel="noopener noreferrer" className="link-draw mt-6 inline-block pb-1 text-sable">
              {dict.home.radioCta}
            </a>
          </Reveal>
        </div>
        <Reveal delay={0.15}>
          <iframe
            title={dict.home.radioTitle}
            src={site.spotifyEmbed}
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            className="h-[352px] w-full rounded-2xl border-0"
          />
        </Reveal>
      </section>

      {/* ── 8. Ambassadors: image bleeds, text over the fade ── */}
      <section className="relative isolate overflow-hidden">
        <Parallax amount={8} className="absolute inset-0 -z-10">
          <div className="grain relative h-full w-full">
            <Image src={pexels(ambiance.group.id, 2000)} alt="" fill sizes="100vw" className="object-cover" />
          </div>
        </Parallax>
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,#120f0e_0%,rgba(18,15,14,0.55)_30%,rgba(18,15,14,0.6)_70%,#120f0e_100%)]" />
        <div className="mx-auto max-w-7xl px-5 py-32 sm:px-6 md:py-48 lg:px-10">
          <LineReveal text={dict.home.ambassadorsTitle} className="max-w-3xl font-display text-[clamp(2.6rem,9vw,6rem)] leading-[0.92]" />
          <Reveal delay={0.15}>
            <p className="mt-6 max-w-lg text-lg text-ink/85">{dict.home.ambassadorsText}</p>
            <Magnetic className="mt-9">
              <Link
                href={`/${lang}/ambassadeurs`}
                className="inline-flex min-h-13 items-center rounded-full bg-ink px-8 py-3.5 font-semibold text-night transition-colors hover:bg-sable"
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
