"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/** Mobile only: a floating "Billets" pill that slides up once the visitor scrolls past the hero. */
export function StickyTicketPill({ href, label, detail }: { href: string; label: string; detail: string }) {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (pathname?.includes("/evenements/") || pathname?.includes("/billet")) return null;
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 lg:hidden"
        >
          <Link
            href={href}
            className="flex min-h-14 items-center justify-between rounded-full bg-sable pl-6 pr-2 text-night shadow-[0_20px_40px_-12px_rgba(0,0,0,0.8)]"
          >
            <span className="text-sm">
              <span className="block font-semibold leading-tight">{label}</span>
              <span className="block text-xs opacity-75">{detail}</span>
            </span>
            <span aria-hidden className="flex h-10 w-10 items-center justify-center rounded-full bg-night text-sable">→</span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
