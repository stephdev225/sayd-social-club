import Image from "next/image";
import Link from "next/link";
import type { NextEventSummary } from "@/lib/data/next-event";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Countdown } from "./Countdown";
import { LineReveal } from "./motion/LineReveal";
import { Magnetic } from "./motion/Magnetic";
import { Reveal } from "./motion/Reveal";

/** End-of-page call to action: the next party, its date, price and a ticket button. */
export function NextEventCTA({ next, dict, lang }: { next: NextEventSummary | null; dict: Dictionary; lang: "fr" | "en" }) {
  if (!next) return null;
  return (
    <section className="relative isolate mt-12 overflow-hidden md:mt-24" aria-labelledby="cta-next">
      {next.image && (
        <div aria-hidden className="absolute inset-0 -z-10">
          <Image src={next.image} alt="" fill sizes="100vw" className="object-cover opacity-45" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#120f0e_0%,rgba(18,15,14,0.55)_35%,rgba(18,15,14,0.7)_70%,#120f0e_100%)]" />
        </div>
      )}
      <div className="mx-auto max-w-7xl px-5 py-28 sm:px-6 md:py-40 lg:px-10">
        <Reveal><p className="text-sable">{dict.home.nextShort} · {next.dateShort} · {next.venue}</p></Reveal>
        <LineReveal id="cta-next" text={next.name} className="mt-3 font-display text-[clamp(3.4rem,14vw,8rem)] leading-[0.86]" />
        <Reveal delay={0.1}>
          <p className="mt-6 max-w-lg text-lg text-ink/85">{dict.funnel.ctaText}</p>
          <div className="mt-8"><Countdown to={next.startsAt} lang={lang} /></div>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Magnetic>
              <Link
                href={next.ticketsHref}
                className="group inline-flex min-h-14 items-center gap-3 rounded-full bg-sable px-8 py-4 text-base font-semibold text-night transition hover:brightness-110"
              >
                {dict.funnel.cta}
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </Magnetic>
            <Link href={next.href} className="link-draw pb-1 text-ink/85">{dict.funnel.ctaSecondary}</Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
