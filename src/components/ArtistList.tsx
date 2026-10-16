"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";

export interface ArtistRow {
  name: string;
  meta: string; // "DJ · France"
  badge?: string;
  href?: string;
  handle?: string;
  image?: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Artist cards: the photo is always visible (phones first), the name links to the
 * artist's Instagram. Photos open like a curtain as they scroll into view.
 */
export function ArtistList({ rows }: { rows: ArtistRow[] }) {
  const reduce = useReducedMotion();
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((r, i) => {
        const inner = (
          <>
            <motion.div
              className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-night-2"
              initial={reduce ? false : { clipPath: "inset(18% 10% 18% 10% round 1rem)" }}
              whileInView={{ clipPath: "inset(0% 0% 0% 0% round 1rem)" }}
              viewport={{ once: true, margin: "0px 0px -12% 0px" }}
              transition={{ duration: 1.1, delay: (i % 3) * 0.08, ease: EASE }}
            >
              {r.image ? (
                <Image
                  src={r.image}
                  alt={r.name}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-[1.2s] ease-out group-hover:scale-[1.04]"
                />
              ) : (
                <div aria-hidden className="absolute inset-0 grid place-items-center">
                  <span className="font-display text-[7rem] leading-none text-ink/10">
                    {r.name.replace(/^DJ\s+/i, "").slice(0, 1)}
                  </span>
                </div>
              )}
              <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-night/90 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="font-display text-[clamp(2.2rem,8vw,3rem)] leading-none">{r.name}</p>
                <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-ink/80">
                  <span>{r.meta}</span>
                  {r.badge && <span className="rounded-full border border-ink/30 px-2.5 py-0.5 text-xs">{r.badge}</span>}
                </p>
              </div>
            </motion.div>
            {r.handle && <p className="mt-3 text-sm text-ink/70 group-hover:text-ink">{r.handle} ↗</p>}
          </>
        );
        return (
          <li key={r.name}>
            {r.href ? (
              <a href={r.href} target="_blank" rel="noopener noreferrer" className="group block" aria-label={`${r.name} — Instagram`}>
                {inner}
              </a>
            ) : (
              <div className="group">{inner}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
