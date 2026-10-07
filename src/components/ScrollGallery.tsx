"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

export interface ScrollPhoto {
  src: string;
  alt: string;
  portrait: boolean;
}

/**
 * Two rows of photos that slide in opposite directions while the page scrolls,
 * like a film strip. Every photo leads to the gallery.
 */
export function ScrollGallery({ photos, href }: { photos: ScrollPhoto[]; href: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x1 = useTransform(scrollYProgress, [0, 1], ["2%", "-28%"]);
  const x2 = useTransform(scrollYProgress, [0, 1], ["-28%", "2%"]);
  const half = Math.ceil(photos.length / 2);
  const rows = [photos.slice(0, half), photos.slice(half)];

  return (
    <div ref={ref} className="space-y-3 overflow-hidden md:space-y-5">
      {rows.map((row, r) => (
        <motion.div key={r} className="flex w-max gap-3 md:gap-5" style={reduce ? undefined : { x: r === 0 ? x1 : x2 }}>
          {[...row, ...row].map((p, i) => (
            <Link
              key={`${r}-${i}`}
              href={href}
              tabIndex={i >= row.length ? -1 : undefined}
              aria-hidden={i >= row.length ? true : undefined}
              className="group relative block h-[34vw] shrink-0 overflow-hidden rounded-2xl md:h-[21vw] md:max-h-[22rem]"
              style={{ aspectRatio: p.portrait ? "4 / 5" : "3 / 2" }}
            >
              <Image
                src={p.src}
                alt={i >= row.length ? "" : p.alt}
                fill
                sizes="(min-width: 768px) 30vw, 50vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
            </Link>
          ))}
        </motion.div>
      ))}
    </div>
  );
}
