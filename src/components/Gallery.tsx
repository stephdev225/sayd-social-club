"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

export interface GalleryPhoto {
  id: string;
  src: string;
  full: string;
  alt: string;
  w: number;
  h: number;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Masonry grid; a tap opens the photo full screen with a shared-element morph.
 * In the viewer: swipe or arrow keys to browse, Escape or tap outside to close.
 */
export function Gallery({ photos, labels }: { photos: GalleryPhoto[]; labels: { close: string; prev: string; next: string } }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState<number | null>(null);
  const open = index !== null ? photos[index] : null;

  const go = useCallback(
    (d: number) => setIndex((i) => (i === null ? i : (i + d + photos.length) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIndex(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [index, go]);

  return (
    <>
      <ul className="columns-2 gap-3 sm:gap-4 md:columns-3">
        {photos.map((p, i) => (
          <motion.li
            key={p.id}
            className="mb-3 break-inside-avoid sm:mb-4"
            initial={reduce ? false : { opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -8% 0px" }}
            transition={{ duration: 0.8, delay: (i % 3) * 0.08, ease: EASE }}
          >
            <button type="button" onClick={() => setIndex(i)} className="group block w-full overflow-hidden" aria-label={p.alt}>
              <motion.div layoutId={reduce ? undefined : `photo-${p.id}`} className="relative" style={{ aspectRatio: `${p.w} / ${p.h}` }}>
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  sizes="(min-width: 768px) 33vw, 50vw"
                  className="object-cover transition duration-[1.1s] ease-out group-hover:scale-[1.05]"
                />
              </motion.div>
            </button>
          </motion.li>
        ))}
      </ul>

      <AnimatePresence>
        {open && index !== null && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-night/95 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIndex(null)}
            role="dialog"
            aria-modal="true"
            aria-label={open.alt}
          >
            <motion.div
              key={open.id}
              layoutId={reduce ? undefined : `photo-${open.id}`}
              className="relative max-h-[82svh] w-[min(92vw,calc(82svh*var(--r)))]"
              style={{ aspectRatio: `${open.w} / ${open.h}`, ["--r" as string]: open.w / open.h }}
              transition={{ duration: 0.55, ease: EASE }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.6}
              onDragEnd={(_, info) => {
                if (info.offset.x < -80) go(1);
                else if (info.offset.x > 80) go(-1);
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* The grid thumbnail is already cached: show it at once, the sharp version fades in over it. */}
              <Image src={open.src} alt="" aria-hidden fill sizes="(min-width: 768px) 33vw, 50vw" className="pointer-events-none object-contain" />
              <Image src={open.full} alt={open.alt} fill sizes="92vw" className="pointer-events-none object-contain" priority />
            </motion.div>

            <div className="absolute inset-x-0 bottom-[max(1.5rem,env(safe-area-inset-bottom))] flex items-center justify-center gap-6 text-sm" onClick={(e) => e.stopPropagation()}>
              <button type="button" onClick={() => go(-1)} className="h-12 w-12 rounded-full border border-ink/30 text-lg" aria-label={labels.prev}>←</button>
              <span className="tabular-nums text-ink/70">{index + 1} / {photos.length}</span>
              <button type="button" onClick={() => go(1)} className="h-12 w-12 rounded-full border border-ink/30 text-lg" aria-label={labels.next}>→</button>
            </div>
            <button type="button" onClick={() => setIndex(null)} className="absolute right-5 top-5 text-sm text-ink/80 underline underline-offset-4">
              {labels.close}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
