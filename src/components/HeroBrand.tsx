"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { SplitTitle } from "./motion/SplitTitle";

/**
 * Full-screen brand hero. On scroll the photo slowly zooms and the wordmark
 * drifts up and fades, so the page "opens" into the next section.
 */
export function HeroBrand({ image, children }: { image: string; children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.05, 1.25]);
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="relative flex min-h-[88svh] flex-col justify-end overflow-hidden md:min-h-[84svh]">
      <motion.div aria-hidden className="grain absolute inset-0" style={reduce ? undefined : { scale }}>
        <Image src={image} alt="" fill priority sizes="100vw" className="object-cover object-[50%_35%]" />
      </motion.div>
      {/* Fades into the page colour: no visible bottom edge */}
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(18,15,14,0.55)_0%,rgba(18,15,14,0.25)_35%,rgba(18,15,14,0.75)_75%,#120f0e_100%)]" />

      <motion.div style={reduce ? undefined : { y, opacity }} className="relative mx-auto w-full max-w-7xl px-5 pb-10 pt-32 sm:px-6 md:pb-14 lg:px-10">
        <h1 className="font-display text-[clamp(3.4rem,15vw,9rem)] font-medium leading-[0.82] tracking-[-0.045em] text-ink">
          <SplitTitle text="Sayd" />
          <br />
          <SplitTitle text="Social" delay={0.35} />
          <span className="italic text-sable"> <SplitTitle text="Club" delay={0.65} /></span>
        </h1>
        {children}
      </motion.div>
    </section>
  );
}
