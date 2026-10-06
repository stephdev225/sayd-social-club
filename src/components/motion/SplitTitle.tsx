"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * The hero's one orchestrated moment: letters rise out of a mask, staggered.
 * Screen readers get the plain text.
 */
export function SplitTitle({ text, className = "", delay = 0.15 }: { text: string; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <span className={className} aria-label={text}>
      <span aria-hidden className="inline-block overflow-hidden pb-[0.12em] align-bottom">
        {[...text].map((ch, i) => (
          <motion.span
            key={i}
            className="inline-block will-change-transform"
            initial={reduce ? false : { y: "105%", opacity: 0, filter: "blur(6px)" }}
            animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.9, delay: delay + i * 0.045, ease: [0.22, 1, 0.36, 1] }}
          >
            {ch === " " ? " " : ch}
          </motion.span>
        ))}
      </span>
    </span>
  );
}
