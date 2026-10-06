import { randomUUID } from "node:crypto";
import type { CollectionName, Doc, QueryOptions, Store, Tx } from "./store";

function clone<T>(v: T): T {
  return structuredClone(v);
}

function compare(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a === undefined || a === null) return -1;
  if (b === undefined || b === null) return 1;
  return (a as string | number) < (b as string | number) ? -1 : 1;
}

/**
 * In-memory Store. Transactions are serialised (one at a time), which models the
 * guarantee Firestore gives through optimistic retries: a transaction always sees
 * the latest committed state, and its writes are applied atomically.
 */
export class MemoryStore implements Store {
  private data = new Map<CollectionName, Map<string, Doc>>();
  private queue: Promise<unknown> = Promise.resolve();

  constructor(seed?: Partial<Record<CollectionName, Record<string, Doc>>>) {
    if (seed) {
      for (const [col, docs] of Object.entries(seed) as [CollectionName, Record<string, Doc>][]) {
        for (const [id, doc] of Object.entries(docs)) this.col(col).set(id, clone(doc));
      }
    }
  }

  private col(name: CollectionName): Map<string, Doc> {
    let c = this.data.get(name);
    if (!c) {
      c = new Map();
      this.data.set(name, c);
    }
    return c;
  }

  /** Test helper: every document of a collection. */
  all<T extends Doc>(name: CollectionName): T[] {
    return [...this.col(name).values()].map((d) => clone(d) as T);
  }

  async get<T extends Doc>(collection: CollectionName, id: string): Promise<T | null> {
    const d = this.col(collection).get(id);
    return d ? (clone(d) as T) : null;
  }

  async query<T extends Doc>(collection: CollectionName, options: QueryOptions = {}): Promise<T[]> {
    let rows = [...this.col(collection).values()];
    for (const w of options.where ?? []) {
      rows = rows.filter((r) => {
        const c = compare(r[w.field], w.value);
        switch (w.op) {
          case "==": return r[w.field] === w.value;
          case ">=": return c >= 0;
          case "<=": return c <= 0;
          case ">": return c > 0;
          case "<": return c < 0;
        }
      });
    }
    if (options.orderBy) {
      const { field, direction = "asc" } = options.orderBy;
      rows.sort((a, b) => compare(a[field], b[field]) * (direction === "asc" ? 1 : -1));
    }
    if (options.limit !== undefined) rows = rows.slice(0, options.limit);
    return rows.map((r) => clone(r) as T);
  }

  async set<T extends Doc>(collection: CollectionName, id: string, data: T): Promise<void> {
    this.col(collection).set(id, clone(data));
  }

  async update(collection: CollectionName, id: string, patch: Doc): Promise<void> {
    const existing = this.col(collection).get(id);
    if (!existing) throw new Error(`update: ${collection}/${id} does not exist`);
    this.col(collection).set(id, { ...existing, ...clone(patch) });
  }

  async add<T extends Doc>(collection: CollectionName, data: T): Promise<string> {
    const id = randomUUID();
    await this.set(collection, id, data);
    return id;
  }

  runTransaction<R>(fn: (tx: Tx) => Promise<R>): Promise<R> {
    const run = async () => {
      const writes: (() => void)[] = [];
      let wrote = false;
      const readGuard = () => {
        if (wrote) throw new Error("Transaction read after write (Firestore would reject this).");
      };
      const tx: Tx = {
        get: async <T extends Doc>(c: CollectionName, id: string) => {
          readGuard();
          return this.get<T>(c, id);
        },
        getMany: async <T extends Doc>(c: CollectionName, ids: string[]) => {
          readGuard();
          return Promise.all(ids.map((id) => this.get<T>(c, id)));
        },
        set: (c, id, data) => {
          wrote = true;
          writes.push(() => this.col(c).set(id, clone(data)));
        },
        update: (c, id, patch) => {
          wrote = true;
          writes.push(() => {
            const existing = this.col(c).get(id);
            if (!existing) throw new Error(`update: ${c}/${id} does not exist`);
            this.col(c).set(id, { ...existing, ...clone(patch) });
          });
        },
      };
      const result = await fn(tx);
      for (const w of writes) w(); // atomic commit
      return result;
    };
    const next = this.queue.then(run, run);
    this.queue = next.catch(() => undefined);
    return next;
  }
}
