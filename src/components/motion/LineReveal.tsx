"use client";

import { motion, useReducedMotion } from "motion/react";

/** Title whose words rise out of a mask when it scrolls into view. */
export function LineReveal({ text, className = "", as = "h2", id }: { text: string; className?: string; as?: "h1" | "h2" | "h3" | "p"; id?: string }) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  return (
    <Tag
      id={id}
      className={className}
      aria-label={text}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ staggerChildren: 0.07 }}
    >
      {text.split(" ").map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.1em] align-bottom">
          <motion.span
            className="inline-block"
            variants={reduce ? {} : { hidden: { y: "110%", rotate: 4 }, shown: { y: "0%", rotate: 0 } }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          >
            {w}
            {" "}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
