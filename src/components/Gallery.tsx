"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

export interface GalleryPhoto {
  id: string;
  src: string;
  full: string;
  alt: string;
  w: number;
  h: number;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/** 2 columns on phones (the default, also on the server), 3 from 768 px. */
function useColumns() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(min-width: 768px)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => (window.matchMedia("(min-width: 768px)").matches ? 3 : 2),
    () => 2,
  );
}

/**
 * Gallery, in three layers of motion:
 * 1. The columns drift at different speeds while you scroll (depth, like a camera dolly).
 * 2. Each photo is "developed" as it enters: a curtain opens from the bottom while the
 *    photo settles from a zoom and comes into focus.
 * 3. A tap opens it full screen with a shared-element morph; swipe or arrows to browse.
 * Everything is transform / clip-path / filter only, so it stays smooth on phones,
 * and it all switches off for visitors who prefer reduced motion.
 */
export function Gallery({ photos, labels }: { photos: GalleryPhoto[]; labels: { close: string; prev: string; next: string } }) {
  const reduce = Boolean(useReducedMotion());
  const cols = useColumns();
  const [index, setIndex] = useState<number | null>(null);
  const [dir, setDir] = useState(1);
  const open = index !== null ? photos[index] : null;
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 22, mass: 0.4 });

  const go = useCallback(
    (d: number) => {
      setDir(d);
      setIndex((i) => (i === null ? i : (i + d + photos.length) % photos.length));
    },
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

  // Deal photos into columns, keeping their order left-to-right, row by row.
  const columns: { p: GalleryPhoto; i: number }[][] = Array.from({ length: cols }, () => []);
  photos.forEach((p, i) => columns[i % cols].push({ p, i }));
  // How far each column travels over the whole scroll (px): the middle one moves most.
  const travel = cols === 3 ? [0, -220, -90] : [0, -140];

  return (
    <>
      <div ref={ref} className="flex gap-3 pb-[min(14rem,22vw)] sm:gap-4">
        {columns.map((col, c) => (
          <Column key={`${cols}-${c}`} progress={smooth} travel={reduce ? 0 : travel[c]}>
            {col.map(({ p, i }) => (
              <Tile key={p.id} photo={p} order={i} reduce={reduce} onOpen={() => { setDir(0); setIndex(i); }} />
            ))}
          </Column>
        ))}
      </div>

      <AnimatePresence>
        {open && index !== null && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-night/95 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIndex(null)}
            role="dialog"
            aria-modal="true"
            aria-label={open.alt}
          >
            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              <motion.div
                key={open.id}
                custom={dir}
                layoutId={reduce ? undefined : `photo-${open.id}`}
                className="relative max-h-[82svh] w-[min(94vw,calc(82svh*var(--r)))]"
                style={{ aspectRatio: `${open.w} / ${open.h}`, ["--r" as string]: open.w / open.h }}
                variants={{
                  // d = 0: opened from the grid, the shared-element morph does the entrance.
                  enter: (d: number) => (d === 0 ? {} : { x: `${d * 30}%`, opacity: 0, rotateY: d * -18, scale: 0.92 }),
                  center: { x: 0, opacity: 1, rotateY: 0, scale: 1 },
                  exit: (d: number) => ({ x: `${d * -30}%`, opacity: 0, rotateY: d * 18, scale: 0.92 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.6, ease: EASE }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.5}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -70 || info.velocity.x < -500) go(1);
                  else if (info.offset.x > 70 || info.velocity.x > 500) go(-1);
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* The grid version is already loaded: shown at once, the sharp one fades in over it. */}
                <Image src={open.src} alt="" aria-hidden fill sizes="(min-width: 768px) 33vw, 50vw" className="pointer-events-none select-none object-contain" />
                <Image src={open.full} alt={open.alt} fill sizes="94vw" className="pointer-events-none select-none object-contain" priority />
              </motion.div>
            </AnimatePresence>

            <div className="absolute inset-x-0 bottom-[max(1.5rem,env(safe-area-inset-bottom))] flex items-center justify-center gap-6 text-sm" onClick={(e) => e.stopPropagation()}>
              <button type="button" onClick={() => go(-1)} className="h-12 w-12 rounded-full border border-ink/30 text-lg transition hover:bg-ink hover:text-night" aria-label={labels.prev}>←</button>
              <span className="tabular-nums text-ink/70">{index + 1} / {photos.length}</span>
              <button type="button" onClick={() => go(1)} className="h-12 w-12 rounded-full border border-ink/30 text-lg transition hover:bg-ink hover:text-night" aria-label={labels.next}>→</button>
            </div>
            <button type="button" onClick={() => setIndex(null)} className="absolute right-5 top-[max(1.25rem,env(safe-area-inset-top))] text-sm text-ink/80 underline underline-offset-4">
              {labels.close}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Column({ progress, travel, children }: { progress: MotionValue<number>; travel: number; children: React.ReactNode }) {
  const y = useTransform(progress, [0, 1], [0, travel]);
  return (
    <motion.ul className="flex min-w-0 flex-1 flex-col gap-3 sm:gap-4" style={travel ? { y } : undefined}>
      {children}
    </motion.ul>
  );
}

function Tile({ photo: p, order, reduce, onOpen }: { photo: GalleryPhoto; order: number; reduce: boolean; onOpen: () => void }) {
  // Desktop only: the photo leans towards the pointer, with a soft light following it.
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 150, damping: 15 });
  const sry = useSpring(ry, { stiffness: 150, damping: 15 });
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const glare = useTransform([gx, gy], ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.18), transparent 55%)`);

  return (
    <motion.li
      className="[perspective:900px]"
      initial={reduce ? false : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.4 }}
    >
      <motion.button
        type="button"
        onClick={onOpen}
        aria-label={p.alt}
        className="group relative block w-full overflow-hidden rounded-xl sm:rounded-2xl"
        style={reduce ? undefined : { rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }}
        onPointerMove={(e) => {
          if (reduce || e.pointerType !== "mouse") return;
          const r = e.currentTarget.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width;
          const py = (e.clientY - r.top) / r.height;
          ry.set((px - 0.5) * 10);
          rx.set((0.5 - py) * 10);
          gx.set(px * 100);
          gy.set(py * 100);
        }}
        onPointerLeave={() => {
          rx.set(0);
          ry.set(0);
        }}
        initial={reduce ? false : { clipPath: "inset(100% 0% 0% 0%)" }}
        whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        transition={{ duration: 1.15, delay: (order % 3) * 0.09, ease: EASE }}
      >
        <motion.div
          layoutId={reduce ? undefined : `photo-${p.id}`}
          className="relative"
          style={{ aspectRatio: `${p.w} / ${p.h}` }}
          initial={reduce ? false : { scale: 1.35, filter: "blur(14px) brightness(0.6)" }}
          whileInView={{ scale: 1, filter: "blur(0px) brightness(1)" }}
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          transition={{ duration: 1.5, delay: (order % 3) * 0.09, ease: EASE }}
        >
          <Image src={p.src} alt={p.alt} fill sizes="(min-width: 768px) 33vw, 50vw" className="object-cover transition duration-[1.1s] ease-out group-hover:scale-[1.04]" />
        </motion.div>
        {!reduce && (
          <motion.span aria-hidden className="pointer-events-none absolute inset-0 hidden opacity-0 transition-opacity duration-500 group-hover:opacity-100 md:block" style={{ background: glare }} />
        )}
      </motion.button>
    </motion.li>
  );
}
