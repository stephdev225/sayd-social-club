import type { Locale } from "@/lib/i18n/config";
import { intlLocale } from "@/lib/i18n/config";

/** Québec sales taxes, applied on top of ticket prices (prices are shown before taxes). */
export const SALES_TAXES = [
  { id: "gst", label: { fr: "TPS", en: "GST" }, rate: 0.05 },
  { id: "qst", label: { fr: "TVQ", en: "QST" }, rate: 0.09975 },
] as const;

export interface LineInput {
  unitPriceCents: number;
  quantity: number;
}

export interface Totals {
  subtotalCents: number;
  taxes: { id: string; cents: number }[];
  taxCents: number;
  totalCents: number;
}

/**
 * Mirrors Stripe's exclusive tax-rate behaviour: each tax is computed per line
 * item and rounded half-up to the cent. Stripe's own totals remain the source of
 * truth once paid; this is used for display and pre-checkout validation.
 */
export function computeTotals(lines: LineInput[]): Totals {
  for (const line of lines) {
    if (!Number.isInteger(line.unitPriceCents) || line.unitPriceCents < 0) {
      throw new Error("unitPriceCents must be a non-negative integer");
    }
    if (!Number.isInteger(line.quantity) || line.quantity < 0) {
      throw new Error("quantity must be a non-negative integer");
    }
  }
  const lineAmounts = lines.map((l) => l.unitPriceCents * l.quantity);
  const subtotalCents = lineAmounts.reduce((a, b) => a + b, 0);
  const taxes = SALES_TAXES.map((tax) => ({
    id: tax.id,
    cents: lineAmounts.reduce((sum, amount) => sum + Math.round(amount * tax.rate), 0),
  }));
  const taxCents = taxes.reduce((a, t) => a + t.cents, 0);
  return { subtotalCents, taxes, taxCents, totalCents: subtotalCents + taxCents };
}

/** Price of one ticket with taxes, as the buyer will pay it. */
export function priceWithTaxes(unitPriceCents: number): number {
  return computeTotals([{ unitPriceCents, quantity: 1 }]).totalCents;
}

export function formatMoney(cents: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale[locale], {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

/**
 * Inverse of priceWithTaxes: the price before taxes that gives the all-in price the
 * organiser wants to display (e.g. 26,49 $ → 23,04 $). Because each tax is rounded to
 * the cent, some all-in amounts cannot be reached exactly; `exact` is then false and
 * `allInCents` is the closest reachable price.
 */
export function preTaxForAllIn(allInCents: number): { priceCents: number; allInCents: number; exact: boolean } {
  if (!Number.isInteger(allInCents) || allInCents < 0) throw new Error("allInCents must be a non-negative integer");
  const rate = 1 + SALES_TAXES.reduce((s, t) => s + t.rate, 0);
  const guess = Math.round(allInCents / rate);
  let best = { priceCents: guess, allInCents: priceWithTaxes(guess) };
  for (let p = Math.max(0, guess - 3); p <= guess + 3; p++) {
    const total = priceWithTaxes(p);
    if (total === allInCents) return { priceCents: p, allInCents: total, exact: true };
    if (Math.abs(total - allInCents) < Math.abs(best.allInCents - allInCents)) best = { priceCents: p, allInCents: total };
  }
  return { ...best, exact: false };
}
