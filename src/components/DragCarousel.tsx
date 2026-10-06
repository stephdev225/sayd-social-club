"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export interface CarouselItem {
  src: string;
  alt: string;
  portrait: boolean;
}

/** Photos you drag (mouse) or swipe (touch) sideways, with inertia. Cards tilt in as they enter. */
export function DragCarousel({ items }: { items: CarouselItem[] }) {
  const track = useRef<HTMLDivElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [limit, setLimit] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (track.current && wrap.current) setLimit(Math.max(0, track.current.scrollWidth - wrap.current.clientWidth));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <div ref={wrap} className="overflow-hidden px-5 sm:px-6 lg:px-10">
      <motion.div
        ref={track}
        className="flex w-max cursor-grab gap-3 active:cursor-grabbing sm:gap-5"
        drag={reduce ? false : "x"}
        dragConstraints={{ left: -limit, right: 0 }}
        dragElastic={0.08}
      >
        {items.map((it, i) => (
          <motion.figure
            key={it.src}
            className={`relative shrink-0 overflow-hidden ${it.portrait ? "aspect-[3/4] w-[62vw] sm:w-[30vw] lg:w-[22vw]" : "aspect-[4/5] w-[70vw] sm:w-[36vw] lg:w-[26vw]"}`}
            initial={reduce ? false : { opacity: 0, y: 60, rotate: 3 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true, margin: "0px -10% 0px 0px" }}
            transition={{ duration: 0.9, delay: (i % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image src={it.src} alt={it.alt} fill draggable={false} sizes="(min-width: 1024px) 26vw, 70vw" className="pointer-events-none select-none object-cover" />
          </motion.figure>
        ))}
      </motion.div>
    </div>
  );
}
