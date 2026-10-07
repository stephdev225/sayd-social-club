import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, hasLocale, locales } from "@/lib/i18n/config";

const COOKIE = "sayd_lang";

/**
 * The site opens in French. A visitor who chose English (by visiting an /en page)
 * keeps English on their next visit to a bare URL, thanks to a small preference cookie.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const current = locales.find((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (current) {
    if (request.cookies.get(COOKIE)?.value === current) return;
    const res = NextResponse.next();
    res.cookies.set(COOKIE, current, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
    return res;
  }

  const saved = request.cookies.get(COOKIE)?.value ?? "";
  const lang = hasLocale(saved) ? saved : defaultLocale;
  const url = request.nextUrl.clone();
  url.pathname = `/${lang}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Pages only: skip API routes, Next internals and any file with an extension.
  matcher: ["/((?!api|admin|scan|media|_next|.*\\..*).*)"],
};
