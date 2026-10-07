import { z } from "zod";

const name = z.string().trim().min(1).max(80);
const email = z.string().trim().toLowerCase().max(254).pipe(z.email());
const phone = z
  .string()
  .trim()
  .max(30)
  .regex(/^[+()\d\s.-]{7,30}$/)
  .optional()
  .or(z.literal("").transform(() => undefined));

export const checkoutSchema = z.object({
  eventId: z.string().min(1).max(100),
  locale: z.enum(["fr", "en"]),
  items: z
    .array(z.object({ ticketTypeId: z.string().min(1).max(100), quantity: z.number().int().min(0).max(20) }))
    .min(1)
    .max(10),
  customer: z.object({
    firstName: name,
    lastName: name,
    email,
    phone,
    marketingOptIn: z.boolean().default(false),
  }),
  acceptTerms: z.literal(true),
});

export type CheckoutRequest = z.infer<typeof checkoutSchema>;

/** Contact, ambassador, partnership and newsletter forms. `website` is a honeypot: bots fill it, people don't see it. */
export const formSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("newsletter"),
    locale: z.enum(["fr", "en"]),
    email,
    firstName: z.string().trim().max(60).optional(),
    source: z.string().trim().max(80).optional(),
    website: z.literal("").optional(),
  }),
  z.object({
    kind: z.literal("contact"),
    locale: z.enum(["fr", "en"]),
    name,
    email,
    phone: z.string().trim().max(30).regex(/^[+()\d\s.-]*$/).optional(),
    subject: z.string().trim().max(120).optional(),
    message: z.string().trim().min(5).max(4000),
    website: z.literal("").optional(),
  }),
  z.object({
    kind: z.literal("ambassador"),
    locale: z.enum(["fr", "en"]),
    name,
    email,
    phone: z.string().trim().min(7).max(30).regex(/^[+()\d\s.-]+$/),
    instagram: z.string().trim().max(60).optional(),
    message: z.string().trim().min(5).max(2000),
    website: z.literal("").optional(),
  }),
  z.object({
    kind: z.literal("partnership"),
    locale: z.enum(["fr", "en"]),
    company: z.string().trim().min(1).max(120),
    name,
    email,
    phone: z.string().trim().max(30).regex(/^[+()\d\s.-]*$/).optional(),
    type: z.string().trim().max(60).optional(),
    message: z.string().trim().min(5).max(4000),
    website: z.literal("").optional(),
  }),
]);

export type FormRequest = z.infer<typeof formSchema>;

/* ───────────── Admin: events and ticket types ───────────── */

const text = (max: number) => z.string().trim().max(max);
const optionalText = (max: number) => text(max).optional().transform((v) => (v ? v : undefined));
/** Images must be files served by this site (/events/… or uploaded /media/…). */
const localImage = z
  .string()
  .trim()
  .max(200)
  .regex(/^\/[A-Za-z0-9._\-/]+$/, "image")
  .optional()
  .or(z.literal("").transform(() => undefined));

export const eventInputSchema = z.object({
  name: text(80).min(2),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  editionFr: optionalText(60),
  editionEn: optionalText(60),
  taglineFr: text(160).min(2),
  taglineEn: text(160).min(2),
  descriptionFr: text(3000).min(10),
  descriptionEn: text(3000).min(10),
  dressCodeFr: optionalText(300),
  dressCodeEn: optionalText(300),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "time"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "time"),
  venueName: text(80).min(2),
  address: text(160).min(2),
  city: text(60).min(2),
  capacity: z.coerce.number().int().min(1).max(20000),
  status: z.enum(["draft", "published", "sold_out", "cancelled", "archived"]),
  /** One artist per line, optionally followed by " | link". */
  lineup: text(1000).default(""),
  partners: text(300).default(""),
  heroImage: localImage,
  coverImage: localImage,
  externalTicketUrl: z
    .string()
    .trim()
    .max(400)
    .pipe(z.url({ protocol: /^https$/ }))
    .optional()
    .or(z.literal("").transform(() => undefined)),
});
export type EventInput = z.infer<typeof eventInputSchema>;

/** Accepts "26,49", "26.49", "26,49 $" → 2649 cents. */
const moneyCents = z
  .string()
  .trim()
  .transform((v) => v.replace(/\s|\$/g, "").replace(",", "."))
  .pipe(z.string().regex(/^\d{1,5}(\.\d{1,2})?$/, "price"))
  .transform((v) => Math.round(Number(v) * 100));

export const ticketTypeInputSchema = z.object({
  nameFr: text(60).min(2),
  nameEn: text(60).min(2),
  descriptionFr: text(300).default(""),
  descriptionEn: text(300).default(""),
  allInPrice: moneyCents,
  quantityTotal: z.coerce.number().int().min(0).max(20000),
  maxPerOrder: z.coerce.number().int().min(1).max(20),
  sortOrder: z.coerce.number().int().min(0).max(99).default(0),
  online: z.boolean(),
  door: z.boolean(),
  active: z.boolean(),
});
export type TicketTypeInput = z.infer<typeof ticketTypeInputSchema>;
