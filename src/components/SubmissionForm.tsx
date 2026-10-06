"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Locale } from "@/lib/i18n/config";

export interface FieldDef {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "textarea" | "select";
  required?: boolean;
  autoComplete?: string;
  options?: string[];
}

const input =
  "peer block w-full border-0 border-b border-ink/25 bg-transparent px-0 pb-3 pt-7 text-lg text-ink placeholder-transparent transition-colors focus:border-sable focus:outline-none focus:ring-0";
const floating =
  "pointer-events-none absolute left-0 top-7 text-lg text-ink/50 transition-all peer-focus:top-0 peer-focus:text-xs peer-focus:text-sable peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs";

/** Contact and ambassador forms: underlined fields with floating labels, honeypot, animated confirmation. */
export function SubmissionForm({
  kind,
  lang,
  fields,
  labels,
}: {
  kind: "contact" | "ambassador";
  lang: Locale;
  fields: FieldDef[];
  labels: { send: string; sending: string; sentTitle: string; sentText: string; error: string };
}) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...data, kind, locale: lang }),
      });
      setState(res.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <AnimatePresence mode="wait">
      {state === "sent" ? (
        <motion.div key="sent" role="status" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="py-10">
          <svg viewBox="0 0 64 64" className="mb-6 h-14 w-14 text-sable" aria-hidden>
            <motion.circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7 }} />
            <motion.path d="M20 33 l8 8 l16 -18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.5 }} />
          </svg>
          <p className="font-display text-4xl">{labels.sentTitle}</p>
          <p className="mt-3 max-w-md text-ink/80">{labels.sentText}</p>
        </motion.div>
      ) : (
        <motion.form key="form" onSubmit={onSubmit} exit={{ opacity: 0, y: -16 }} className="grid gap-7">
          {fields.map((f, i) => (
            <motion.div
              key={f.name}
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
              {f.type === "select" ? (
                <>
                  <label htmlFor={`${kind}-${f.name}`} className="text-xs text-ink/50">{f.label}</label>
                  <select
                    id={`${kind}-${f.name}`}
                    name={f.name}
                    defaultValue={f.options?.[0]}
                    className="mt-1 block w-full appearance-none border-0 border-b border-ink/25 bg-transparent px-0 pb-3 pt-2 text-lg text-ink focus:border-sable focus:outline-none focus:ring-0"
                  >
                    {f.options?.map((o) => (
                      <option key={o} value={o} className="bg-night">{o}</option>
                    ))}
                  </select>
                  <span aria-hidden className="pointer-events-none absolute bottom-3 right-0 text-ink/50">⌄</span>
                </>
              ) : f.type === "textarea" ? (
                <>
                  <textarea id={`${kind}-${f.name}`} name={f.name} required={f.required} rows={4} placeholder={f.label} className={`${input} resize-none`} />
                  <label htmlFor={`${kind}-${f.name}`} className={floating}>{f.label}</label>
                </>
              ) : (
                <>
                  <input
                    id={`${kind}-${f.name}`}
                    name={f.name}
                    type={f.type ?? "text"}
                    required={f.required}
                    autoComplete={f.autoComplete}
                    placeholder={f.label}
                    className={input}
                  />
                  <label htmlFor={`${kind}-${f.name}`} className={floating}>{f.label}</label>
                </>
              )}
            </motion.div>
          ))}
          <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label>
              Website <input name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
            </label>
          </div>
          {state === "error" && (
            <p role="alert" className="text-terra">{labels.error}</p>
          )}
          <button
            type="submit"
            disabled={state === "sending"}
            className="group inline-flex min-h-14 items-center justify-center gap-3 justify-self-stretch rounded-full bg-sable px-9 font-semibold text-night transition hover:brightness-110 disabled:opacity-60 sm:justify-self-start"
          >
            {state === "sending" ? labels.sending : labels.send}
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
