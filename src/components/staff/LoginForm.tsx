"use client";

import { useState } from "react";

const MESSAGES: Record<string, string> = {
  wrong_password: "Mot de passe incorrect.",
  rate_limited: "Trop d'essais. Attendez une minute.",
  not_configured: "Accès non configuré : ajoutez ADMIN_PASSWORD dans Vercel.",
  invalid: "Remplissez les deux champs.",
};

export function LoginForm({ next }: { next: string }) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const f = new FormData(e.currentTarget);
    const res = await fetch("/api/staff/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: f.get("name"), password: f.get("password") }),
    }).catch(() => null);
    const body = (await res?.json().catch(() => ({}))) as { role?: string; error?: string };
    if (res?.ok && body.role) {
      window.location.assign(body.role === "staff" ? "/scan" : next);
      return;
    }
    setError(MESSAGES[body.error ?? ""] ?? "Connexion impossible.");
    setBusy(false);
  }

  const input = "mt-1.5 block min-h-12 w-full rounded-md border border-line bg-night-2 px-3.5 text-ink focus:border-sable focus:outline-none";
  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <div>
        <label htmlFor="name" className="text-sm text-muted">Votre prénom (affiché dans le journal des entrées)</label>
        <input id="name" name="name" required autoComplete="given-name" className={input} />
      </div>
      <div>
        <label htmlFor="password" className="text-sm text-muted">Mot de passe</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className={input} />
      </div>
      {error && <p role="alert" className="text-terra">{error}</p>}
      <button disabled={busy} className="min-h-12 rounded-full bg-sable font-semibold text-night disabled:opacity-60">
        {busy ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
