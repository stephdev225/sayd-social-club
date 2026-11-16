"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { frameHeight } from "@/lib/ticketing-embed";

const FRAME_ID = "tpos_sayd";
const noop = () => () => {};

/**
 * Partner ticketing (Le Point de Vente) shown inside the event page: the visitor picks
 * tickets and pays in the frame, without leaving the site. The partner page tells us its
 * height by message; we only listen to its own origin and only resize our own frame.
 * A link under the frame opens the same page in a new tab, in case the frame misbehaves.
 */
export function TicketFrame({
  url,
  origin,
  title,
  labels,
}: {
  url: string;
  origin: string;
  title: string;
  labels: { loading: string; open: string };
}) {
  // The frame address needs our own origin and path: known in the browser only.
  const here = useSyncExternalStore(noop, () => `${window.location.origin}|${window.location.pathname}`, () => null);
  const [height, setHeight] = useState(560);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== origin) return;
      let msg: unknown = e.data;
      if (typeof msg === "string") {
        try {
          msg = JSON.parse(msg);
        } catch {
          return;
        }
      }
      if (!msg || typeof msg !== "object") return;
      const m = msg as { subject?: unknown; iframe?: unknown; height?: unknown };
      if (m.subject !== "resize" || m.iframe !== FRAME_ID) return;
      const h = frameHeight(m.height);
      if (h) setHeight(h);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [origin]);

  let src: string | null = null;
  if (here) {
    const [ourOrigin, ourPath] = here.split("|");
    const u = new URL(url);
    u.searchParams.set("iframe", FRAME_ID);
    u.searchParams.set("embed", "1");
    u.searchParams.set("origin", ourOrigin);
    u.searchParams.set("path", ourPath);
    u.searchParams.set("ref", "");
    src = u.toString();
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-3xl bg-white ring-1 ring-ink/10" style={{ minHeight: loaded ? undefined : 560 }}>
        {!loaded && (
          <p className="absolute inset-0 grid place-items-center text-base text-night/60" role="status">
            {labels.loading}
          </p>
        )}
        {src && (
          <iframe
            id={FRAME_ID}
            src={src}
            title={title}
            width="100%"
            height={height}
            allow="payment"
            allowFullScreen
            onLoad={() => setLoaded(true)}
            className="relative block w-full border-0 transition-[height] duration-300"
          />
        )}
      </div>
      <p className="mt-4 text-base">
        <a href={url} target="_blank" rel="noopener noreferrer" className="link-draw pb-0.5 text-ink/80">
          {labels.open} <span aria-hidden>↗</span>
        </a>
      </p>
    </div>
  );
}
