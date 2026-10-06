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

export function formatMoney(cents: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale[locale], {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}
