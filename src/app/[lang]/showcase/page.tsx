import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { alternates } from "@/lib/seo";
import { ArtistList } from "@/components/ArtistList";
import { NextEventCTA } from "@/components/NextEventCTA";
import { LineReveal } from "@/components/motion/LineReveal";
import { Reveal } from "@/components/motion/Reveal";
import { VelocityMarquee } from "@/components/motion/VelocityMarquee";
import { artists, type Artist } from "@/lib/artists";
import { getNextEventSummary } from "@/lib/data/next-event";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata({ params }: PageProps<"/[lang]/showcase">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.showcase.title, description: dict.showcase.intro, alternates: alternates(lang, "/showcase") };
}

export default async function ShowcasePage({ params }: PageProps<"/[lang]/showcase">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const s = dict.showcase;
  const next = await getNextEventSummary(lang);

  const row = (a: Artist) => ({
    name: a.name,
    meta: [a.role[lang], a.origin?.[lang]].filter(Boolean).join(" · "),
    badge: a.origin ? s.international : undefined,
    href: a.instagram,
    handle: a.instagram ? "@" + a.instagram.replace(/\/$/, "").split("/").pop() : undefined,
    image: a.image,
  });
  const groups: { key: Artist["status"]; title: string }[] = [
    { key: "current", title: s.current },
    { key: "upcoming", title: s.upcoming },
    { key: "past", title: s.past },
  ];

  return (
    <>
      <div className="mx-auto max-w-7xl px-5 pt-28 sm:px-6 md:pt-36 lg:px-10">
        <LineReveal as="h1" text={s.title} className="t-hero" />
        <Reveal delay={0.2}><p className="mt-6 max-w-xl text-lg text-ink/85">{s.intro}</p></Reveal>
      </div>

      <VelocityMarquee items={artists.map((a) => a.name)} className="my-16 font-display text-[clamp(3rem,12vw,9rem)] italic leading-none text-ink/15 md:my-24" />

      <div className="mx-auto max-w-7xl space-y-20 px-5 sm:px-6 lg:px-10">
        {groups.map((g) => {
          const list = artists.filter((a) => a.status === g.key);
          if (list.length === 0) return null;
          const rows = list.map(row);
          return (
            <section key={g.key} aria-label={g.title}>
              <Reveal><h2 className="mb-8 font-display text-[clamp(2rem,4vw,3rem)] leading-none">{g.title}</h2></Reveal>
              <ArtistList rows={rows} />
              {g.key === "current" && next && (
                <Reveal>
                  <Link href={next.ticketsHref} className="mt-6 inline-flex min-h-12 items-center gap-3 rounded-full bg-sable px-7 font-semibold text-ink transition hover:brightness-110">
                    {dict.funnel.cta} · {next.name}, {next.dateShort} <span aria-hidden>→</span>
                  </Link>
                </Reveal>
              )}
            </section>
          );
        })}

        <section className="max-w-2xl" aria-labelledby="booking">
          <LineReveal id="booking" text={s.booking} className="t-h2" />
          <Reveal delay={0.1}>
            <p className="mt-4 text-ink/75">{s.bookingText}</p>
            <Link href={`/${lang}/contact`} className="link-draw mt-6 inline-block pb-1 text-ink">{s.bookingCta} →</Link>
          </Reveal>
        </section>
      </div>

      <NextEventCTA next={next} dict={dict} lang={lang} />
    </>
  );
}
