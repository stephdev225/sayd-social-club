/**
 * Domain model for Sayd Social Club ticketing.
 * Money is always stored in integer cents. Dates are ISO strings at the edges,
 * Firestore Timestamps in storage (converted in the data layer).
 */

export type Localized = { fr: string; en: string };

export type EventStatus = "draft" | "published" | "sold_out" | "cancelled" | "archived";

export interface SaydEvent {
  id: string;
  slug: string;
  name: string;
  edition?: Localized;
  tagline: Localized;
  description: Localized;
  startsAt: string; // ISO, with offset
  endsAt: string;
  venueName: string;
  address: string;
  city: string;
  capacity: number;
  status: EventStatus;
  coverImage?: string; // official poster (with text)
  /** Clean visual without text, used large on the site. Falls back to coverImage. */
  heroImage?: string;
  /** While online sales are not open on this site, where tickets are sold (e.g. Le Point de Vente). */
  externalTicketUrl?: string;
  dressCode?: Localized;
  lineup: string[];
  partners: string[];
  /** Links for lineup names, e.g. { Waklexx: "https://instagram.com/..." }. */
  instagram?: Record<string, string>;
  /** Event-specific accent colour used on the event page (hex). */
  accent?: string;
}

export interface TicketType {
  id: string;
  eventId: string;
  name: Localized;
  description: Localized;
  priceCents: number; // before taxes
  currency: "cad";
  quantityTotal: number;
  quantitySold: number;
  quantityReserved: number;
  maxPerOrder: number;
  active: boolean;
  sortOrder: number;
  /** Where this ticket can be sold. Door tickets never appear online. */
  channels: OrderChannel[];
  salesStartAt?: string;
  salesEndAt?: string;
}

export type OrderStatus = "pending" | "paid" | "expired" | "failed" | "refunded" | "cancelled";
export type OrderChannel = "online" | "door";

export interface OrderItem {
  ticketTypeId: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
}

export interface Order {
  id: string;
  eventId: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  items: OrderItem[];
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  currency: "cad";
  status: OrderStatus;
  channel: OrderChannel;
  locale: "fr" | "en";
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  ticketIds: string[];
  emailSentAt?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  marketingOptIn: boolean;
  createdAt: string;
}

export type PaymentStatus = "paid" | "pending" | "failed" | "refunded";

export interface Payment {
  id: string;
  orderId: string;
  stripeCheckoutSessionId: string;
  stripePaymentIntentId?: string;
  amountCents: number;
  currency: "cad";
  status: PaymentStatus;
  paidAt?: string;
  refundedAt?: string;
}

export type TicketStatus = "valid" | "used" | "cancelled" | "refunded";

export interface Ticket {
  id: string; // also the QR payload, e.g. SAYD-26-8QK4M2TZ7P
  orderId: string;
  eventId: string;
  customerId: string;
  ticketTypeId: string;
  ticketTypeName: string;
  holderName: string;
  status: TicketStatus;
  checkedInAt?: string;
  checkedInBy?: string;
  createdAt: string;
}
