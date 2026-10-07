"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";

export const inputBase =
  "mt-1.5 block w-full rounded-md border border-line bg-night px-3.5 text-ink placeholder:text-muted/70 focus:border-sable focus:outline-none focus:ring-1 focus:ring-sable/40 aria-[invalid=true]:border-terra";

type Common = { name: string; label: string; hint?: string; error?: string; className?: string };

export function Field({
  name,
  label,
  hint,
  error,
  className = "",
  ...rest
}: Common & Omit<React.InputHTMLAttributes<HTMLInputElement>, "name">) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm text-ink/85">
        {label}
        {rest.required && <span className="text-sable"> *</span>}
      </label>
      <input id={id} name={name} aria-invalid={error ? true : undefined} aria-describedby={hint || error ? `${id}-h` : undefined} className={`${inputBase} min-h-11`} {...rest} />
      {(error || hint) && (
        <p id={`${id}-h`} className={`mt-1 text-xs ${error ? "text-terra" : "text-muted"}`}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

export function TextArea({
  name,
  label,
  hint,
  error,
  className = "",
  ...rest
}: Common & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "name">) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm text-ink/85">
        {label}
        {rest.required && <span className="text-sable"> *</span>}
      </label>
      <textarea id={id} name={name} aria-invalid={error ? true : undefined} rows={4} className={`${inputBase} py-2.5`} {...rest} />
      {(error || hint) && <p className={`mt-1 text-xs ${error ? "text-terra" : "text-muted"}`}>{error ?? hint}</p>}
    </div>
  );
}

export function Select({
  name,
  label,
  hint,
  options,
  className = "",
  ...rest
}: Common & { options: [string, string][] } & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "name">) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm text-ink/85">{label}</label>
      <select id={id} name={name} className={`${inputBase} min-h-11`} {...rest}>
        {options.map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function Check({ name, label, defaultChecked, hint }: { name: string; label: string; defaultChecked?: boolean; hint?: string }) {
  const id = useId();
  return (
    <div className="flex items-start gap-3">
      <input id={id} name={name} type="checkbox" defaultChecked={defaultChecked} className="mt-1 h-4 w-4 accent-[var(--color-sable)]" />
      <label htmlFor={id} className="text-sm text-ink/85">
        {label}
        {hint && <span className="block text-xs text-muted">{hint}</span>}
      </label>
    </div>
  );
}

/** Downscales big phone photos in the browser so uploads stay small and fast. */
async function shrink(file: File, max = 2400): Promise<Blob> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  const bmp = await createImageBitmap(file).catch(() => null);
  if (!bmp) return file;
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  if (scale === 1 && file.size < 3_500_000) return file;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")?.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", 0.9));
}

/** Image chooser: uploads right away and keeps the resulting URL in a hidden field. */
export function ImageField({ name, label, hint, defaultValue }: { name: string; label: string; hint?: string; defaultValue?: string }) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [state, setState] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const id = useId();

  async function onPick(file: File | undefined) {
    if (!file) return;
    setState("uploading");
    setError("");
    try {
      const body = new FormData();
      const blob = await shrink(file);
      body.append("file", blob, file.name.replace(/\.\w+$/, "") + (blob.type === "image/jpeg" ? ".jpg" : ""));
      const res = await fetch("/api/admin/media", { method: "POST", body });
      const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error ?? "Envoi impossible.");
      setUrl(json.url);
      setState("idle");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Envoi impossible.");
      setState("error");
    } finally {
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div>
      <p className="text-sm text-ink/85">{label}</p>
      <input type="hidden" name={name} value={url} />
      <div className="mt-1.5 flex items-start gap-4">
        <div className="relative grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-md border border-dashed border-line bg-night">
          {url ? (
            <Image src={url} alt="" fill sizes="7rem" className="object-cover" unoptimized={url.startsWith("/media/")} />
          ) : (
            <span className="text-xs text-muted">Aucune</span>
          )}
          {state === "uploading" && <span className="absolute inset-0 grid place-items-center bg-night/80 text-xs">Envoi…</span>}
        </div>
        <div className="space-y-2 text-sm">
          <label htmlFor={id} className="inline-flex min-h-10 cursor-pointer items-center rounded-md border border-line px-3 hover:border-sable">
            {url ? "Remplacer" : "Choisir une image"}
          </label>
          <input ref={input} id={id} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => onPick(e.target.files?.[0])} />
          {url && (
            <button type="button" onClick={() => setUrl("")} className="block text-muted underline hover:text-ink">
              Retirer
            </button>
          )}
          {hint && <p className="max-w-xs text-xs text-muted">{hint}</p>}
          {state === "error" && <p role="alert" className="text-xs text-terra">{error}</p>}
        </div>
      </div>
    </div>
  );
}
