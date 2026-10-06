"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n/config";

interface Labels {
  label: string;
  cta: string;
  done: string;
  error: string;
  sending: string;
}

export function NewsletterForm({ lang, labels }: { lang: Locale; labels: Labels }) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email");
    setState("sending");
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: "newsletter", locale: lang, email, website: "" }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p role="status" className="text-bottle-ink">
        {labels.done}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-md flex-col gap-3 sm:flex-row">
      <label htmlFor="newsletter-email" className="sr-only">
        {labels.label}
      </label>
      <input
        id="newsletter-email"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder={labels.label}
        className="min-h-12 flex-1 rounded-md border border-line bg-night-2 px-4 text-ink placeholder:text-muted focus:border-sable focus:outline-none"
      />
      <button
        type="submit"
        disabled={state === "sending"}
        className="min-h-12 rounded-md border border-sable px-5 font-semibold text-sable transition hover:bg-sable hover:text-night disabled:opacity-60"
      >
        {state === "sending" ? labels.sending : labels.cta}
      </button>
      {state === "error" && (
        <p role="alert" className="text-sm text-terra sm:basis-full">
          {labels.error}
        </p>
      )}
    </form>
  );
}
