import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Countdown } from "@/components/Countdown";
import { HorizontalGallery } from "@/components/HorizontalGallery";
import { Marquee } from "@/components/motion/Marquee";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { SplitTitle } from "@/components/motion/SplitTitle";
import { getStore } from "@/lib/data";
import { listPublicEvents, listTicketTypes, lowestPrice } from "@/lib/data/catalog";
import { formatMoney, priceWithTaxes } from "@/lib/domain/money";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { formatDate, formatShortDate, formatTime } from "@/lib/i18n/format";
import { ambiance, galleryOrder, pexels } from "@/lib/media";
import { site } from "@/lib/site";

export const revalidate = 60;

const PILLAR_IMAGES = [ambiance.djHands, ambiance.duo, ambiance.dancing] as const;

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const store = getStore();
  const { upcoming } = await listPublicEvents(store);
  const next = upcoming[0];
  const nextFrom = next ? lowestPrice(await listTicketTypes(store, next.id)) : null;
  const nextDate = next ? formatShortDate(next.startsAt, lang) : null;

  return (
    <>
      {/* ── Hero: the brand, full-bleed ──────────────────────── */}
      <section className="relative -mt-16 flex min-h-svh flex-col justify-end overflow-hidden md:-mt-20">
        <div aria-hidden className="grain absolute inset-0">
          <Parallax amount={6} className="absolute inset-0">
            <div className="relative h-full w-full">
              <Image src={pexels(ambiance.crowd.id, 2400)} alt="" fill priority sizes="100vw" className="rise object-cover" />
            </div>
          </Parallax>
          <div className="absolute inset-0 bg-gradient-to-t from-night via-night/55 to-night/30" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-4 pb-10 pt-40 sm:px-6 md:pb-14 lg:px-10">
          <p className="rise mb-6 text-sm text-ink/80 [animation-delay:0.2s] sm:text-base">{dict.home.heroKicker}</p>
          <h1 className="font-display text-[clamp(3.6rem,13.5vw,13rem)] font-medium leading-[0.84] tracking-[-0.04em] text-ink">
            <SplitTitle text="Sayd Social" />
            <br />
            <span className="italic text-sable"><SplitTitle text="Club" delay={0.65} /></span>
          </h1>

          <div className="mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="rise max-w-md [animation-delay:1.1s]">
              <p className="font-display text-2xl leading-snug text-ink/90 sm:text-[1.7rem]">{dict.home.heroLine}</p>
              <Link
                href={`/${lang}/evenements`}
                className="group mt-7 inline-flex min-h-12 items-center gap-3 rounded-full border border-ink/70 px-7 font-semibold text-ink transition hover:border-sable hover:bg-sable hover:text-night"
              >
                {dict.home.heroCta}
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </div>

            {/* Next party as an item, not as the site's theme */}
            {next && nextDate && (
              <Link
                href={`/${lang}/evenements/${next.slug}`}
                className="rise group flex max-w-full items-center gap-4 self-start border border-ink/15 bg-night/70 p-3 pr-4 backdrop-blur-md transition hover:border-sable/60 md:self-auto [animation-delay:1.3s]"
              >
                {next.coverImage && (
                  <Image src={next.coverImage} alt="" width={1080} height={1920} sizes="4rem" className="aspect-[3/4] w-16 object-cover" />
                )}
                <span>
                  <span className="block text-xs text-muted">{dict.home.nextShort}</span>
                  <span className="block font-display text-2xl leading-tight">{next.name}</span>
                  <span className="block text-sm text-ink/80">
                    {nextDate.day} {nextDate.month} · {next.venueName}
                  </span>
                </span>
                <span aria-hidden className="ml-auto shrink-0 pl-2 text-sable transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── Marquee: the sound ───────────────────────────────── */}
      <Marquee items={[...dict.about.sound.split(", ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)), site.city]} className="border-y border-line py-6 font-display text-[clamp(2rem,5vw,3.75rem)] italic leading-none text-ink/90" />

      {/* ── Manifesto ────────────────────────────────────────── */}
      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-24 sm:px-6 md:grid-cols-[1fr_1.1fr] md:items-center md:py-32 lg:px-10">
        <Reveal>
          <p className="mb-6 text-sable">{dict.home.manifestoKicker}</p>
          <p className="max-w-[22ch] font-display text-[clamp(2rem,4vw,3.4rem)] leading-[1.1] text-ink">{dict.home.manifesto}</p>
        </Reveal>
        <Reveal kind="mask" className="relative aspect-[4/5] overflow-hidden md:aspect-[4/5]">
          <Parallax amount={8} className="absolute inset-0">
            <div className="grain relative h-full w-full">
              <Image src={pexels(ambiance.toast.id, 1600)} alt={ambiance.toast.alt[lang]} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
            </div>
          </Parallax>
        </Reveal>
      </section>

      {/* ── The experience: three pillars ────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-10" aria-labelledby="experience">
        <h2 id="experience" className="t-h2 mb-10">{dict.home.pillarsTitle}</h2>
        <div className="grid gap-10 md:grid-cols-3 md:gap-6">
          {dict.home.pillars.map((p, i) => (
            <Reveal key={p.t} delay={i * 0.12} className={i === 1 ? "md:mt-16" : ""}>
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image src={pexels(PILLAR_IMAGES[i].id, 1000)} alt={PILLAR_IMAGES[i].alt[lang]} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition duration-[1.2s] hover:scale-[1.04]" />
              </div>
              <h3 className="t-h3 mt-5">{p.t}</h3>
              <p className="mt-2 max-w-sm text-muted">{p.d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Next party, presented in the brand's own colours ─── */}
      {next && (
        <section className="border-y border-line bg-night-2" aria-labelledby="prochaine">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 md:grid-cols-[minmax(0,18rem)_1fr] md:items-center lg:px-10">
            {next.coverImage && (
              <Reveal kind="mask" className="mx-auto w-full max-w-[16rem] md:max-w-none">
                <Link href={`/${lang}/evenements/${next.slug}`} aria-label={dict.home.details}>
                  <Image src={next.coverImage} alt={`${next.name} — ${next.venueName}`} width={1080} height={1920} sizes="18rem" className="aspect-[9/16] w-full object-cover" />
                </Link>
              </Reveal>
            )}
            <Reveal delay={0.1}>
              <h2 id="prochaine" className="text-muted">{dict.home.nextTitle}</h2>
              <p className="mt-3 font-display text-[clamp(2.8rem,7vw,6rem)] leading-[0.9]">{next.name}</p>
              <p className="mt-4 text-lg text-ink/90 first-letter:uppercase">
                {formatDate(next.startsAt, lang)}, {formatTime(next.startsAt, lang)} — {next.venueName}
                {next.lineup.length > 0 && <> · DJ {next.lineup.join(", ")}</>}
              </p>
              <div className="mt-8">
                <Countdown to={next.startsAt} lang={lang} />
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Link
                  href={`/${lang}/evenements/${next.slug}#billets`}
                  className="group inline-flex min-h-13 items-center gap-3 rounded-full bg-sable px-8 py-3.5 font-semibold text-night transition hover:brightness-110"
                >
                  {dict.home.getTickets}
                  <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>
                {nextFrom !== null && (
                  <p className="text-muted">
                    {dict.home.from} <span className="text-ink">{formatMoney(priceWithTaxes(nextFrom), lang)}</span>
                  </p>
                )}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── Gallery: pinned horizontal scroll on desktop ─────── */}
      <div className="pt-24 lg:pt-0">
        <HorizontalGallery
          title={dict.home.galleryTitle}
          note={dict.home.galleryNote}
          items={galleryOrder.map((k) => ({
            src: pexels(ambiance[k].id, 1400),
            alt: ambiance[k].alt[lang],
            portrait: ambiance[k].h > ambiance[k].w,
          }))}
        />
      </div>

      {/* ── Radio ────────────────────────────────────────────── */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-24 sm:px-6 md:grid-cols-[1fr_1.3fr] lg:px-10" aria-labelledby="radio">
        <Reveal>
          <h2 id="radio" className="t-h2">{dict.home.radioTitle}</h2>
          <p className="mt-4 max-w-md text-muted">{dict.home.radioText}</p>
          <a href={site.spotifyPlaylist} target="_blank" rel="noopener noreferrer" className="link-draw mt-6 inline-block pb-1 text-sable">
            {dict.home.radioCta}
          </a>
        </Reveal>
        <Reveal delay={0.1}>
          <iframe
            title={dict.home.radioTitle}
            src={site.spotifyEmbed}
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            className="h-[352px] w-full rounded-xl border-0"
          />
        </Reveal>
      </section>

      {/* ── Ambassadors ──────────────────────────────────────── */}
      <section className="-mb-24 bg-bottle">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 md:grid-cols-2 lg:px-10">
          <Reveal kind="mask" className="relative aspect-[4/3] overflow-hidden">
            <Image src={pexels(ambiance.group.id, 1400)} alt={ambiance.group.alt[lang]} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="t-h2">{dict.home.ambassadorsTitle}</h2>
            <p className="mt-4 max-w-xl text-ink/85">{dict.home.ambassadorsText}</p>
            <Link
              href={`/${lang}/ambassadeurs`}
              className="mt-8 inline-flex min-h-12 items-center rounded-full border border-ink px-7 font-semibold text-ink transition hover:bg-ink hover:text-bottle"
            >
              {dict.home.ambassadorsCta}
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
