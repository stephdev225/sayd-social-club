import "server-only";
import type { Store } from "./store";

export interface Submission {
  id: string;
  kind: "newsletter" | "contact" | "ambassador" | "partnership";
  locale: "fr" | "en";
  email: string;
  name?: string;
  firstName?: string;
  phone?: string;
  company?: string;
  type?: string;
  subject?: string;
  instagram?: string;
  message?: string;
  source?: string;
  createdAt: string;
}

export async function listSubmissions(store: Store, limit = 1000): Promise<Submission[]> {
  const rows = await store.query<Record<string, unknown>>("submissions", { orderBy: { field: "createdAt", direction: "desc" }, limit });
  return rows as unknown as Submission[];
}
