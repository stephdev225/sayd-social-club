import "server-only";
import type { Firestore, Query } from "firebase-admin/firestore";
import type { CollectionName, Doc, QueryOptions, Store, Tx } from "./store";

/** Removes undefined values: Firestore rejects them. */
function clean<T extends Doc>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T;
}

export class FirestoreStore implements Store {
  constructor(private readonly fs: Firestore) {}

  async get<T extends Doc>(collection: CollectionName, id: string): Promise<T | null> {
    const snap = await this.fs.collection(collection).doc(id).get();
    return snap.exists ? (snap.data() as T) : null;
  }

  async query<T extends Doc>(collection: CollectionName, options: QueryOptions = {}): Promise<T[]> {
    let q: Query = this.fs.collection(collection);
    for (const w of options.where ?? []) q = q.where(w.field, w.op, w.value);
    if (options.orderBy) q = q.orderBy(options.orderBy.field, options.orderBy.direction ?? "asc");
    if (options.limit !== undefined) q = q.limit(options.limit);
    const snap = await q.get();
    return snap.docs.map((d) => d.data() as T);
  }

  async set<T extends Doc>(collection: CollectionName, id: string, data: T): Promise<void> {
    await this.fs.collection(collection).doc(id).set(clean(data));
  }

  async update(collection: CollectionName, id: string, patch: Doc): Promise<void> {
    await this.fs.collection(collection).doc(id).update(clean(patch));
  }

  async add<T extends Doc>(collection: CollectionName, data: T): Promise<string> {
    const ref = await this.fs.collection(collection).add(clean(data));
    return ref.id;
  }

  runTransaction<R>(fn: (tx: Tx) => Promise<R>): Promise<R> {
    return this.fs.runTransaction(async (t) => {
      const tx: Tx = {
        get: async <T extends Doc>(c: CollectionName, id: string) => {
          const snap = await t.get(this.fs.collection(c).doc(id));
          return snap.exists ? (snap.data() as T) : null;
        },
        getMany: async <T extends Doc>(c: CollectionName, ids: string[]) => {
          if (ids.length === 0) return [];
          const snaps = await t.getAll(...ids.map((id) => this.fs.collection(c).doc(id)));
          return snaps.map((s) => (s.exists ? (s.data() as T) : null));
        },
        set: (c, id, data) => {
          t.set(this.fs.collection(c).doc(id), clean(data));
        },
        update: (c, id, patch) => {
          t.update(this.fs.collection(c).doc(id), clean(patch));
        },
      };
      return fn(tx);
    });
  }
}
