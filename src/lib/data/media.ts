import "server-only";
import { randomBytes } from "node:crypto";
import sharp, { type OutputInfo } from "sharp";
import type { Store } from "./store";

/**
 * Event images uploaded from the admin. Stored in the database itself (no extra
 * storage service): resized to at most 2000 px and re-encoded as WebP, which also
 * strips metadata such as GPS position. Firestore documents are limited to 1 MiB,
 * so the encoder lowers quality until the file fits.
 */
const MAX_BYTES = 700_000;
export const MAX_UPLOAD_BYTES = 4_000_000;
const ACCEPTED = new Set(["image/jpeg", "image/png", "image/webp"]);

export interface StoredMedia {
  id: string;
  mime: "image/webp";
  data: string; // base64
  width: number;
  height: number;
  bytes: number;
  createdAt: string;
  [key: string]: unknown;
}

export class MediaError extends Error {}

export async function saveImage(store: Store, file: File): Promise<{ url: string; width: number; height: number }> {
  if (!ACCEPTED.has(file.type)) throw new MediaError("Format accepté : JPG, PNG ou WebP.");
  if (file.size > MAX_UPLOAD_BYTES) throw new MediaError("Image trop lourde (4 Mo maximum).");
  const input = Buffer.from(await file.arrayBuffer());
  let out: { data: Buffer; info: OutputInfo } | null = null;
  for (const [size, quality] of [[2000, 82], [1800, 74], [1600, 68], [1400, 60]] as const) {
    out = await sharp(input, { failOn: "error" })
      .rotate()
      .resize({ width: size, height: size, fit: "inside", withoutEnlargement: true })
      .webp({ quality })
      .toBuffer({ resolveWithObject: true });
    if (out.data.length <= MAX_BYTES) break;
  }
  if (!out || out.data.length > MAX_BYTES) throw new MediaError("Image impossible à compresser suffisamment.");
  const id = randomBytes(9).toString("base64url").replace(/[-_]/g, "x");
  const doc: StoredMedia = {
    id,
    mime: "image/webp",
    data: out.data.toString("base64"),
    width: out.info.width,
    height: out.info.height,
    bytes: out.data.length,
    createdAt: new Date().toISOString(),
  };
  await store.set("media", id, doc);
  return { url: `/media/${id}.webp`, width: doc.width, height: doc.height };
}

export async function readImage(store: Store, id: string): Promise<Buffer | null> {
  if (!/^[A-Za-z0-9]{6,20}$/.test(id)) return null;
  const doc = await store.get<StoredMedia>("media", id);
  return doc ? Buffer.from(doc.data, "base64") : null;
}
