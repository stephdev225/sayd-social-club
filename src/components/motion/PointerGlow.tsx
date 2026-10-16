"use client";

import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useEffect, useRef } from "react";

/**
 * A soft red light that follows the mouse across its parent (the footer sign-up).
 * On touch screens, where there is no pointer, it drifts slowly on its own.
 * Pure CSS gradients driven by motion values: no canvas, no grey artefacts.
 */
export function PointerGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(30);
  const y = useMotionValue(40);
  const sx = useSpring(x, { stiffness: 60, damping: 20, mass: 0.8 });
  const sy = useSpring(y, { stiffness: 60, damping: 20, mass: 0.8 });
  const background = useMotionTemplate`radial-gradient(38rem circle at ${sx}% ${sy}%, rgba(193,18,31,0.32), transparent 60%), radial-gradient(18rem circle at ${sx}% ${sy}%, rgba(255,90,90,0.12), transparent 70%)`;

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    // Listen on the whole footer/section (the glow sits behind its content).
    const host = el?.closest("footer, section") as HTMLElement | null;
    if (!el || !host) return;
    let touched = false;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      touched = true;
      const r = el.getBoundingClientRect();
      x.set(((e.clientX - r.left) / r.width) * 100);
      y.set(((e.clientY - r.top) / r.height) * 100);
    };
    host.addEventListener("pointermove", onMove);
    // No mouse: a slow figure-of-eight drift.
    let raf = 0;
    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);
    const start = performance.now();
    const drift = (t: number) => {
      if (!touched && visible) {
        const k = (t - start) / 6000;
        x.set(50 + Math.sin(k * Math.PI * 2) * 30);
        y.set(45 + Math.sin(k * Math.PI * 4) * 18);
      }
      raf = requestAnimationFrame(drift);
    };
    raf = requestAnimationFrame(drift);
    return () => {
      host.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [reduce, x, y]);

  return <motion.div ref={ref} aria-hidden className="pointer-events-none absolute inset-0" style={{ background }} />;
}
