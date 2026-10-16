"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { VideoLoop } from "./VideoLoop";

export interface PastEventItem {
  id: string;
  href: string;
  name: string;
  place: string;
  date?: string;
  video?: string;
  image?: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Past parties as an editorial wall: two staggered columns, the right one starting lower
 * and drifting into line as you scroll. Each clip opens like a curtain when it enters and
 * plays only while on screen. With an odd number of parties, a closing panel ends the
 * shorter column, so both columns finish level. Phones: one column, same order.
 */
export function PastEvents({
  items,
  closing,
  heading,
}: {
  items: PastEventItem[];
  closing: { title: string; text: string; cta: string; href: string };
  /** Section title: above the list on phones, in the top of the right column on larger screens. */
  heading: React.ReactNode;
}) {
  const reduce = Boolean(useReducedMotion());
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 22, mass: 0.4 });
  const drift = useTransform(smooth, [0, 1], [60, 0]);

  const odd = items.length % 2 === 1;
  const left = items.filter((_, i) => i % 2 === 0);
  const right = items.filter((_, i) => i % 2 === 1);
  const closingTile = <Closing {...closing} reduce={reduce} />;

  return (
    <div ref={ref}>
      {/* Phones: one column */}
      <div className="mb-10 md:hidden">{heading}</div>
      <ul className="grid gap-12 md:hidden">
        {items.map((e, i) => (
          <Card key={e.id} e={e} n={i + 1} reduce={reduce} />
        ))}
        {odd && <li>{closingTile}</li>}
      </ul>

      {/* Larger screens: two staggered columns */}
      <div className="hidden gap-8 md:grid md:grid-cols-2 lg:gap-12">
        <ul className="flex flex-col gap-14">
          {left.map((e) => (
            <Card key={e.id} e={e} n={items.indexOf(e) + 1} reduce={reduce} />
          ))}
        </ul>
        <motion.ul className="flex flex-col gap-14" style={reduce ? undefined : { y: drift }}>
          {/* Half a card high: the section title sits here, so the right column starts lower */}
          <li className="-mb-14 flex aspect-[2/1] flex-col justify-end pb-14">{heading}</li>
          {right.map((e) => (
            <Card key={e.id} e={e} n={items.indexOf(e) + 1} reduce={reduce} />
          ))}
          {odd && <li className="flex-1">{closingTile}</li>}
        </motion.ul>
      </div>
    </div>
  );
}

function Card({ e, n, reduce }: { e: PastEventItem; n: number; reduce: boolean }) {
  return (
    <li>
      <Link href={e.href} className="group block">
        <motion.span
          className="relative block aspect-[4/5] overflow-hidden bg-night"
          initial={reduce ? false : { clipPath: "inset(100% 0% 0% 0%)" }}
          whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
          viewport={{ once: true, margin: "0px 0px -12% 0px" }}
          transition={{ duration: 1.2, ease: EASE }}
        >
          <motion.span
            className="absolute inset-0 block"
            initial={reduce ? false : { scale: 1.25 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true, margin: "0px 0px -12% 0px" }}
            transition={{ duration: 1.6, ease: EASE }}
          >
            <span className="absolute inset-0 block transition-transform duration-[1.2s] ease-out group-hover:scale-[1.05]">
              {e.video ? (
                <VideoLoop src={e.video} poster={e.image} className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                e.image && (
                  <Image src={e.image} alt={e.name} fill sizes="(min-width: 768px) 46vw, 100vw" className="object-cover" />
                )
              )}
            </span>
          </motion.span>
          {/* Shade only under the words, then the bottom melts into the page */}
          <span aria-hidden className="absolute inset-0 bg-[linear-gradient(to_top,#120f0e_0%,rgba(18,15,14,0.55)_28%,transparent_55%)]" />
          <span className="absolute left-6 top-5 font-display text-lg italic text-ink/80 sm:left-8 sm:top-7">
            {String(n).padStart(2, "0")}
          </span>
          <span className="absolute inset-x-6 bottom-6 block sm:inset-x-8 sm:bottom-8">
            {e.date && <span className="block text-base text-ink/75 first-letter:uppercase">{e.date}</span>}
            <span className="mt-1 flex items-end justify-between gap-4">
              <span className="font-display text-[clamp(2rem,3.4vw,3rem)] leading-[0.95]">{e.name}</span>
              <span
                aria-hidden
                className="mb-1 grid h-11 w-11 shrink-0 place-items-center rounded-full border border-ink/30 text-lg transition duration-500 group-hover:border-sable group-hover:bg-sable"
              >
                →
              </span>
            </span>
            <span className="mt-2 block text-base text-ink/70">{e.place}</span>
          </span>
        </motion.span>
      </Link>
    </li>
  );
}

function Closing({ title, text, cta, href, reduce }: { title: string; text: string; cta: string; href: string; reduce: boolean }) {
  return (
    <motion.div
      className="relative isolate flex h-full min-h-[18rem] flex-col justify-end p-8 sm:p-10"
      initial={reduce ? false : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.9, ease: EASE }}
    >
      <div aria-hidden className="pointer-events-none absolute -inset-8 -z-10 bg-[radial-gradient(closest-side_at_40%_70%,rgba(193,18,31,0.22),transparent)] blur-2xl" />
      <p className="font-display text-[clamp(2rem,3.4vw,3rem)] leading-[1]">{title}</p>
      <p className="mt-4 max-w-sm text-lg text-ink/75">{text}</p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-sable px-7 py-3.5 text-lg font-semibold text-ink transition hover:brightness-110"
      >
        {cta} <span aria-hidden>↗</span>
      </a>
    </motion.div>
  );
}
