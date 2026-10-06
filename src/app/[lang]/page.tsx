import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Countdown } from "@/components/Countdown";
import { EventFacts } from "@/components/EventFacts";
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
import { formatDate, formatShortDate } from "@/lib/i18n/format";
import { ambiance, galleryOrder, pexels } from "@/lib/media";
import { site } from "@/lib/site";

export const revalidate = 60;

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const store = getStore();
  const { upcoming } = await listPublicEvents(store);
  const [next, ...later] = upcoming;
  const nextFrom = next ? lowestPrice(await listTicketTypes(store, next.id)) : null;

  const marquee = next
    ? [next.name, formatDate(next.startsAt, lang, { weekday: undefined }), next.venueName, ...dict.about.sound.split(", ")]
    : dict.about.sound.split(", ");

  return (
    <>
      {/* ── Hero: the next party ─────────────────────────────── */}
      {next ? (
        <section className="relative -mt-16 overflow-hidden pt-16 md:-mt-20 md:pt-20" style={{ ["--accent" as string]: next.accent ?? "var(--color-sable)" }}>
          <div aria-hidden className="grain absolute inset-0">
            <Image src={pexels(ambiance.crowd.id, 2000)} alt="" fill priority sizes="100vw" className="object-cover opacity-[0.18]" />
            <div className="absolute inset-0 bg-gradient-to-b from-night/40 via-night/70 to-night" />
          </div>
          <div aria-hidden className="absolute inset-y-0 right-0 hidden w-[40%] bg-[var(--accent)] lg:block" />

          <div className="relative mx-auto grid min-h-[calc(100svh-5rem)] max-w-7xl gap-12 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[1fr_minmax(0,25rem)] lg:items-center lg:gap-16 lg:px-10">
            <div className="flex flex-col">
              <p className="rise mb-6 text-muted">{dict.home.nextEvent}</p>
              <h1 className="t-hero text-ink">
                <SplitTitle text={next.name} />
                {next.edition && <span className="rise mt-6 block font-display text-[0.28em] italic tracking-normal text-sable [animation-delay:0.7s]">{next.edition[lang]}</span>}
              </h1>
              <p className="rise mt-6 max-w-xl font-display text-2xl italic text-ink/90 [animation-delay:0.85s]">{next.tagline[lang]}</p>

              <div className="rise mt-10 [animation-delay:1s]">
                <p className="mb-3 text-sm text-muted">{dict.home.countdownLabel}</p>
                <Countdown to={next.startsAt} lang={lang} />
              </div>

              <EventFacts event={next} lang={lang} dict={dict} className="rise mt-10 max-w-xl [animation-delay:1.1s]" />

              <div className="rise mt-10 flex flex-wrap items-center gap-x-6 gap-y-4 [animation-delay:1.2s]">
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
            </div>

            {next.coverImage && (
              <Reveal kind="mask" delay={0.35} className="relative mx-auto w-full max-w-sm lg:max-w-none">
                <Link href={`/${lang}/evenements/${next.slug}`} aria-label={dict.home.details} className="block">
                  <Image
                    src={next.coverImage}
                    alt={`${next.name} — ${next.venueName}`}
                    width={1080}
                    height={1920}
                    priority
                    sizes="(min-width: 1024px) 25rem, 90vw"
                    className="aspect-[9/16] w-full object-cover shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)] transition duration-700 hover:scale-[1.015]"
                  />
                </Link>
              </Reveal>
            )}
          </div>
        </section>
      ) : (
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-10">
          <h1 className="t-hero"><SplitTitle text={site.name} /></h1>
          <p className="mt-8 max-w-xl text-lg text-muted">{dict.home.noEvent}</p>
        </section>
      )}

      {/* ── Marquee ──────────────────────────────────────────── */}
      <Marquee items={marquee} className="border-y border-line py-6 font-display text-[clamp(2rem,5vw,3.75rem)] italic leading-none text-ink/90" />

      {/* ── Rest of the season (only when announced) ─────────── */}
      {later.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-10" aria-labelledby="saison">
          <h2 id="saison" className="t-h2 mb-8">{dict.home.seasonTitle}</h2>
          <ul className="border-t border-line">
            {later.map((e) => {
              const d = formatShortDate(e.startsAt, lang);
              return (
                <li key={e.id} className="border-b border-line">
                  <Link href={`/${lang}/evenements/${e.slug}`} className="group grid grid-cols-[4.5rem_1fr] items-baseline gap-4 py-6 sm:grid-cols-[6rem_1fr_auto]">
                    <span className="font-display text-4xl leading-none">
                      {d.day} <span className="block text-base text-muted">{d.month}</span>
                    </span>
                    <span>
                      <span className="t-h3 block transition-colors group-hover:text-sable">{e.name}</span>
                      <span className="text-muted">{e.venueName}</span>
                    </span>
                    <span className="col-start-2 text-sable sm:col-start-auto">{dict.home.details}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* ── Manifesto over a full-bleed image ────────────────── */}
      <section className="relative isolate overflow-hidden">
        <Parallax amount={10} className="absolute inset-0 -z-10">
          <div className="grain relative h-full w-full">
            <Image src={pexels(ambiance.dancing.id, 2000)} alt="" fill sizes="100vw" className="object-cover" />
          </div>
        </Parallax>
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-night via-night/80 to-night/30" />
        <div className="mx-auto max-w-7xl px-4 py-32 sm:px-6 md:py-44 lg:px-10">
          <Reveal>
            <p className="mb-6 text-sable">{dict.home.manifestoKicker}</p>
            <p className="max-w-[24ch] font-display text-[clamp(2rem,4.4vw,3.6rem)] leading-[1.1] text-ink">{dict.home.manifesto}</p>
          </Reveal>
        </div>
      </section>

      {/* ── Gallery: pinned horizontal scroll on desktop ─────── */}
      <div className="pt-20 lg:pt-0">
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
            <Image src={pexels(ambiance.duo.id, 1400)} alt={ambiance.duo.alt[lang]} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
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
