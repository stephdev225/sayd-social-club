"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { ShaderBackdrop } from "./motion/ShaderBackdrop";
import { SplitTitle } from "./motion/SplitTitle";

/**
 * Brand hero. The photo is lit by an animated shader (silk-like light that follows
 * the pointer). The wordmark reacts: its three words drift towards the pointer at
 * different depths, and lean with the scroll speed on touch screens.
 */
export function HeroBrand({ image, children }: { image: string; children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollY, scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.05, 1.25]);
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Pointer, from -1 to 1 across the hero, eased.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 60, damping: 18, mass: 0.6 });
  const sy = useSpring(py, { stiffness: 60, damping: 18, mass: 0.6 });
  const d1 = { x: useTransform(sx, (v) => v * 8), y: useTransform(sy, (v) => v * 5) };
  const d2 = { x: useTransform(sx, (v) => v * 15), y: useTransform(sy, (v) => v * 9) };
  const d3 = { x: useTransform(sx, (v) => v * 24), y: useTransform(sy, (v) => v * 14) };
  const rotateY = useTransform(sx, (v) => v * 4);
  const rotateX = useTransform(sy, (v) => v * -3);

  // Scroll speed → slight lean (felt on phones, where there is no pointer).
  const velocity = useVelocity(scrollY);
  const skew = useSpring(useTransform(velocity, [-2500, 0, 2500], [4, 0, -4]), { stiffness: 200, damping: 40 });

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      px.set(((e.clientX - r.left) / r.width) * 2 - 1);
      py.set(((e.clientY - r.top) / r.height) * 2 - 1);
    };
    const onLeave = () => {
      px.set(0);
      py.set(0);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [px, py, reduce]);

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
        <motion.h1
          style={still ? undefined : { rotateX, rotateY, skewY: skew, transformPerspective: 900 }}
          className="origin-left font-display text-[clamp(3.4rem,15vw,9rem)] font-medium leading-[0.82] tracking-[-0.045em] text-ink"
        >
          <motion.span className="inline-block" style={still ? undefined : d1}>
            <SplitTitle text="Sayd" />
          </motion.span>
          <br />
          <motion.span className="inline-block" style={still ? undefined : d2}>
            <SplitTitle text="Social" delay={0.35} />
          </motion.span>
          <motion.span className="inline-block italic text-sable" style={still ? undefined : d3}>
            &nbsp;<SplitTitle text="Club" delay={0.65} />
          </motion.span>
        </motion.h1>
        {children}
      </motion.div>
    </section>
  );
}
