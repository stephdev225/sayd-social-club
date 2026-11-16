import { describe, expect, it } from "vitest";
import { frameHeight, ticketingEmbed } from "@/lib/ticketing-embed";

describe("ticketingEmbed", () => {
  it("accepts a Le Point de Vente ticket page and sets the visitor's language", () => {
    expect(ticketingEmbed("https://lepointdevente.com/billets/la-finale?lang=fr", "en")).toEqual({
      origin: "https://lepointdevente.com",
      url: "https://lepointdevente.com/billets/la-finale?lang=en",
    });
    expect(ticketingEmbed("https://thepointofsale.com/tickets/sprezzatura", "fr")?.origin).toBe("https://thepointofsale.com");
  });

  it("refuses anything that is not an https ticket page of a known partner", () => {
    expect(ticketingEmbed(undefined, "fr")).toBeNull();
    expect(ticketingEmbed("not a url", "fr")).toBeNull();
    expect(ticketingEmbed("http://lepointdevente.com/billets/la-finale", "fr")).toBeNull();
    expect(ticketingEmbed("https://lepointdevente.com.evil.example/billets/la-finale", "fr")).toBeNull();
    expect(ticketingEmbed("https://example.com/billets/la-finale", "fr")).toBeNull();
    expect(ticketingEmbed("https://lepointdevente.com/compte", "fr")).toBeNull();
  });
});

describe("frameHeight", () => {
  it("rounds up and keeps the height within bounds", () => {
    expect(frameHeight(452.547)).toBe(453);
    expect(frameHeight("700")).toBe(700);
    expect(frameHeight(10)).toBe(320);
    expect(frameHeight(999999)).toBe(6000);
  });
  it("ignores unusable values", () => {
    expect(frameHeight("abc")).toBeNull();
    expect(frameHeight(-5)).toBeNull();
    expect(frameHeight(undefined)).toBeNull();
  });
});
