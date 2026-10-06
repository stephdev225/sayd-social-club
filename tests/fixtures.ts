import { MemoryStore } from "@/lib/data/memory-store";
import type { PaymentGateway } from "@/lib/services/checkout";
import type { SaydEvent, TicketType } from "@/lib/domain/types";

export const NOW = new Date("2026-10-06T12:00:00.000Z");

export const event: SaydEvent = {
  id: "evt1",
  slug: "test",
  name: "Test Night",
  tagline: { fr: "", en: "" },
  description: { fr: "", en: "" },
  startsAt: "2026-10-12T02:00:00.000Z",
  endsAt: "2026-10-12T07:00:00.000Z",
  venueName: "Mora",
  address: "Grande Allée Est",
  city: "Québec",
  capacity: 100,
  status: "published",
  lineup: [],
  partners: [],
};

export function ticketType(over: Partial<TicketType> = {}): TicketType {
  return {
    id: "ga",
    eventId: "evt1",
    name: { fr: "Billet en ligne", en: "Online ticket" },
    description: { fr: "", en: "" },
    priceCents: 2649,
    currency: "cad",
    quantityTotal: 10,
    quantitySold: 0,
    quantityReserved: 0,
    maxPerOrder: 10,
    active: true,
    sortOrder: 1,
    channels: ["online"],
    ...over,
  };
}

export function makeStore(types: TicketType[] = [ticketType()], ev: SaydEvent = event) {
  return new MemoryStore({
    events: { [ev.id]: ev as unknown as Record<string, unknown> },
    ticketTypes: Object.fromEntries(types.map((t) => [t.id, t as unknown as Record<string, unknown>])),
  });
}

export function fakeGateway(opts: { fail?: boolean } = {}) {
  const calls: Parameters<PaymentGateway["createCheckoutSession"]>[0][] = [];
  const gateway: PaymentGateway = {
    async createCheckoutSession(input) {
      calls.push(input);
      if (opts.fail) throw new Error("stripe down");
      return { id: `cs_test_${input.orderId}`, url: `https://checkout.stripe.test/${input.orderId}` };
    },
  };
  return { gateway, calls };
}

export const customer = {
  firstName: "Awa",
  lastName: "Diallo",
  email: "Awa@Example.com ",
  marketingOptIn: false,
};
