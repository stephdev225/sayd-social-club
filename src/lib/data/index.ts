import "server-only";
import seed from "../../../data/seed.json";
import { isFirebaseConfigured } from "@/lib/env";
import { db } from "@/lib/firebase/admin";
import { FirestoreStore } from "./firestore-store";
import { MemoryStore } from "./memory-store";
import type { Doc, Store } from "./store";

const g = globalThis as unknown as { __saydMemoryStore?: MemoryStore; __saydSeeded?: Promise<void>; __saydSeedKey?: string };

const seedEvents = seed.events as unknown as Record<string, Doc>;
const seedTypes = seed.ticketTypes as unknown as Record<string, Doc>;

/**
 * The memory store survives hot reloads (so local test orders are kept), but is rebuilt
 * as soon as data/seed.json changes: an edited event shows up without restarting the server.
 */
const seedKey = JSON.stringify(seed);
function memoryStore(): MemoryStore {
  if (!g.__saydMemoryStore || g.__saydSeedKey !== seedKey) {
    g.__saydMemoryStore = new MemoryStore({ events: seedEvents, ticketTypes: seedTypes });
    g.__saydSeedKey = seedKey;
  }
  return g.__saydMemoryStore;
}

/** Media fields that seed.json may add later to an event already in the database. */
const BACKFILL_FIELDS = ["video", "videoLoop"] as const;

/**
 * Fields of `seedDoc` among BACKFILL_FIELDS that `current` does not have yet.
 * Never overwrites a value already there (an admin edit always wins).
 */
export function missingMedia(current: Doc, seedDoc: Doc): Doc {
  const patch: Doc = {};
  for (const k of BACKFILL_FIELDS) {
    if (seedDoc[k] && (current[k] === undefined || current[k] === null || current[k] === "")) patch[k] = seedDoc[k];
  }
  return patch;
}

/**
 * First start against an empty Firestore: create the events and ticket types from
 * data/seed.json. Only missing documents are created, inside a transaction, so stock
 * counters of an event already on sale are never reset. For events already there, only
 * a recap video added to seed.json since is filled in (see missingMedia).
 */
async function ensureSeeded(store: Store): Promise<void> {
  const eventIds = Object.keys(seedEvents);
  const typeIds = Object.keys(seedTypes);
  await store.runTransaction(async (tx) => {
    const events = await tx.getMany("events", eventIds);
    const types = await tx.getMany("ticketTypes", typeIds);
    const now = new Date().toISOString();
    events.forEach((e, i) => {
      if (!e) {
        tx.set("events", eventIds[i], { ...seedEvents[eventIds[i]], createdAt: now, updatedAt: now });
        return;
      }
      const patch = missingMedia(e, seedEvents[eventIds[i]]);
      if (Object.keys(patch).length) tx.update("events", eventIds[i], { ...patch, updatedAt: now });
    });
    types.forEach((t, i) => {
      if (!t) tx.set("ticketTypes", typeIds[i], seedTypes[typeIds[i]]);
    });
  });
}

/** Wraps a store so the first call of this server instance waits for the seed. */
function seeded(store: Store): Store {
  const ready = () => (g.__saydSeeded ??= ensureSeeded(store).catch((err) => {
    g.__saydSeeded = undefined; // retry on next request
    console.error("[seed] failed", err);
  }));
  return {
    get: async (...a) => (await ready(), store.get(...a)),
    query: async (...a) => (await ready(), store.query(...a)),
    set: async (...a) => (await ready(), store.set(...a)),
    update: async (...a) => (await ready(), store.update(...a)),
    add: async (...a) => (await ready(), store.add(...a)),
    runTransaction: async (fn) => (await ready(), store.runTransaction(fn)),
  } as Store;
}

/**
 * Firestore when configured. Otherwise an in-memory store seeded from data/seed.json,
 * so the public site renders in local preview. Orders written to the memory store
 * are lost on restart: checkout refuses to use it outside development (see canSellOnline()).
 */
export function getStore(): Store {
  return isFirebaseConfigured() ? seeded(new FirestoreStore(db())) : memoryStore();
}

export function usingMemoryStore(): boolean {
  return !isFirebaseConfigured();
}
