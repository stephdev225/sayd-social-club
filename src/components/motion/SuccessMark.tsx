"use client";

import { motion, useReducedMotion } from "motion/react";

/** Circle + check drawn once when the payment is confirmed. */
export function SuccessMark() {
  const reduce = useReducedMotion();
  const draw = (delay: number) =>
    reduce ? {} : { initial: { pathLength: 0 }, animate: { pathLength: 1 }, transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const } };
  return (
    <svg viewBox="0 0 64 64" className="mb-6 h-16 w-16 text-bottle-ink" aria-hidden>
      <motion.circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" strokeWidth="2" {...draw(0)} />
      <motion.path d="M20 33 l8 8 l16 -18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...draw(0.5)} />
    </svg>
  );
}
