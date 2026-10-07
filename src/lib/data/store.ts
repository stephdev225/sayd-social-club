/**
 * Minimal persistence port used by the business logic (checkout, webhook, check-in).
 * Two adapters implement it: Firestore (production) and in-memory (tests, local preview).
 *
 * Contract mirrors Firestore transactions: inside `runTransaction`, ALL reads must
 * happen before the first write. The in-memory adapter enforces this so tests catch
 * code that would fail in production.
 */

export type CollectionName =
  | "events"
  | "ticketTypes"
  | "customers"
  | "orders"
  | "payments"
  | "tickets"
  | "stripeEvents"
  | "checkins"
  | "submissions"
  | "media";

export type Doc = Record<string, unknown>;

export interface Tx {
  get<T extends Doc>(collection: CollectionName, id: string): Promise<T | null>;
  getMany<T extends Doc>(collection: CollectionName, ids: string[]): Promise<(T | null)[]>;
  set<T extends Doc>(collection: CollectionName, id: string, data: T): void;
  update(collection: CollectionName, id: string, patch: Doc): void;
}

export interface WhereClause {
  field: string;
  op: "==" | ">=" | "<=" | ">" | "<";
  value: string | number | boolean;
}

export interface QueryOptions {
  where?: WhereClause[];
  orderBy?: { field: string; direction?: "asc" | "desc" };
  limit?: number;
}

export interface Store {
  get<T extends Doc>(collection: CollectionName, id: string): Promise<T | null>;
  query<T extends Doc>(collection: CollectionName, options?: QueryOptions): Promise<T[]>;
  set<T extends Doc>(collection: CollectionName, id: string, data: T): Promise<void>;
  update(collection: CollectionName, id: string, patch: Doc): Promise<void>;
  /** Adds a document with a generated id; returns the id. */
  add<T extends Doc>(collection: CollectionName, data: T): Promise<string>;
  runTransaction<R>(fn: (tx: Tx) => Promise<R>): Promise<R>;
}
