"use client";

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import Image from "next/image";
import { useRef } from "react";

export interface ExperienceItem {
  title: string;
  text: string;
  image: string;
  alt: string;
}

/**
 * "L'expérience Sayd": full-bleed photo cards that pin under the header and stack
 * on top of each other as you scroll. The card underneath steps back (smaller,
 * darker) while the photo of the incoming one settles from a slight zoom.
 */
export function ExperienceStack({ items }: { items: ExperienceItem[] }) {
  const container = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: container, offset: ["start start", "end end"] });

  return (
    <div ref={container} className="relative">
      {items.map((item, i) => (
        <Card key={item.title} item={item} index={i} total={items.length} progress={scrollYProgress} still={Boolean(reduce)} />
      ))}
    </div>
  );
}

function Card({
  item,
  index,
  total,
  progress,
  still,
}: {
  item: ExperienceItem;
  index: number;
  total: number;
  progress: MotionValue<number>;
  still: boolean;
}) {
  const wrapper = useRef<HTMLDivElement>(null);
  const { scrollYProgress: enter } = useScroll({ target: wrapper, offset: ["start end", "start start"] });
  const imageScale = useTransform(enter, [0, 1], [1.25, 1]);
  const last = index === total - 1;
  const targetScale = 1 - (total - 1 - index) * 0.05;
  const start = index / total;
  const scale = useTransform(progress, [start, 1], [1, last ? 1 : targetScale]);
  const dim = useTransform(progress, [start, start + 1 / total, 1], [0, last ? 0 : 0.35, last ? 0 : 0.55]);

  return (
    <div ref={wrapper} className={`sticky ${last ? "" : "mb-[12svh]"}`} style={{ top: `calc(5.5rem + ${index * 1.1}rem)` }}>
      <motion.article
        style={still ? undefined : { scale, transformOrigin: "50% 0%" }}
        className="relative h-[68svh] min-h-[26rem] overflow-hidden rounded-[1.75rem] bg-night-2 md:h-[56svh] md:min-h-[22rem] lg:h-[60svh] lg:max-h-[38rem]"
      >
        <motion.div className="absolute inset-0" style={still ? undefined : { scale: imageScale }}>
          <Image src={item.image} alt={item.alt} fill sizes="(min-width: 1024px) 1024px, 100vw" className="object-cover" />
        </motion.div>
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_top,rgba(18,15,14,0.92)_0%,rgba(18,15,14,0.35)_45%,rgba(18,15,14,0.1)_100%)]" />
        {!still && <motion.div aria-hidden className="pointer-events-none absolute inset-0 bg-night" style={{ opacity: dim }} />}

        <div className="absolute inset-x-0 bottom-0 grid gap-4 p-6 sm:p-10 md:grid-cols-[1fr_auto] md:items-end md:p-14">
          <div>
            <p className="font-display text-lg italic text-sable">
              {String(index + 1).padStart(2, "0")} <span className="text-ink/40">/ {String(total).padStart(2, "0")}</span>
            </p>
            <h3 className="mt-2 font-display text-[clamp(2.4rem,5.5vw,4.25rem)] leading-[0.92] tracking-[-0.02em]">{item.title}</h3>
          </div>
          <p className="max-w-sm text-base text-ink/85 md:pb-3 md:text-lg">{item.text}</p>
        </div>
      </motion.article>
    </div>
  );
}
