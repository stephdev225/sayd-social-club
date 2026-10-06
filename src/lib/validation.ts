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

/** Contact, ambassador and newsletter forms. `website` is a honeypot: bots fill it, people don't see it. */
export const formSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("newsletter"),
    locale: z.enum(["fr", "en"]),
    email,
    firstName: z.string().trim().max(60).optional(),
    source: z.string().trim().max(30).optional(),
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
]);

export type FormRequest = z.infer<typeof formSchema>;
