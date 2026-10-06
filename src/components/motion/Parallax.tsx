"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

/** Moves its child slower than the page (amount = % of height, e.g. 12). */
export function Parallax({ children, amount = 12, className = "" }: { children: React.ReactNode; amount?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${amount}%`, `${amount}%`]);
  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div style={reduce ? undefined : { y, scale: 1 + amount / 50 }} className="h-full w-full will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}
