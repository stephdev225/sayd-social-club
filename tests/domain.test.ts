import { describe, expect, it } from "vitest";
import { computeTotals, formatMoney } from "@/lib/domain/money";
import { availableQuantity, checkReservation } from "@/lib/domain/inventory";
import { newTicketCode, normalizeTicketCode } from "@/lib/domain/ids";
import { pickLocale } from "@/lib/i18n/config";
import { ticketType } from "./fixtures";

describe("money", () => {
  it("adds GST 5% and QST 9.975% on top of the price, per line", () => {
    const t = computeTotals([{ unitPriceCents: 2649, quantity: 1 }]);
    expect(t.subtotalCents).toBe(2649);
    expect(t.taxes).toEqual([
      { id: "gst", cents: 132 }, // 132.45
      { id: "qst", cents: 264 }, // 264.24
    ]);
    expect(t.totalCents).toBe(3045);
  });

  it("computes tax on the line amount, not per unit", () => {
    const t = computeTotals([{ unitPriceCents: 2649, quantity: 4 }]);
    expect(t.subtotalCents).toBe(10596);
    expect(t.taxCents).toBe(Math.round(10596 * 0.05) + Math.round(10596 * 0.09975));
  });

  it("rejects non-integer cents", () => {
    expect(() => computeTotals([{ unitPriceCents: 26.49, quantity: 1 }])).toThrow();
  });

  it("formats CAD for Québec French and English", () => {
    expect(formatMoney(2649, "fr").replace(/\s/g, " ")).toBe("26,49 $");
    expect(formatMoney(3000, "en")).toBe("$30");
  });
});

describe("inventory", () => {
  it("available = total - sold - reserved, never negative", () => {
    expect(availableQuantity({ quantityTotal: 10, quantitySold: 6, quantityReserved: 3 })).toBe(1);
    expect(availableQuantity({ quantityTotal: 10, quantitySold: 9, quantityReserved: 3 })).toBe(0);
  });

  it("refuses more than what is left", () => {
    const r = checkReservation(ticketType({ quantitySold: 8, quantityReserved: 1 }), 2);
    expect(r).toEqual({ ok: false, error: "insufficient_stock", available: 1 });
  });

  it("refuses when sold out, inactive, over max, or outside the sales window", () => {
    expect(checkReservation(ticketType({ quantitySold: 10 }), 1)).toMatchObject({ error: "sold_out" });
    expect(checkReservation(ticketType({ active: false }), 1)).toMatchObject({ error: "inactive" });
    expect(checkReservation(ticketType({ maxPerOrder: 4 }), 5)).toMatchObject({ error: "over_max_per_order" });
    const now = new Date("2026-10-06T12:00:00Z");
    expect(checkReservation(ticketType({ salesStartAt: "2026-10-07T00:00:00Z" }), 1, now)).toMatchObject({
      error: "not_on_sale_yet",
    });
    expect(checkReservation(ticketType({ salesEndAt: "2026-10-05T00:00:00Z" }), 1, now)).toMatchObject({
      error: "sales_ended",
    });
  });
});

describe("ticket codes", () => {
  it("have the SAYD-YY-XXXXXXXXXX shape and are unique", () => {
    const codes = new Set(Array.from({ length: 5000 }, () => newTicketCode(2026)));
    expect(codes.size).toBe(5000);
    for (const c of codes) expect(c).toMatch(/^SAYD-26-[0-9A-HJKMNP-TV-Z]{10}$/);
  });

  it("normalises what staff type at the door", () => {
    const code = newTicketCode(2026);
    expect(normalizeTicketCode(` ${code.toLowerCase()} `)).toBe(code);
    expect(normalizeTicketCode("sayd-26-8qk4m2tz7o")).toBe("SAYD-26-8QK4M2TZ70"); // O → 0
    expect(normalizeTicketCode("not a ticket")).toBeNull();
    expect(normalizeTicketCode("https://evil.example/SAYD-26-8QK4M2TZ7P")).toBeNull();
  });
});

describe("locale", () => {
  it("defaults to French and honours Accept-Language", () => {
    expect(pickLocale(null)).toBe("fr");
    expect(pickLocale("en-CA,en;q=0.9,fr;q=0.8")).toBe("en");
    expect(pickLocale("es-ES,es;q=0.9")).toBe("fr");
    expect(pickLocale("es;q=1,fr-CA;q=0.5,en;q=0.4")).toBe("fr");
  });
});

describe("Sprezzatura price", () => {
  it("23,04 $ before tax is exactly 26,49 $ with GST and QST", async () => {
    const { priceWithTaxes } = await import("@/lib/domain/money");
    expect(priceWithTaxes(2304)).toBe(2649);
  });
});
