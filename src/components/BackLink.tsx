"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";

/**
 * A discreet "back" link under the header on inner pages, so visitors always have a
 * way up: event page → all events, any other page → home.
 */
export function BackLink({ lang, home, events }: { lang: Locale; home: string; events: string }) {
  const pathname = usePathname() ?? "";
  const parts = pathname.split("/").filter(Boolean); // ["fr", "evenements", "slug"]
  if (parts.length < 2) return null;
  if (parts[1] === "billet" || parts[1] === "billetterie") return null; // these pages have their own actions
  const toEvents = parts[1] === "evenements" && parts.length > 2;
  const href = toEvents ? `/${lang}/evenements` : `/${lang}`;
  const label = toEvents ? events : home;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-[4.25rem] z-10 md:top-[5.4rem]">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <Link
          href={href}
          className="group pointer-events-auto inline-flex min-h-9 items-center gap-2 text-sm text-ink/70 transition-colors hover:text-ink"
        >
          <span aria-hidden className="transition-transform duration-300 group-hover:-translate-x-1">←</span>
          {label}
        </Link>
      </div>
    </div>
  );
}
