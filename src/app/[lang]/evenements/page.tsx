import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { alternates } from "@/lib/seo";
import { SplitTitle } from "@/components/motion/SplitTitle";
import { PastEvents } from "@/components/PastEvents";
import { site } from "@/lib/site";
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
          <span className="t-h3 block group-hover:text-ink">{e.name}</span>
          <span className="mt-1 block text-muted first-letter:uppercase">
            {formatDate(e.startsAt, lang)}, {formatTime(e.startsAt, lang)}
          </span>
          <span className="block text-muted">{e.venueName}</span>
          {e.status === "sold_out" && <span className="mt-2 inline-block text-terra">{dict.events.soldOut}</span>}
          {e.status === "cancelled" && <span className="mt-2 inline-block text-terra">{dict.events.cancelled}</span>}
        </span>
        <span className="col-start-2 text-ink sm:col-start-auto">{dict.home.details}</span>
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
    <div className="mx-auto max-w-6xl px-5 pt-28 sm:px-6 md:pt-36 lg:px-10">
      <h1 className="t-h1"><SplitTitle text={dict.events.title} /></h1>
      <p className="mt-5 max-w-xl text-lg text-ink/80">{dict.events.intro}</p>

      {/* Only shown when a date is announced: no "nothing planned" message */}
      {upcoming.length > 0 && (
        <section className="mt-14" aria-labelledby="a-venir">
          <h2 id="a-venir" className="mb-2 text-lg text-muted">{dict.events.upcoming}</h2>
          <ul className="border-t border-line">
            {upcoming.map((e) => <Row key={e.id} e={e} lang={lang} dict={dict} />)}
          </ul>
        </section>
      )}

      <section className="mt-24 md:mt-32" aria-label={dict.events.past}>
          {past.length === 0 ? (
            <>
            <h2 className="t-h2 mb-10">{dict.events.past}</h2>
            <div className="grid max-w-4xl gap-5 sm:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-night-2">
                  <div aria-hidden className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_30%_20%,rgba(193,18,31,0.14),transparent_60%)]" />
                  {i === 0 && <p className="absolute inset-x-5 bottom-5 text-sm text-ink/70">{dict.events.pastEmpty}</p>}
                </div>
              ))}
            </div>
            </>
          ) : (
            <div>
              <PastEvents
                heading={<h2 className="t-h2">{dict.events.past}</h2>}
                items={past.map((e) => ({
                  id: e.id,
                  href: `/${lang}/evenements/${e.slug}`,
                  name: e.name,
                  place: [e.venueName, e.city].filter(Boolean).join(", "),
                  date: e.dateHidden ? undefined : formatDate(e.startsAt, lang, { weekday: undefined, day: undefined, year: "numeric" }),
                  video: e.videoLoop,
                  image: e.heroImage ?? e.coverImage,
                }))}
                closing={{ title: dict.events.nextTitle, text: dict.events.nextText, cta: dict.events.nextCta, href: site.instagram }}
              />
            </div>
          )}
        </section>
    </div>
  );
}
