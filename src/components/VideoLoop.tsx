"use client";

import { useEffect, useRef } from "react";

/**
 * Silent looping clip that only plays while on screen (saves data and battery),
 * with a still image shown until it starts.
 */
export function VideoLoop({ src, poster, className = "" }: { src: string; poster?: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return <video ref={ref} src={src} poster={poster} muted loop playsInline preload="none" aria-hidden className={className} />;
}
