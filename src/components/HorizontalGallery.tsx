"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

export interface GalleryItem {
  src: string;
  alt: string;
  portrait: boolean;
}

/**
 * Desktop: the section pins and the photo strip slides sideways as you scroll down.
 * Mobile / reduced motion: a native swipeable row with snap points.
 */
export function HorizontalGallery({ items, title, note }: { items: GalleryItem[]; title: string; note: string }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-48%"]);

  const card = (it: GalleryItem, i: number, sizes: string) => (
    <figure
      key={it.src}
      className={`relative shrink-0 snap-start overflow-hidden bg-night-2 ${it.portrait ? "aspect-[3/4] w-[62vw] sm:w-[34vw] lg:w-[24vw]" : "aspect-[4/3] w-[82vw] sm:w-[52vw] lg:w-[38vw]"} ${i % 2 ? "lg:mt-24" : ""}`}
    >
      <Image src={it.src} alt={it.alt} fill sizes={sizes} className="object-cover transition duration-[1.2s] ease-out hover:scale-[1.04]" />
    </figure>
  );

  return (
    <section ref={ref} aria-label={title} className="relative lg:h-[260vh]">
      <div className="lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col lg:justify-center lg:overflow-hidden">
        <div className="mx-auto mb-8 w-full max-w-7xl px-4 sm:px-6 lg:px-10">
          <h2 className="t-h2">{title}</h2>
          <p className="mt-3 max-w-xl text-muted">{note}</p>
        </div>
        {/* Desktop pinned strip */}
        <motion.div style={reduce ? undefined : { x }} className="hidden gap-6 pl-10 lg:flex">
          {items.map((it, i) => card(it, i, "38vw"))}
        </motion.div>
        {/* Mobile swipe row */}
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:px-6 lg:hidden [scrollbar-width:none]">
          {items.map((it, i) => card(it, i, "82vw"))}
        </div>
      </div>
    </section>
  );
}
