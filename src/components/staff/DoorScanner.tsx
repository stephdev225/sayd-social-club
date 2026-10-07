"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type QrScannerType from "qr-scanner";

type Result =
  | { result: "ok" | "already_used" | "refunded" | "cancelled" | "wrong_event"; ticket: { id: string; holderName: string; ticketTypeName: string; checkedInAt?: string; checkedInBy?: string } }
  | { result: "invalid" }
  | { result: "error"; message: string };

const VIEW: Record<string, { title: string; bg: string; tone: number }> = {
  ok: { title: "Bienvenue", bg: "bg-[#1f6b45]", tone: 880 },
  already_used: { title: "Déjà utilisé", bg: "bg-[#8a2b1a]", tone: 220 },
  refunded: { title: "Billet remboursé", bg: "bg-[#8a2b1a]", tone: 220 },
  cancelled: { title: "Billet annulé", bg: "bg-[#8a2b1a]", tone: 220 },
  wrong_event: { title: "Autre événement", bg: "bg-[#8a5a12]", tone: 330 },
  invalid: { title: "Billet invalide", bg: "bg-[#8a2b1a]", tone: 220 },
  error: { title: "Erreur réseau", bg: "bg-[#5a4a3a]", tone: 220 },
};

function beep(freq: number) {
  try {
    const ctx = new AudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.2, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.25);
  } catch {
    /* sound is a bonus */
  }
}

function time(iso?: string) {
  return iso ? new Intl.DateTimeFormat("fr-CA", { timeZone: "America/Toronto", timeStyle: "short" }).format(new Date(iso)) : "";
}

export function DoorScanner(props: { eventId?: string; eventName: string; staffName: string; isAdmin: boolean; initialCheckedIn: number; sold: number }) {
  const video = useRef<HTMLVideoElement>(null);
  const scanner = useRef<QrScannerType | null>(null);
  const busy = useRef(false);
  const lastCode = useRef<{ code: string; at: number } | null>(null);
  const router = useRouter();
  const [res, setRes] = useState<Result | null>(null);
  const [count, setCount] = useState(props.initialCheckedIn);
  const [camError, setCamError] = useState<string | null>(null);
  const [manual, setManual] = useState("");

  const check = useCallback(
    async (code: string) => {
      const now = Date.now();
      // Ignore the same QR held in front of the camera for a few seconds.
      if (busy.current || (lastCode.current && lastCode.current.code === code && now - lastCode.current.at < 4000)) return;
      busy.current = true;
      lastCode.current = { code, at: now };
      try {
        const r = await fetch("/api/scan", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ code, eventId: props.eventId }),
        });
        if (r.status === 401) {
          router.push("/admin/connexion?next=/scan");
          return;
        }
        const body = (await r.json()) as Result;
        setRes(body);
        beep(VIEW[body.result]?.tone ?? 220);
        navigator.vibrate?.(body.result === "ok" ? 80 : [120, 60, 120]);
        if (body.result === "ok") setCount((c) => c + 1);
      } catch {
        setRes({ result: "error", message: "Réseau indisponible" });
      } finally {
        busy.current = false;
      }
    },
    [props.eventId, router],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const QrScanner = (await import("qr-scanner")).default;
      if (cancelled || !video.current) return;
      const s = new QrScanner(video.current, (r) => check(r.data), {
        preferredCamera: "environment",
        highlightScanRegion: true,
        highlightCodeOutline: true,
        maxScansPerSecond: 6,
      });
      scanner.current = s;
      try {
        await s.start();
      } catch {
        setCamError("Caméra indisponible. Autorisez la caméra dans le navigateur, ou saisissez le code à la main.");
      }
    })();
    return () => {
      cancelled = true;
      scanner.current?.destroy();
    };
  }, [check]);

  // The verdict screen clears itself after a few seconds.
  useEffect(() => {
    if (!res) return;
    const id = window.setTimeout(() => setRes(null), res.result === "ok" ? 2200 : 4500);
    return () => window.clearTimeout(id);
  }, [res]);

  const v = res ? VIEW[res.result] : null;

  return (
    <main className="relative flex min-h-svh flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-line px-4 py-3">
        <div>
          <p className="text-xs text-muted">Porte — {props.staffName}</p>
          <p className="font-display text-2xl leading-tight">{props.eventName}</p>
        </div>
        <div className="text-right">
          <p className="font-display text-3xl tabular-nums leading-none">{count}<span className="text-base text-muted"> / {props.sold}</span></p>
          <p className="text-xs text-muted">entrés</p>
        </div>
      </header>

      <div className="relative flex-1 bg-black">
        <video ref={video} className="h-full max-h-[70svh] w-full object-cover" muted playsInline />
        {camError && <p className="absolute inset-x-4 top-4 rounded bg-night/90 p-3 text-sm text-terra">{camError}</p>}

        <AnimatePresence>
          {res && v && (
            <motion.button
              type="button"
              onClick={() => setRes(null)}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className={`absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-white ${v.bg}`}
              aria-live="assertive"
            >
              <span className="font-display text-5xl sm:text-6xl">{v.title}</span>
              {"ticket" in res && (
                <>
                  <span className="text-2xl font-semibold">{res.ticket.holderName}</span>
                  <span className="text-lg opacity-90">{res.ticket.ticketTypeName}</span>
                  {res.result === "already_used" && (
                    <span className="text-lg">Entré à {time(res.ticket.checkedInAt)}{res.ticket.checkedInBy ? ` (${res.ticket.checkedInBy})` : ""}</span>
                  )}
                  <span className="font-mono text-sm opacity-75">{res.ticket.id}</span>
                </>
              )}
              <span className="mt-4 text-sm opacity-75">Touchez pour continuer</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <form
        className="flex gap-2 border-t border-line p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (manual.trim()) {
            lastCode.current = null;
            check(manual.trim());
            setManual("");
          }
        }}
      >
        <label htmlFor="manual" className="sr-only">Code du billet</label>
        <input
          id="manual"
          value={manual}
          onChange={(e) => setManual(e.target.value)}
          placeholder="SAYD-26-XXXXXXXXXX"
          autoCapitalize="characters"
          autoComplete="off"
          className="min-h-12 flex-1 rounded-md border border-line bg-night-2 px-3 font-mono uppercase text-ink placeholder:text-muted focus:border-sable focus:outline-none"
        />
        <button className="min-h-12 rounded-md bg-sable px-5 font-semibold text-night">Vérifier</button>
      </form>
      {props.isAdmin && (
        <Link href="/admin" className="pb-4 text-center text-sm text-muted underline">Tableau de bord</Link>
      )}
    </main>
  );
}
