"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { ShaderBackdrop } from "./motion/ShaderBackdrop";

/**
 * Home hero: the crowd photo, lit by an animated shader, slowly zooms while the
 * content lifts away on scroll. The brand name stays in the logo; the h1 is kept
 * for screen readers and search engines only.
 */
export function HeroBrand({ image, children }: { image: string; children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.05, 1.25]);
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const still = Boolean(reduce);

  return (
    <section ref={ref} className="relative flex min-h-[88svh] flex-col justify-end overflow-hidden md:min-h-[84svh]">
      <motion.div aria-hidden className="grain absolute inset-0" style={still ? undefined : { scale }}>
        <Image src={image} alt="" fill priority sizes="100vw" className="object-cover object-[50%_35%]" />
      </motion.div>
      {/* Living light over the photo */}
      <div aria-hidden className="absolute inset-0 opacity-40 mix-blend-screen">
        <ShaderBackdrop />
      </div>
      {/* Fades into the page colour: no visible bottom edge */}
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(18,15,14,0.55)_0%,rgba(18,15,14,0.2)_35%,rgba(18,15,14,0.75)_75%,#120f0e_100%)]" />

      <motion.div style={still ? undefined : { y, opacity }} className="relative mx-auto w-full max-w-7xl px-5 pb-10 pt-32 sm:px-6 md:pb-14 lg:px-10">
        <h1 className="sr-only">Sayd Social Club</h1>
        {children}
      </motion.div>
    </section>
  );
}
