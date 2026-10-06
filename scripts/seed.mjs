#!/usr/bin/env node
/**
 * Loads data/seed.json (events + ticket types) into Firestore.
 * Usage: npm run seed            (reads .env.local)
 *        npm run seed -- --force  (overwrite ticket counters too — never on a live event)
 *
 * Existing ticket types keep their quantitySold / quantityReserved unless --force,
 * so re-running the seed after sales have started never resets the stock.
 */
import { readFileSync, existsSync } from "node:fs";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
  console.error("Missing FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY (see .env.example).");
  process.exit(1);
}

const force = process.argv.includes("--force");
const seed = JSON.parse(readFileSync(new URL("../data/seed.json", import.meta.url), "utf8"));

initializeApp({
  credential: cert({
    projectId: FIREBASE_PROJECT_ID,
    clientEmail: FIREBASE_CLIENT_EMAIL,
    privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});
const db = getFirestore();
const now = new Date().toISOString();

for (const [id, event] of Object.entries(seed.events)) {
  const ref = db.collection("events").doc(id);
  const existing = await ref.get();
  await ref.set({ ...event, createdAt: existing.data()?.createdAt ?? now, updatedAt: now });
  console.log(`event ${id} ${existing.exists ? "updated" : "created"}`);
}

for (const [id, type] of Object.entries(seed.ticketTypes)) {
  const ref = db.collection("ticketTypes").doc(id);
  const existing = await ref.get();
  const data = { ...type };
  if (existing.exists && !force) {
    data.quantitySold = existing.data().quantitySold ?? 0;
    data.quantityReserved = existing.data().quantityReserved ?? 0;
  }
  await ref.set(data);
  console.log(`ticketType ${id} ${existing.exists ? "updated" : "created"} (sold ${data.quantitySold}, reserved ${data.quantityReserved})`);
}
console.log("Done.");
