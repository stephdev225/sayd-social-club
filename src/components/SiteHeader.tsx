"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type Nav = Dictionary["nav"];

export function SiteHeader({ lang, nav }: { lang: Locale; nav: Nav }) {
  const pathname = usePathname() ?? `/${lang}`;
  const [open, setOpen] = useState(false);

  // Close the menu when the route changes (adjusting state during render, per React docs).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  // Lock page scroll while the menu is open; Escape closes it.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const other: Locale = lang === "fr" ? "en" : "fr";
  const switchHref = pathname.replace(new RegExp(`^/${lang}(?=/|$)`), `/${other}`);

  const links = [
    { href: `/${lang}/evenements`, label: nav.events },
    { href: `/${lang}/le-club`, label: nav.about },
    { href: `/${lang}/ambassadeurs`, label: nav.ambassadors },
    { href: `/${lang}/contact`, label: nav.contact },
  ];
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-night/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 md:h-20 lg:px-10">
        <Link href={`/${lang}`} className="shrink-0" aria-label="Sayd Social Club">
          <Image src="/brand/logo-ivory.png" alt="Sayd Social Club" width={319} height={134} priority className="h-9 w-auto md:h-11" />
        </Link>

        <nav aria-label="Principale" className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className="text-[0.95rem] text-muted transition-colors hover:text-ink aria-[current=page]:text-ink aria-[current=page]:underline aria-[current=page]:decoration-sable aria-[current=page]:underline-offset-8"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 sm:gap-5">
          <Link href={switchHref} hrefLang={other} lang={other} className="hidden text-sm text-muted hover:text-ink sm:inline">
            {nav.switchLang}
          </Link>
          <Link
            href={`/${lang}/evenements`}
            className="rounded-full bg-sable px-4 py-2 text-sm font-semibold text-night transition hover:brightness-110 sm:px-5"
          >
            {nav.tickets}
          </Link>
          <button
            type="button"
            className="-mr-2 flex h-11 w-11 items-center justify-center lg:hidden"
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? nav.close : nav.menu}
            onClick={() => setOpen((v) => !v)}
          >
            <span aria-hidden className="relative block h-3 w-6">
              <span className={`absolute left-0 h-px w-6 bg-ink transition ${open ? "top-1.5 rotate-45" : "top-0"}`} />
              <span className={`absolute left-0 h-px w-6 bg-ink transition ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
            </span>
          </button>
        </div>
      </div>

      <div
        id="menu-mobile"
        hidden={!open}
        className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto bg-night px-4 pb-10 pt-6 sm:px-6 lg:hidden"
      >
        <nav aria-label="Mobile" className="flex flex-col">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className="t-h2 border-b border-line py-4 text-ink aria-[current=page]:text-sable"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link href={switchHref} hrefLang={other} lang={other} className="mt-8 inline-block text-muted underline underline-offset-4">
          {nav.switchLang}
        </Link>
      </div>
    </header>
  );
}
