import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EventFacts } from "@/components/EventFacts";
import { getStore } from "@/lib/data";
import { listPublicEvents, listTicketTypes, lowestPrice } from "@/lib/data/catalog";
import { formatMoney } from "@/lib/domain/money";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { formatShortDate } from "@/lib/i18n/format";
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

  return (
    <>
      {/* Hero = the next party. It is the reason people land here. */}
      {next ? (
        <section className="relative overflow-hidden" style={{ ["--accent" as string]: next.accent ?? "var(--color-sable)" }}>
          <div aria-hidden className="absolute inset-y-0 right-0 hidden w-[42%] bg-[var(--accent)] lg:block" />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-10 sm:px-6 md:pt-16 lg:grid-cols-[1fr_minmax(0,26rem)] lg:gap-16 lg:px-10 lg:pb-24">
            <div className="rise flex flex-col justify-end">
              <p className="mb-6 text-muted">{dict.home.nextEvent}</p>
              <h1 className="t-hero text-ink">
                {next.name}
                {next.edition && <span className="mt-6 block font-display text-[0.28em] italic tracking-normal text-sable">{next.edition[lang]}</span>}
              </h1>
              <p className="mt-6 max-w-xl font-display text-2xl italic text-ink/90">{next.tagline[lang]}</p>
              <EventFacts event={next} lang={lang} dict={dict} className="mt-10 max-w-xl" />
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Link
                  href={`/${lang}/evenements/${next.slug}#billets`}
                  className="inline-flex min-h-12 items-center rounded-full bg-sable px-7 font-semibold text-night transition hover:brightness-110"
                >
                  {dict.home.getTickets}
                </Link>
                {nextFrom !== null && (
                  <p className="text-muted">
                    {dict.home.from} <span className="text-ink">{formatMoney(nextFrom, lang)}</span>
                  </p>
                )}
              </div>
            </div>

            {next.coverImage && (
              <Link href={`/${lang}/evenements/${next.slug}`} className="relative block self-center lg:py-6" aria-label={dict.home.details}>
                <Image
                  src={next.coverImage}
                  alt={`${next.name} — ${next.venueName}`}
                  width={1080}
                  height={1920}
                  priority
                  sizes="(min-width: 1024px) 26rem, 100vw"
                  className="mx-auto aspect-[9/16] w-full max-w-sm object-cover shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)] lg:max-w-none"
                />
              </Link>
            )}
          </div>
        </section>
      ) : (
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-10">
          <h1 className="t-hero">{site.name}</h1>
          <p className="mt-8 max-w-xl text-lg text-muted">{dict.home.noEvent}</p>
        </section>
      )}

      {/* Rest of the season, as a typographic list rather than cards. Hidden until there is one. */}
      {later.length > 0 && (
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-10" aria-labelledby="saison">
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
                      <span className="t-h3 block group-hover:text-sable">{e.name}</span>
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

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-10">
        <p className="max-w-[26ch] font-display text-[clamp(1.9rem,4vw,3.1rem)] leading-[1.15] text-ink">{dict.home.manifesto}</p>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1fr_1.3fr] lg:px-10" aria-labelledby="radio">
        <div>
          <h2 id="radio" className="t-h2">{dict.home.radioTitle}</h2>
          <p className="mt-4 max-w-md text-muted">{dict.home.radioText}</p>
          <a href={site.spotifyPlaylist} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block text-sable underline underline-offset-4">
            {dict.home.radioCta}
          </a>
        </div>
        <iframe
          title={dict.home.radioTitle}
          src={site.spotifyEmbed}
          loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          className="h-[352px] w-full rounded-xl border-0"
        />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-10" aria-labelledby="galerie">
        <h2 id="galerie" className="t-h2">{dict.home.galleryTitle}</h2>
        <p className="mt-4 max-w-xl text-muted">{dict.home.galleryEmpty}</p>
      </section>

      <section className="-mb-24 bg-bottle">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-16 sm:px-6 md:flex-row md:items-end md:justify-between lg:px-10">
          <div>
            <h2 className="t-h2">{dict.home.ambassadorsTitle}</h2>
            <p className="mt-4 max-w-xl text-ink/85">{dict.home.ambassadorsText}</p>
          </div>
          <Link
            href={`/${lang}/ambassadeurs`}
            className="inline-flex min-h-12 shrink-0 items-center self-start rounded-full border border-ink px-7 font-semibold text-ink transition hover:bg-ink hover:text-bottle md:self-auto"
          >
            {dict.home.ambassadorsCta}
          </Link>
        </div>
      </section>
    </>
  );
}
