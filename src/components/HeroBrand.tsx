"use client";

import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export interface HeroImage {
  src: string;
  alt: string;
}

/**
 * Home hero, deliberately bare: the aerial show photos, always shown whole and in their
 * original colours, at screen height. A blurred copy of the same photo fills the
 * leftover space on wide screens. The photos cross-fade every few seconds.
 * The brand name stays in the logo; the h1 is for screen readers and search engines.
 */
export function HeroBrand({ images, children }: { images: HeroImage[]; children?: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0.2]);

  useEffect(() => {
    if (reduce || images.length < 2) return;
    const t = setInterval(() => {
      if (!document.hidden) setI((n) => (n + 1) % images.length);
    }, 5500);
    return () => clearInterval(t);
  }, [reduce, images.length]);

  const img = images[i];
  return (
    <section ref={ref} className="relative h-[100svh] min-h-[32rem] overflow-hidden bg-night">
      <h1 className="sr-only">Sayd Social Club</h1>
      <motion.div className="absolute inset-0" style={reduce ? undefined : { y, opacity: fade }}>
        <AnimatePresence initial={false}>
          <motion.div
            key={img.src}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Leftover space: the same photo, blurred and dimmed */}
            <Image src={img.src} alt="" aria-hidden fill sizes="40vw" priority={i === 0} className="scale-110 object-cover opacity-50 blur-2xl" />
            {/* The photo itself, whole */}
            <Image src={img.src} alt={img.alt} fill sizes="(min-width: 768px) 60vw, 100vw" priority={i === 0} className="object-contain" />
          </motion.div>
        </AnimatePresence>
      </motion.div>
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-night to-transparent" />
      {children && <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-7xl px-5 pb-8 sm:px-6 md:pb-12 lg:px-10">{children}</div>}
    </section>
  );
}
