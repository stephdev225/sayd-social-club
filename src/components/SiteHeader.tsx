"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { site } from "@/lib/site";

type Nav = Dictionary["nav"];
const EASE = [0.22, 1, 0.36, 1] as const;

export function SiteHeader({ lang, nav, ticketsHref }: { lang: Locale; nav: Nav; ticketsHref: string }) {
  const pathname = usePathname() ?? `/${lang}`;
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Close the menu when the route changes (adjusting state during render).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  // Always visible; gains a blurred background once the page scrolls. No dividing line.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Phone "back" gesture closes the menu instead of leaving the page.
  useEffect(() => {
    if (!open) return;
    window.history.pushState({ ...window.history.state, saydMenu: true }, "");
    const onPop = () => setOpen(false);
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      if (window.history.state?.saydMenu) window.history.back();
    };
  }, [open]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Links that change page close the menu through the route change; closing it here
  // would rewind history (see the back-gesture effect) and cancel the navigation.
  const closeFor = (href: string) => {
    if (href.startsWith("/") && href.split("#")[0] === pathname) setOpen(false);
  };

  const other: Locale = lang === "fr" ? "en" : "fr";
  const switchHref = pathname.replace(new RegExp(`^/${lang}(?=/|$)`), `/${other}`);
  const links = [
    { href: `/${lang}/evenements`, label: nav.events },
    { href: `/${lang}/showcase`, label: nav.showcase },
    { href: `/${lang}/galerie`, label: nav.gallery },
    { href: `/${lang}/le-club`, label: nav.about },
    { href: `/${lang}/partenariats`, label: nav.partners },
    { href: `/${lang}/contact`, label: nav.contact },
  ];
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 transition-[background-color,backdrop-filter] duration-500 ${
          scrolled && !open ? "bg-night/75 backdrop-blur-xl" : "bg-transparent"
        } ${open ? "z-[60]" : "z-50"}`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6 md:h-20 lg:px-10">
          <Link href={`/${lang}`} className="relative z-[60] shrink-0" aria-label="Sayd Social Club">
            <Image src="/brand/logo-ivory.png" alt="Sayd Social Club" width={319} height={134} priority className="h-8 w-auto md:h-10" />
          </Link>

          <nav aria-label={nav.ariaMain} className="hidden items-center gap-6 lg:flex xl:gap-8">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActive(l.href) ? "page" : undefined}
                className="link-draw pb-1 text-[0.95rem] text-ink/75 transition-colors hover:text-ink aria-[current=page]:text-ink"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="relative z-[60] flex items-center gap-3 sm:gap-4">
            <Link href={switchHref} hrefLang={other} lang={other} aria-label={nav.switchLang} className="text-sm font-medium text-ink/75 hover:text-ink">
              {nav.langShort}
            </Link>
            <Link
              href={ticketsHref}
              onClick={() => closeFor(ticketsHref)}
              className="inline-flex items-center rounded-full bg-sable px-4 py-2 text-sm font-semibold text-night transition hover:brightness-110 sm:px-5"
            >
              {nav.tickets}
            </Link>
            {/* Mobile: one clean toggle, two lines that morph into a cross */}
            <button
              type="button"
              className="flex h-11 items-center gap-3 lg:hidden"
              aria-expanded={open}
              aria-controls="menu-mobile"
              onClick={() => setOpen((v) => !v)}
            >
              <span className={open ? "text-sm font-medium text-ink" : "sr-only"}>{open ? nav.close : nav.menu}</span>
              <span aria-hidden className="relative block h-3 w-7">
                <motion.span
                  className="absolute left-0 top-0 h-px w-7 bg-ink"
                  animate={open ? { y: 6, rotate: 45 } : { y: 0, rotate: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                />
                <motion.span
                  className="absolute bottom-0 right-0 h-px bg-ink"
                  animate={open ? { y: -5, rotate: -45, width: 28 } : { y: 0, rotate: 0, width: 18 }}
                  transition={{ duration: 0.4, ease: EASE }}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-mobile"
            role="dialog"
            aria-modal="true"
            aria-label={nav.menu}
            className="fixed inset-0 z-[55] flex flex-col bg-night px-5 pb-8 pt-24 sm:px-6 lg:hidden"
            initial={reduce ? { opacity: 0 } : { clipPath: "circle(0% at calc(100% - 2.5rem) 2rem)" }}
            animate={reduce ? { opacity: 1 } : { clipPath: "circle(150% at calc(100% - 2.5rem) 2rem)" }}
            exit={reduce ? { opacity: 0 } : { clipPath: "circle(0% at calc(100% - 2.5rem) 2rem)" }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <nav aria-label={nav.menu} className="flex flex-1 flex-col justify-center">
              {links.map((l, i) => (
                <div key={l.href} className="overflow-hidden">
                  <motion.div
                    initial={{ y: "110%" }}
                    animate={{ y: "0%" }}
                    exit={{ y: "110%" }}
                    transition={{ duration: 0.6, delay: 0.15 + i * 0.06, ease: EASE }}
                  >
                    <Link
                      href={l.href}
                      onClick={() => closeFor(l.href)}
                      aria-current={isActive(l.href) ? "page" : undefined}
                      className="block py-1.5 font-display text-[clamp(2.3rem,10vw,4rem)] leading-[1.05] text-ink transition-colors aria-[current=page]:italic aria-[current=page]:text-sable"
                    >
                      {l.label}
                    </Link>
                  </motion.div>
                </div>
              ))}
            </nav>

            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.5, ease: EASE }}
            >
              <Link
                href={ticketsHref}
                onClick={() => closeFor(ticketsHref)}
                className="flex min-h-14 w-full items-center justify-center rounded-full bg-sable text-base font-semibold text-night"
              >
                {nav.tickets}
              </Link>
              <div className="flex items-center justify-between text-sm text-ink/70">
                <div className="flex gap-5">
                  <a href={site.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
                  <a href={site.tiktok} target="_blank" rel="noopener noreferrer">TikTok</a>
                  <a href={site.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                </div>
                <Link href={switchHref} hrefLang={other} lang={other}>
                  {nav.switchLang}
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
