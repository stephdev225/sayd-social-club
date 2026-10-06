"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

/**
 * Event page, mobile: a bottom bar with the price and a button that jumps to the
 * ticket form. Hidden while the form itself is on screen.
 */
export function MobileBuyBar({ label, price, note, targetId = "billets" }: { label: string; price: string | null; note: string; targetId?: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    let pastTop = false;
    let formVisible = false;
    const update = () => setShow(pastTop && !formVisible);
    const io = new IntersectionObserver(([e]) => {
      formVisible = e.isIntersecting;
      update();
    }, { threshold: 0.05 });
    io.observe(target);
    const onScroll = () => {
      pastTop = window.scrollY > 280;
      update();
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [targetId]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 120 }}
          animate={{ y: 0 }}
          exit={{ y: 120 }}
          transition={{ type: "spring", stiffness: 280, damping: 30 }}
          className="fixed inset-x-0 bottom-0 z-40 bg-night/90 px-4 pb-[max(0.9rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl lg:hidden"
        >
          <div className="flex items-center gap-4">
            <div className="min-w-0">
              {price && <p className="font-display text-2xl leading-none">{price}</p>}
              <p className="truncate text-xs text-ink/60">{note}</p>
            </div>
            <a
              href={`#${targetId}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="ml-auto inline-flex min-h-12 shrink-0 items-center rounded-full bg-sable px-6 font-semibold text-night"
            >
              {label}
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
