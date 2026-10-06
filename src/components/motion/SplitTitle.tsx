"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * The hero's one orchestrated moment: letters rise out of a mask, staggered.
 * Letters are grouped per word so a line can only break between words.
 * Screen readers get the plain text.
 */
export function SplitTitle({ text, className = "", delay = 0.15 }: { text: string; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  let index = 0;
  return (
    <span className={className} aria-label={text}>
      {text.split(" ").map((word, w) => (
        <span key={w} aria-hidden className="inline-block overflow-hidden whitespace-nowrap pb-[0.12em] align-bottom">
          {[...word].map((ch) => {
            const i = index++;
            return (
              <motion.span
                key={i}
                className="inline-block will-change-transform"
                initial={reduce ? false : { y: "105%", opacity: 0, filter: "blur(6px)" }}
                animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.9, delay: delay + i * 0.045, ease: [0.22, 1, 0.36, 1] }}
              >
                {ch}
              </motion.span>
            );
          })}
          {w < text.split(" ").length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </span>
  );
}
