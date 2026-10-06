"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Locale } from "@/lib/i18n/config";

export interface NotifyLabels {
  name: string;
  email: string;
  cta: string;
  sending: string;
  done: string;
  doneText: string;
  error: string;
  consent: string;
}

/** "Tell me about the next party": first name + email, deduplicated server-side. */
export function NotifyForm({ lang, labels, source }: { lang: Locale; labels: NotifyLabels; source: string }) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState("sending");
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: "newsletter", locale: lang, email: f.get("email"), firstName: f.get("firstName"), source, website: f.get("website") ?? "" }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  const input =
    "peer block w-full border-0 border-b border-ink/25 bg-transparent px-0 pb-3 pt-6 text-lg text-ink placeholder-transparent transition-colors focus:border-sable focus:outline-none focus:ring-0";
  const label =
    "pointer-events-none absolute left-0 top-6 text-lg text-ink/50 transition-all peer-focus:top-0 peer-focus:text-xs peer-focus:text-sable peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs";

  return (
    <AnimatePresence mode="wait">
      {state === "done" ? (
        <motion.div key="done" role="status" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="py-6">
          <p className="font-display text-3xl text-sable">{labels.done}</p>
          <p className="mt-2 text-ink/80">{labels.doneText}</p>
        </motion.div>
      ) : (
        <motion.form key="form" onSubmit={onSubmit} exit={{ opacity: 0, y: -12 }} className="grid gap-6 sm:grid-cols-[1fr_1.4fr_auto] sm:items-end">
          <div className="relative">
            <input id={`${source}-first`} name="firstName" placeholder={labels.name} autoComplete="given-name" maxLength={60} className={input} />
            <label htmlFor={`${source}-first`} className={label}>{labels.name}</label>
          </div>
          <div className="relative">
            <input id={`${source}-email`} name="email" type="email" required placeholder={labels.email} autoComplete="email" inputMode="email" className={input} />
            <label htmlFor={`${source}-email`} className={label}>{labels.email}</label>
          </div>
          <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <input name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
          </div>
          <button
            type="submit"
            disabled={state === "sending"}
            className="min-h-13 rounded-full bg-sable px-8 py-3.5 font-semibold text-night transition hover:brightness-110 disabled:opacity-60"
          >
            {state === "sending" ? labels.sending : labels.cta}
          </button>
          <p className="text-xs text-ink/50 sm:col-span-3">{labels.consent}</p>
          {state === "error" && (
            <p role="alert" className="text-terra sm:col-span-3">{labels.error}</p>
          )}
        </motion.form>
      )}
    </AnimatePresence>
  );
}
