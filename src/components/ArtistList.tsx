"use client";

import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import Image from "next/image";
import { useState } from "react";

export interface ArtistRow {
  name: string;
  meta: string; // "DJ · France"
  badge?: string;
  href?: string;
  image: string;
}

/**
 * Big typographic list of names. On desktop, hovering a name brings up a photo that
 * follows the cursor; on touch screens rows simply rise in as you scroll.
 */
export function ArtistList({ rows }: { rows: ArtistRow[] }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<number | null>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 300, damping: 30 });
  const y = useSpring(useMotionValue(0), { stiffness: 300, damping: 30 });

  return (
    <div
      className="relative"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - r.left);
        y.set(e.clientY - r.top);
      }}
      onPointerLeave={() => setActive(null)}
    >
      <ul>
        {rows.map((r, i) => {
          const content = (
            <>
              <span className="font-display text-[clamp(2.6rem,11vw,7.5rem)] leading-[0.95] transition-colors duration-500 group-hover:text-sable">
                {r.name}
              </span>
              <span className="flex flex-wrap items-center gap-3 text-ink/70 md:justify-end">
                <span>{r.meta}</span>
                {r.badge && <span className="rounded-full bg-sable/15 px-3 py-1 text-xs font-semibold text-sable">{r.badge}</span>}
              </span>
            </>
          );
          return (
            <motion.li
              key={r.name}
              initial={reduce ? false : { opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -10% 0px" }}
              transition={{ duration: 0.8, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
            >
              {r.href ? (
                <a href={r.href} target="_blank" rel="noopener noreferrer" className="group grid gap-2 py-5 md:grid-cols-[1fr_auto] md:items-end">
                  {content}
                </a>
              ) : (
                <div className="group grid gap-2 py-5 md:grid-cols-[1fr_auto] md:items-end">{content}</div>
              )}
            </motion.li>
          );
        })}
      </ul>

      {!reduce && (
        <AnimatePresence>
          {active !== null && (
            <motion.div
              key={active}
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 z-10 hidden h-64 w-48 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl md:block"
              style={{ x, y }}
              initial={{ opacity: 0, scale: 0.8, rotate: -6 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image src={rows[active].image} alt="" fill sizes="12rem" className="object-cover" />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
