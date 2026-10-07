import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { alternates } from "@/lib/seo";
import { SplitTitle } from "@/components/motion/SplitTitle";
import { getStore } from "@/lib/data";
import { listPublicEvents } from "@/lib/data/catalog";
import type { SaydEvent } from "@/lib/domain/types";
import { hasLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary, type Dictionary } from "@/lib/i18n/dictionaries";
import { formatDate, formatTime } from "@/lib/i18n/format";

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps<"/[lang]/evenements">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.events.title, description: dict.events.intro, alternates: alternates(lang, "/evenements") };
}

function Row({ e, lang, dict }: { e: SaydEvent; lang: Locale; dict: Dictionary }) {
  return (
    <li className="border-b border-line">
      <Link href={`/${lang}/evenements/${e.slug}`} className="group grid grid-cols-[5.5rem_1fr] gap-5 py-6 sm:grid-cols-[7rem_1fr_auto] sm:items-center">
        {e.coverImage ? (
          <Image src={e.coverImage} alt="" width={1080} height={1920} sizes="7rem" className="aspect-[3/4] w-full rounded-lg object-cover" />
        ) : (
          <span aria-hidden className="aspect-[3/4] w-full bg-night-2" />
        )}
        <span>
          <span className="t-h3 block group-hover:text-sable">{e.name}</span>
          <span className="mt-1 block text-muted first-letter:uppercase">
            {formatDate(e.startsAt, lang)}, {formatTime(e.startsAt, lang)}
          </span>
          <span className="block text-muted">{e.venueName}</span>
          {e.status === "sold_out" && <span className="mt-2 inline-block text-terra">{dict.events.soldOut}</span>}
          {e.status === "cancelled" && <span className="mt-2 inline-block text-terra">{dict.events.cancelled}</span>}
        </span>
        <span className="col-start-2 text-sable sm:col-start-auto">{dict.home.details}</span>
      </Link>
    </li>
  );
}

export default async function EventsPage({ params }: PageProps<"/[lang]/evenements">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const { upcoming, past } = await listPublicEvents(getStore());

  return (
    <div className="mx-auto max-w-5xl px-5 pt-28 sm:px-6 md:pt-36 lg:px-10">
      <h1 className="t-h1"><SplitTitle text={dict.events.title} /></h1>
      <p className="mt-5 max-w-xl text-muted">{dict.events.intro}</p>

      <section className="mt-14" aria-labelledby="a-venir">
        <h2 id="a-venir" className="mb-2 text-muted">{dict.events.upcoming}</h2>
        {upcoming.length ? (
          <ul className="border-t border-line">
            {upcoming.map((e) => <Row key={e.id} e={e} lang={lang} dict={dict} />)}
          </ul>
        ) : (
          <p className="border-t border-line pt-6 text-muted">{dict.events.empty}</p>
        )}
      </section>

      {past.length > 0 && (
        <section className="mt-24 md:mt-32" aria-labelledby="passes">
          <h2 id="passes" className="t-h2">{dict.events.past}</h2>
          <p className="mt-3 text-muted">{dict.events.pastIntro}</p>
          <ul className="mt-10 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((e) => {
              const img = e.heroImage ?? e.coverImage;
              return (
                <li key={e.id}>
                  <Link href={`/${lang}/evenements/${e.slug}`} className="group block">
                    <span className="relative block aspect-[4/5] overflow-hidden rounded-2xl bg-night-2">
                      {img && (
                        <Image
                          src={img}
                          alt={e.name}
                          fill
                          sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 100vw"
                          className="object-cover transition duration-700 group-hover:scale-105"
                        />
                      )}
                      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-night/80 via-transparent to-transparent" />
                      <span className="absolute bottom-4 left-4 text-sm text-ink/85 first-letter:uppercase">
                        {formatDate(e.startsAt, lang, { weekday: undefined, day: undefined, year: "numeric" })}
                      </span>
                    </span>
                    <span className="mt-4 block font-display text-2xl leading-tight transition-colors group-hover:text-sable">{e.name}</span>
                    <span className="block text-sm text-muted">{e.venueName}, {e.city}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
