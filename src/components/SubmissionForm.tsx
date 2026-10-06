"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n/config";

export interface FieldDef {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "textarea";
  required?: boolean;
  autoComplete?: string;
}

export function SubmissionForm({
  kind,
  lang,
  fields,
  labels,
}: {
  kind: "contact" | "ambassador";
  lang: Locale;
  fields: FieldDef[];
  labels: { send: string; sending: string; sent: string; error: string };
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

  if (state === "sent") {
    return (
      <p role="status" className="border-l-2 border-bottle-ink pl-4 text-lg text-bottle-ink">
        {labels.sent}
      </p>
    );
  }

  const cls =
    "mt-1.5 block w-full rounded-md border border-line bg-night-2 px-3.5 text-ink placeholder:text-muted focus:border-sable focus:outline-none";

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      {fields.map((f) => (
        <div key={f.name}>
          <label htmlFor={`${kind}-${f.name}`} className="text-sm text-muted">
            {f.label}
          </label>
          {f.type === "textarea" ? (
            <textarea id={`${kind}-${f.name}`} name={f.name} required={f.required} rows={5} className={`${cls} py-3`} />
          ) : (
            <input
              id={`${kind}-${f.name}`}
              name={f.name}
              type={f.type ?? "text"}
              required={f.required}
              autoComplete={f.autoComplete}
              className={`${cls} min-h-12`}
            />
          )}
        </div>
      ))}
      {/* Honeypot: hidden from people, filled by bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website <input name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      {state === "error" && (
        <p role="alert" className="text-terra">
          {labels.error}
        </p>
      )}
      <button
        type="submit"
        disabled={state === "sending"}
        className="min-h-12 justify-self-start rounded-full bg-sable px-8 font-semibold text-night transition hover:brightness-110 disabled:opacity-60"
      >
        {state === "sending" ? labels.sending : labels.send}
      </button>
    </form>
  );
}
