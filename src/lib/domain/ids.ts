import { randomInt } from "node:crypto";

/** Crockford base32: no I, L, O, U — easy to read aloud and to type at the door. */
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function randomCode(length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[randomInt(ALPHABET.length)];
  return out;
}

/**
 * Ticket code, also the QR payload. 10 random base32 chars = 50 bits of entropy:
 * impossible to guess, and only valid if it exists in our database.
 * Example: SAYD-26-8QK4M2TZ7P
 */
export function newTicketCode(eventYear: number): string {
  return `SAYD-${String(eventYear % 100).padStart(2, "0")}-${randomCode(10)}`;
}

export function newOrderId(): string {
  return `ORD-${randomCode(8)}`;
}

const TICKET_CODE = /^SAYD-\d{2}-[0-9A-HJKMNP-TV-Z]{10}$/;

/** Normalises what a scanner or a staff member typed (case, spaces, O→0, I/L→1). */
export function normalizeTicketCode(input: string): string | null {
  const cleaned = input
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/[^A-Z0-9-]/g, "");
  const parts = cleaned.split("-");
  if (parts.length === 3) {
    parts[2] = parts[2].replace(/O/g, "0").replace(/[IL]/g, "1");
  }
  const code = parts.join("-");
  return TICKET_CODE.test(code) ? code : null;
}
