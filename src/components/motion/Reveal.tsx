"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";

type Kind = "fade" | "mask";

/**
 * Enters once when scrolled into view.
 * - "fade": short rise + fade, for text blocks.
 * - "mask": the frame opens from the bottom (clip-path), for images.
 */
export function Reveal({
  kind = "fade",
  delay = 0,
  children,
  className,
  ...rest
}: { kind?: Kind; delay?: number } & HTMLMotionProps<"div">) {
  const reduce = useReducedMotion();
  const hidden =
    kind === "mask" ? { clipPath: "inset(100% 0% 0% 0%)", scale: 1.06 } : { opacity: 0, y: 28 };
  const shown = kind === "mask" ? { clipPath: "inset(0% 0% 0% 0%)", scale: 1 } : { opacity: 1, y: 0 };
  return (
    <motion.div
      className={className}
      initial={reduce ? false : hidden}
      whileInView={shown}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: kind === "mask" ? 1.15 : 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
