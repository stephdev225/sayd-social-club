"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";

export interface ExperienceItem {
  title: string;
  text: string;
  image: string;
  /** Landscape version for wide screens. */
  imageWide?: string;
  alt: string;
  pos?: string;
}

/**
 * « L'expérience Sayd »: the section pins to the screen and, while you keep scrolling
 * down, the three cards slide from right to left. Text sits on each photo.
 * Reduced motion: a plain stack, no pinning.
 */
export function ExperienceStack({ items }: { items: ExperienceItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 });
  const n = items.length;
  // The track is n cards wide; slide it until the last card is in view.
  const x = useTransform(smooth, [0.05, 0.95], ["0%", `-${((n - 1) / n) * 100}%`]);
  const bar = useTransform(smooth, [0.05, 0.95], ["0%", "100%"]);

  if (reduce) {
    return (
      <div className="mx-auto mt-10 grid max-w-7xl gap-5 px-5 sm:px-6 lg:px-10">
        {items.map((item, i) => (
          <Card key={item.title} item={item} index={i} total={n} />
        ))}
      </div>
    );
  }

  return (
    // Height = how long the pin lasts: one screen per card.
    <div ref={ref} className="relative" style={{ height: `${n * 100}svh` }}>
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        <motion.div className="flex will-change-transform" style={{ x, width: `${n * 100}%` }}>
          {items.map((item, i) => (
            <div key={item.title} className="px-5 sm:px-6 lg:px-10" style={{ width: `${100 / n}%` }}>
              <div className="mx-auto max-w-6xl">
                <Card item={item} index={i} total={n} />
              </div>
            </div>
          ))}
        </motion.div>
        <div className="mx-auto mt-6 h-px w-40 overflow-hidden bg-ink/15" aria-hidden>
          <motion.div className="h-full bg-ink" style={{ width: bar }} />
        </div>
      </div>
    </div>
  );
}

function Card({ item, index, total }: { item: ExperienceItem; index: number; total: number }) {
  return (
    <article className="relative h-[70svh] min-h-[24rem] overflow-hidden rounded-[1.75rem] bg-night-2 md:h-auto md:min-h-0 md:aspect-[16/9] md:max-h-[74svh] md:w-full">
      <Image src={item.image} alt={item.alt} fill sizes="100vw" className={`object-cover ${item.imageWide ? "md:hidden" : ""}`} style={{ objectPosition: item.pos }} />
      {item.imageWide && <Image src={item.imageWide} alt={item.alt} fill sizes="(min-width: 1024px) 1152px, 100vw" className="hidden object-cover md:block" />}
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_top,rgba(18,15,14,0.88)_0%,rgba(18,15,14,0.35)_38%,transparent_62%)]" />
      <div className="absolute inset-x-0 bottom-0 grid gap-4 p-6 sm:p-10 md:grid-cols-[1fr_auto] md:items-end md:p-12">
        <div>
          <p className="font-display text-lg italic text-ink/80">
            {String(index + 1).padStart(2, "0")} <span className="text-ink/50">/ {String(total).padStart(2, "0")}</span>
          </p>
          <h3 className="mt-2 font-display text-[clamp(2.4rem,5.5vw,4.25rem)] leading-[0.92] tracking-[-0.02em]">{item.title}</h3>
        </div>
        <p className="max-w-md text-lg text-ink/90 md:pb-2 md:text-xl">{item.text}</p>
      </div>
    </article>
  );
}
