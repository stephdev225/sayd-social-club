import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Countdown } from "@/components/Countdown";
import { DragCarousel } from "@/components/DragCarousel";
import { HeroBrand } from "@/components/HeroBrand";
import { LineReveal } from "@/components/motion/LineReveal";
import { Magnetic } from "@/components/motion/Magnetic";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { TextReveal } from "@/components/motion/TextReveal";
import { VelocityMarquee } from "@/components/motion/VelocityMarquee";
import { getStore } from "@/lib/data";
import { listPublicEvents } from "@/lib/data/catalog";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { formatDate, formatShortDate, formatTime } from "@/lib/i18n/format";
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
      <HeroBrand image={pexels(ambiance.crowd.id, 2400)} kicker={dict.home.heroKicker}>
        <div className="mt-8 flex flex-col gap-7 md:mt-10 md:flex-row md:items-end md:justify-between">
          <div className="rise max-w-md [animation-delay:1.1s]">
            <p className="font-display text-[1.45rem] leading-snug text-ink/90 sm:text-[1.7rem]">{dict.home.heroLine}</p>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Magnetic>
                <Link
                  href={next ? `/${lang}/evenements/${next.slug}#billets` : `/${lang}/evenements`}
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
      <VelocityMarquee items={[...sound, site.city]} className="py-10 font-display text-[clamp(2.6rem,9vw,6rem)] italic leading-none text-ink/90 md:py-14" />

      {/* ── 3. Manifesto: words light up as you read ── */}
      <section className="mx-auto max-w-7xl px-5 pb-20 pt-10 sm:px-6 md:pb-32 lg:px-10">
        <p className="mb-6 text-sable">{dict.home.manifestoKicker}</p>
        <TextReveal text={dict.home.manifesto} className="max-w-[20ch] font-display text-[clamp(2.1rem,7vw,4.6rem)] leading-[1.06] text-ink" />
      </section>

      {/* ── 4. Experience: images that open as you scroll, offset rhythm ── */}
      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-6 md:pb-36 lg:px-10" aria-labelledby="experience">
        <LineReveal id="experience" text={dict.home.pillarsTitle} className="t-h2 mb-12" />
        <div className="grid gap-14 md:grid-cols-3 md:gap-8">
          {dict.home.pillars.map((p, i) => (
            <div key={p.t} className={i === 1 ? "md:mt-24" : i === 2 ? "md:mt-12" : ""}>
              <Reveal kind="mask" delay={i * 0.1} className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                <Parallax amount={7} className="absolute inset-0">
                  <div className="relative h-full w-full">
                    <Image src={pexels(PILLAR_IMAGES[i].id, 1000)} alt={PILLAR_IMAGES[i].alt[lang]} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
                  </div>
                </Parallax>
              </Reveal>
              <Reveal delay={0.15 + i * 0.1}>
                <h3 className="t-h3 mt-6">{p.t}</h3>
                <p className="mt-2 max-w-sm text-ink/70">{p.d}</p>
              </Reveal>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. Next party, inside the page flow (no band) ── */}
      {next && (
        <section className="relative overflow-hidden" aria-labelledby="prochaine">
          {next.coverImage && (
            <div aria-hidden className="absolute inset-0 -z-10 opacity-30 blur-3xl">
              <Image src={next.coverImage} alt="" fill sizes="50vw" className="scale-125 object-cover" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#120f0e_70%)]" />
            </div>
          )}
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-6 md:grid-cols-[minmax(0,20rem)_1fr] md:items-center md:gap-16 md:py-32 lg:px-10">
            {next.coverImage && (
              <Reveal kind="mask" className="mx-auto w-full max-w-[17rem] md:max-w-none">
                <Link href={`/${lang}/evenements/${next.slug}`} aria-label={dict.home.details} className="block overflow-hidden rounded-2xl">
                  <Image src={next.coverImage} alt={`${next.name} — ${next.venueName}`} width={1080} height={1920} sizes="20rem" className="aspect-[9/16] w-full object-cover transition duration-700 hover:scale-[1.03]" />
                </Link>
              </Reveal>
            )}
            <div>
              <Reveal><h2 id="prochaine" className="text-sable">{dict.home.nextTitle}</h2></Reveal>
              <LineReveal as="p" text={next.name} className="mt-3 font-display text-[clamp(3.2rem,13vw,7rem)] leading-[0.88]" />
              <Reveal delay={0.15}>
                <p className="mt-5 text-lg text-ink/85 first-letter:uppercase">
                  {formatDate(next.startsAt, lang)}, {formatTime(next.startsAt, lang)}
                  <br />
                  {next.venueName}{next.lineup.length > 0 && <> · DJ {next.lineup.join(", ")}</>}
                </p>
                <div className="mt-8"><Countdown to={next.startsAt} lang={lang} /></div>
                <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
                  <Magnetic>
                    <Link
                      href={`/${lang}/evenements/${next.slug}#billets`}
                      className="group inline-flex min-h-14 items-center gap-3 rounded-full bg-sable px-8 py-4 text-base font-semibold text-night transition hover:brightness-110"
                    >
                      {dict.home.getTickets}
                      <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                    </Link>
                  </Magnetic>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      )}

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
        <DragCarousel
          items={CAROUSEL.map((k) => ({ src: pexels(ambiance[k].id, 1200), alt: ambiance[k].alt[lang], portrait: ambiance[k].h > ambiance[k].w }))}
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
