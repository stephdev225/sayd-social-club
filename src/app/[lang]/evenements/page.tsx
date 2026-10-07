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

function Row({ e, lang, dict, past }: { e: SaydEvent; lang: Locale; dict: Dictionary; past?: boolean }) {
  return (
    <li className="border-b border-line">
      <Link href={`/${lang}/evenements/${e.slug}`} className="group grid grid-cols-[5.5rem_1fr] gap-5 py-6 sm:grid-cols-[7rem_1fr_auto] sm:items-center">
        {e.coverImage ? (
          <Image src={e.coverImage} alt="" width={1080} height={1920} sizes="7rem" className={`aspect-[3/4] w-full object-cover ${past ? "opacity-60 grayscale" : ""}`} />
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
        {!past && <span className="col-start-2 text-sable sm:col-start-auto">{dict.home.details}</span>}
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
        <section className="mt-16" aria-labelledby="passes">
          <h2 id="passes" className="mb-2 text-muted">{dict.events.past}</h2>
          <ul className="border-t border-line">
            {past.map((e) => <Row key={e.id} e={e} lang={lang} dict={dict} past />)}
          </ul>
        </section>
      )}
    </div>
  );
}
