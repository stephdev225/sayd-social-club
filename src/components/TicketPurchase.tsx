"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { computeTotals, formatMoney, priceWithTaxes, SALES_TAXES } from "@/lib/domain/money";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { t } from "@/lib/i18n/format";

export interface PurchasableTicket {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  available: number;
  maxPerOrder: number;
}

type Field = "firstName" | "lastName" | "email" | "phone" | "terms";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function TicketPurchase({
  lang,
  eventId,
  ticketTypes,
  onSale,
  dict,
}: {
  lang: Locale;
  eventId: string;
  ticketTypes: PurchasableTicket[];
  onSale: boolean;
  dict: Pick<Dictionary, "tickets">;
}) {
  const d = dict.tickets;
  const [qty, setQty] = useState<Record<string, number>>(() =>
    // One ticket type with stock: preselect 1 so the total shows immediately.
    ticketTypes.length === 1 && ticketTypes[0].available > 0 ? { [ticketTypes[0].id]: 1 } : {},
  );
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const lines = ticketTypes.filter((tt) => (qty[tt.id] ?? 0) > 0);
  const totals = useMemo(
    () => computeTotals(lines.map((l) => ({ unitPriceCents: l.priceCents, quantity: qty[l.id] }))),
    [lines, qty],
  );

  function change(tt: PurchasableTicket, delta: number) {
    const max = Math.min(tt.available, tt.maxPerOrder);
    setQty((q) => ({ ...q, [tt.id]: Math.max(0, Math.min(max, (q[tt.id] ?? 0) + delta)) }));
    setFormError(null);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    const f = new FormData(e.currentTarget);
    const values = {
      firstName: String(f.get("firstName") ?? "").trim(),
      lastName: String(f.get("lastName") ?? "").trim(),
      email: String(f.get("email") ?? "").trim(),
      phone: String(f.get("phone") ?? "").trim(),
      marketingOptIn: f.get("marketing") === "on",
      terms: f.get("terms") === "on",
    };
    const next: Partial<Record<Field, string>> = {};
    if (!values.firstName) next.firstName = d.fieldErrors.firstName;
    if (!values.lastName) next.lastName = d.fieldErrors.lastName;
    if (!EMAIL.test(values.email)) next.email = d.fieldErrors.email;
    if (values.phone && !/^[+()\d\s.-]{7,30}$/.test(values.phone)) next.phone = d.fieldErrors.phone;
    if (!values.terms) next.terms = d.fieldErrors.terms;
    setErrors(next);
    if (lines.length === 0) return setFormError(d.selectFirst);
    if (Object.keys(next).length) {
      setFormError(d.errors.invalid);
      const first = Object.keys(next)[0];
      document.getElementById(`f-${first}`)?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          eventId,
          locale: lang,
          items: lines.map((l) => ({ ticketTypeId: l.id, quantity: qty[l.id] })),
          customer: {
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            phone: values.phone,
            marketingOptIn: values.marketingOptIn,
          },
          acceptTerms: true,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { url?: string; error?: string; available?: number };
      if (res.ok && body.url) {
        window.location.assign(body.url);
        return; // keep the button in its loading state while the browser leaves
      }
      const key = (body.error ?? "generic") as keyof typeof d.errors;
      setFormError(t(d.errors[key] ?? d.errors.generic, { n: body.available ?? 0 }));
    } catch {
      setFormError(d.errors.generic);
    }
    setSubmitting(false);
  }

  if (!onSale || ticketTypes.length === 0) {
    return (
      <div className="rounded-3xl bg-night-2/80 p-6 ring-1 ring-ink/10">
        <h2 className="t-h3">{d.title}</h2>
        <p className="mt-3 text-muted">{d.unavailable}</p>
      </div>
    );
  }

  const inputCls =
    "mt-1.5 block min-h-12 w-full rounded-md border bg-night px-3.5 text-ink placeholder:text-muted focus:border-sable focus:outline-none aria-[invalid=true]:border-terra";

  return (
    <form
      onSubmit={onSubmit}
      onChange={(e) => {
        const name = (e.target as EventTarget & { name?: string }).name as Field;
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
      }}
      noValidate
      className="overflow-hidden rounded-3xl bg-night-2/80 ring-1 ring-ink/10 backdrop-blur"
      aria-labelledby="titre-billets"
    >
      <div className="p-5 sm:p-6">
        <h2 id="titre-billets" className="t-h3">{d.title}</h2>
        <p className="mt-1 text-sm text-muted">{d.pricesNote}</p>

        <ul className="mt-5 divide-y divide-ink/10">
          {ticketTypes.map((tt) => {
            const n = qty[tt.id] ?? 0;
            const soldOut = tt.available === 0;
            const max = Math.min(tt.available, tt.maxPerOrder);
            return (
              <li key={tt.id} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="font-semibold text-ink">{tt.name}</p>
                  <p className="text-sm text-muted">{tt.description}</p>
                  <p className="mt-1 text-ink">
                    {formatMoney(priceWithTaxes(tt.priceCents), lang)} <span className="text-sm text-muted">{d.taxesIncluded}</span>
                  </p>
                  {soldOut ? (
                    <p className="text-sm text-terra">{d.soldOut}</p>
                  ) : (
                    tt.available <= 20 && <p className="text-sm text-terra">{tt.available} {d.available}</p>
                  )}
                </div>
                {!soldOut && (
                  <div className="flex items-center gap-1" role="group" aria-label={tt.name}>
                    <button
                      type="button"
                      onClick={() => change(tt, -1)}
                      disabled={n === 0}
                      aria-label={`${d.decrease} — ${tt.name}`}
                      className="h-11 w-11 rounded-full border border-line text-xl text-ink disabled:opacity-30"
                    >
                      −
                    </button>
                    <output aria-live="polite" className="relative h-7 w-8 overflow-hidden text-center text-lg tabular-nums">
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={n}
                          className="absolute inset-0"
                          initial={{ y: "-100%", opacity: 0 }}
                          animate={{ y: "0%", opacity: 1 }}
                          exit={{ y: "100%", opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        >
                          {n}
                        </motion.span>
                      </AnimatePresence>
                    </output>
                    <button
                      type="button"
                      onClick={() => change(tt, 1)}
                      disabled={n >= max}
                      aria-label={`${d.increase} — ${tt.name}`}
                      className="h-11 w-11 rounded-full border border-line text-xl text-ink disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {lines.length > 0 && (
          <dl className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between text-muted">
              <dt>{d.subtotal}</dt>
              <dd className="tabular-nums">{formatMoney(totals.subtotalCents, lang)}</dd>
            </div>
            {SALES_TAXES.map((tax, i) => (
              <div key={tax.id} className="flex justify-between text-muted">
                <dt>{tax.label[lang]}</dt>
                <dd className="tabular-nums">{formatMoney(totals.taxes[i].cents, lang)}</dd>
              </div>
            ))}
            <div className="flex justify-between pt-2 text-base font-semibold text-ink">
              <dt>{d.total}</dt>
              <dd className="tabular-nums">
                <motion.span key={totals.totalCents} initial={{ opacity: 0.3, y: -4 }} animate={{ opacity: 1, y: 0 }} className="inline-block">
                  {formatMoney(totals.totalCents, lang)}
                </motion.span>
              </dd>
            </div>
          </dl>
        )}
      </div>

      <fieldset className="border-t border-ink/10 p-5 sm:p-6">
        <legend className="sr-only">{d.yourInfo}</legend>
        <p className="font-semibold text-ink" aria-hidden>{d.yourInfo}</p>
        <p className="mt-1 text-sm text-muted">{d.infoNote}</p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {(
            [
              ["firstName", d.firstName, "given-name", "text"],
              ["lastName", d.lastName, "family-name", "text"],
            ] as const
          ).map(([key, label, ac, type]) => (
            <div key={key}>
              <label htmlFor={`f-${key}`} className="text-sm text-muted">{label}</label>
              <input
                id={`f-${key}`}
                name={key}
                type={type}
                autoComplete={ac}
                required
                aria-invalid={Boolean(errors[key])}
                aria-describedby={errors[key] ? `e-${key}` : undefined}
                className={`${inputCls} border-line`}
              />
              {errors[key] && <p id={`e-${key}`} className="mt-1 text-sm text-terra">{errors[key]}</p>}
            </div>
          ))}
          {(
            [
              ["email", d.email, "email", "email"],
              ["phone", d.phone, "tel", "tel"],
            ] as const
          ).map(([key, label, ac, type]) => (
            <div key={key} className="sm:col-span-2">
              <label htmlFor={`f-${key}`} className="text-sm text-muted">{label}</label>
              <input
                id={`f-${key}`}
                name={key}
                type={type}
                autoComplete={ac}
                inputMode={type === "email" ? "email" : "tel"}
                required={key === "email"}
                aria-invalid={Boolean(errors[key])}
                aria-describedby={errors[key] ? `e-${key}` : undefined}
                className={`${inputCls} border-line`}
              />
              {errors[key] && <p id={`e-${key}`} className="mt-1 text-sm text-terra">{errors[key]}</p>}
            </div>
          ))}
        </div>

        <label className="mt-5 flex gap-3 text-sm text-muted">
          <input type="checkbox" name="marketing" className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-sable)]" />
          {d.marketing}
        </label>
        <label className="mt-3 flex gap-3 text-sm text-muted">
          <input
            id="f-terms"
            type="checkbox"
            name="terms"
            aria-invalid={Boolean(errors.terms)}
            className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-sable)]"
          />
          <span>
            {d.terms}{" "}
            <Link href={`/${lang}/conditions`} className="text-ink underline underline-offset-2" target="_blank">
              {d.readTerms}
            </Link>
          </span>
        </label>
        {errors.terms && <p className="mt-1 text-sm text-terra">{errors.terms}</p>}

        {formError && (
          <p role="alert" className="mt-5 border-l-2 border-terra pl-3 text-terra">
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 min-h-13 w-full rounded-full bg-sable px-6 py-3.5 text-base font-semibold text-night transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
        >
          {submitting ? d.paying : t(d.pay, { amount: formatMoney(totals.totalCents, lang) })}
        </button>
        <p className="mt-3 text-center text-xs text-muted">{d.secure}</p>
      </fieldset>
    </form>
  );
}
