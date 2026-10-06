import "server-only";
import seed from "../../../data/seed.json";
import { isFirebaseConfigured } from "@/lib/env";
import { db } from "@/lib/firebase/admin";
import { FirestoreStore } from "./firestore-store";
import { MemoryStore } from "./memory-store";
import type { Doc, Store } from "./store";

const globalForStore = globalThis as unknown as { __saydMemoryStore?: MemoryStore };

function memoryStore(): MemoryStore {
  globalForStore.__saydMemoryStore ??= new MemoryStore({
    events: seed.events as unknown as Record<string, Doc>,
    ticketTypes: seed.ticketTypes as unknown as Record<string, Doc>,
  });
  return globalForStore.__saydMemoryStore;
}

/**
 * Firestore when configured. Otherwise an in-memory store seeded from data/seed.json,
 * so the public site renders in local preview. Orders written to the memory store
 * are lost on restart: checkout refuses to use it outside development (see canSell()).
 */
export function getStore(): Store {
  return isFirebaseConfigured() ? new FirestoreStore(db()) : memoryStore();
}

export function usingMemoryStore(): boolean {
  return !isFirebaseConfigured();
}
