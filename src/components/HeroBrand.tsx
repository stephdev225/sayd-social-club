"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";

export interface HeroSlide {
  src: string;
  alt: string;
}

/**
 * Page opening (home and gallery): the words on one side, a framed photo on the other.
 * The photo is shown at a size where it stays sharp (no full-screen upscaling, no zoom),
 * and cross-fades to the next one every few seconds. Phones: text first, photo below.
 */
export function HeroBrand({ slides, children, priority = true }: { slides: HeroSlide[]; children: React.ReactNode; priority?: boolean }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduce || slides.length < 2) return;
    const t = setInterval(() => {
      if (!document.hidden) setI((n) => (n + 1) % slides.length);
    }, 5000);
    return () => clearInterval(t);
  }, [reduce, slides.length]);

  const s = slides[i];
  return (
    <section className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 pb-12 pt-28 sm:px-6 md:min-h-[88svh] md:grid-cols-[1.1fr_0.9fr] md:gap-14 md:pb-16 md:pt-32 lg:px-10">
      <div>{children}</div>
      <div className="mx-auto w-full max-w-md md:max-w-none">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] bg-night-2 md:max-h-[74svh] md:w-auto">
          <AnimatePresence initial={false}>
            <motion.div
              key={s.src}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            >
              <Image src={s.src} alt={s.alt} fill priority={priority && i === 0} sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
            </motion.div>
          </AnimatePresence>
        </div>
        {slides.length > 1 && (
          <div className="mt-4 flex justify-center gap-2" role="tablist" aria-label="Photos">
            {slides.map((sl, n) => (
              <button
                key={sl.src}
                type="button"
                role="tab"
                aria-selected={n === i}
                aria-label={`${n + 1} / ${slides.length}`}
                onClick={() => setI(n)}
                className="flex h-6 items-center"
              >
                <span className={`block h-0.5 rounded-full transition-all duration-500 ${n === i ? "w-7 bg-ink" : "w-3.5 bg-ink/35"}`} />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
