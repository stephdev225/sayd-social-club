import { describe, expect, it } from "vitest";
import { preTaxForAllIn, priceWithTaxes } from "@/lib/domain/money";
import { isoToLocal, localToIso, nightRange } from "@/lib/time";

describe("preTaxForAllIn", () => {
  it("finds the Sprezzatura price: 26,49 $ all-in = 23,04 $ before taxes", () => {
    expect(preTaxForAllIn(2649)).toEqual({ priceCents: 2304, allInCents: 2649, exact: true });
  });
  it("round-trips every price from 1 $ to 300 $ when reachable", () => {
    for (let p = 100; p <= 30000; p += 7) {
      const all = priceWithTaxes(p);
      const r = preTaxForAllIn(all);
      expect(r.exact).toBe(true);
      expect(priceWithTaxes(r.priceCents)).toBe(all);
    }
  });
  it("reports the closest price when the exact amount is unreachable", () => {
    const r = preTaxForAllIn(3000);
    expect(Math.abs(r.allInCents - 3000)).toBeLessThanOrEqual(1);
    expect(priceWithTaxes(r.priceCents)).toBe(r.allInCents);
  });
});

describe("Québec time", () => {
  it("converts a local evening to UTC (EDT, UTC-4)", () => {
    expect(localToIso("2026-10-11", "22:00")).toBe("2026-10-12T02:00:00.000Z");
  });
  it("handles winter time (EST, UTC-5)", () => {
    expect(localToIso("2026-12-31", "21:30")).toBe("2027-01-01T02:30:00.000Z");
  });
  it("converts back", () => {
    expect(isoToLocal("2026-10-12T02:00:00.000Z")).toEqual({ date: "2026-10-11", time: "22:00" });
  });
  it("rolls the end of the night past midnight", () => {
    expect(nightRange("2026-10-11", "22:00", "03:00")).toEqual({
      startsAt: "2026-10-12T02:00:00.000Z",
      endsAt: "2026-10-12T07:00:00.000Z",
    });
  });
});
