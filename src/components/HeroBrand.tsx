"use client";

import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export interface CoverSlide {
  /** Portrait photo, used on phones. */
  portrait: string;
  /** Landscape photo, used from 768 px. */
  land: string;
  alt: string;
}

/**
 * Full-bleed cinematic cover (home and gallery). Each slide fills the screen edge to
 * edge, right up under the navigation, in its original colours: a portrait photo on
 * phones, a landscape one on larger screens. Slides cross-fade every few seconds with
 * a slow push-in, and the cover drifts gently as you scroll away.
 */
export function HeroBrand({
  slides,
  title,
  className = "h-[100svh] min-h-[34rem]",
  children,
}: {
  slides: CoverSlide[];
  /** Visible heading (gallery). Without it, an h1 is kept for screen readers only. */
  title?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);

  useEffect(() => {
    if (reduce || slides.length < 2) return;
    const t = setInterval(() => {
      if (!document.hidden) setI((n) => (n + 1) % slides.length);
    }, 6000);
    return () => clearInterval(t);
  }, [reduce, slides.length]);

  const s = slides[i];
  return (
    <section ref={ref} className={`relative overflow-hidden bg-night ${className}`}>
      {!title && <h1 className="sr-only">Sayd Social Club</h1>}
      <motion.div className="absolute inset-0" style={reduce ? undefined : { y }}>
        <AnimatePresence initial={false}>
          <motion.div
            key={s.land}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: "easeInOut" }}
          >
            <motion.div
              className="absolute inset-0"
              initial={reduce ? false : { scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 7, ease: "linear" }}
            >
              <Image src={s.portrait} alt={s.alt} fill priority={i === 0} sizes="100vw" className="object-cover md:hidden" />
              <Image src={s.land} alt={s.alt} fill priority={i === 0} sizes="100vw" className="hidden object-cover md:block" />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
      {/* Soft fades only where text sits (logo on top, title or button at the bottom) */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-night/45 to-transparent" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-night via-night/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-7xl px-5 pb-8 sm:px-6 md:pb-12 lg:px-10">
        {title}
        {children}
      </div>
      {slides.length > 1 && (
        <div className="absolute bottom-5 right-5 flex gap-1.5 sm:right-6 md:bottom-8 lg:right-10" aria-hidden>
          {slides.map((sl, n) => (
            <span key={sl.land} className={`h-0.5 rounded-full transition-all duration-700 ${n === i ? "w-6 bg-ink" : "w-3 bg-ink/35"}`} />
          ))}
        </div>
      )}
    </section>
  );
}
