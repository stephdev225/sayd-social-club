"use client";

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { useRef } from "react";

function wrap(min: number, max: number, v: number) {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
}

/**
 * Infinite band that drifts on its own, speeds up with scroll speed
 * and reverses when you scroll back up.
 */
export function VelocityMarquee({ items, baseVelocity = -2.2, className = "" }: { items: string[]; baseVelocity?: number; className?: string }) {
  const reduce = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [0, 1000], [0, 5], { clamp: false });
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);
  const dir = useRef(1);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    const f = factor.get();
    if (f < 0) dir.current = -1;
    else if (f > 0) dir.current = 1;
    baseX.set(baseX.get() + dir.current * baseVelocity * (delta / 1000) * (1 + Math.abs(f)));
  });

  const row = (
    <span className="flex shrink-0 items-center" aria-hidden>
      {items.map((t, i) => (
        <span key={i} className="flex items-center whitespace-nowrap">
          <span className="px-6 sm:px-10">{t}</span>
          <span className="text-[0.45em] text-sable">✦</span>
        </span>
      ))}
    </span>
  );

  return (
    <div className={`overflow-hidden ${className}`}>
      <p className="sr-only">{items.join(", ")}</p>
      <motion.div style={{ x }} className="flex w-max">
        {row}
        {row}
      </motion.div>
    </div>
  );
}
