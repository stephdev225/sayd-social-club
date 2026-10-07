"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { getStore, usingMemoryStore } from "@/lib/data";
import { AdminError, saveEvent, saveTicketType } from "@/lib/data/events-admin";
import { formatMoney, preTaxForAllIn } from "@/lib/domain/money";
import { eventInputSchema, ticketTypeInputSchema } from "@/lib/validation";

export interface FormState {
  ok?: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
}

const FIELD_LABELS: Record<string, string> = {
  name: "Nom",
  slug: "Adresse de la page",
  taglineFr: "Accroche (FR)",
  taglineEn: "Accroche (EN)",
  descriptionFr: "Description (FR)",
  descriptionEn: "Description (EN)",
  date: "Date",
  startTime: "Heure de début",
  endTime: "Heure de fin",
  venueName: "Lieu",
  address: "Adresse",
  city: "Ville",
  capacity: "Capacité",
  externalTicketUrl: "Lien de billetterie externe",
  heroImage: "Visuel",
  coverImage: "Affiche",
  nameFr: "Nom (FR)",
  nameEn: "Nom (EN)",
  allInPrice: "Prix",
  quantityTotal: "Stock",
  maxPerOrder: "Maximum par commande",
};

function fieldErrors(issues: { path: PropertyKey[]; message: string }[]): FormState {
  const errors: Record<string, string> = {};
  for (const i of issues) {
    const key = String(i.path[0] ?? "");
    errors[key] ??= `${FIELD_LABELS[key] ?? key} : valeur invalide`;
  }
  return { fieldErrors: errors, message: "Vérifiez les champs signalés." };
}

/** Refreshes every public page so the change shows immediately. */
function refreshSite() {
  revalidatePath("/[lang]", "layout");
  revalidatePath("/sitemap.xml");
}

async function guard(): Promise<FormState | null> {
  if (!(await requireRole("admin"))) return { message: "Session expirée : reconnectez-vous." };
  if (usingMemoryStore() && process.env.NODE_ENV === "production") {
    return { message: "Base de données non branchée : les changements ne peuvent pas être enregistrés." };
  }
  return null;
}

export async function saveEventAction(existingId: string | null, _prev: FormState, form: FormData): Promise<FormState> {
  const denied = await guard();
  if (denied) return denied;
  const parsed = eventInputSchema.safeParse(Object.fromEntries(form.entries()));
  if (!parsed.success) return fieldErrors(parsed.error.issues);
  let id: string;
  try {
    id = await saveEvent(getStore(), parsed.data, existingId ?? undefined);
  } catch (err) {
    if (err instanceof AdminError) return { message: err.message, fieldErrors: err.code === "slug_taken" ? { slug: err.message } : undefined };
    console.error("[admin] saveEvent", err);
    return { message: "Enregistrement impossible. Réessayez." };
  }
  refreshSite();
  // Reload the page with the saved values (and the right address if the slug changed).
  redirect(`/admin/evenements/${encodeURIComponent(id)}?${existingId ? "enregistre" : "cree"}=${Date.now().toString(36)}`);
}

export async function saveTicketTypeAction(eventId: string, typeId: string | null, _prev: FormState, form: FormData): Promise<FormState> {
  const denied = await guard();
  if (denied) return denied;
  const raw = Object.fromEntries(form.entries());
  const parsed = ticketTypeInputSchema.safeParse({
    ...raw,
    online: form.get("online") === "on",
    door: form.get("door") === "on",
    active: form.get("active") === "on",
  });
  if (!parsed.success) return fieldErrors(parsed.error.issues);
  try {
    await saveTicketType(getStore(), eventId, parsed.data, typeId ?? undefined);
  } catch (err) {
    if (err instanceof AdminError) return { message: err.message };
    console.error("[admin] saveTicketType", err);
    return { message: "Enregistrement impossible. Réessayez." };
  }
  refreshSite();
  revalidatePath(`/admin/evenements/${eventId}`);
  const price = preTaxForAllIn(parsed.data.allInPrice);
  return {
    ok: true,
    message: price.exact
      ? "Billet enregistré."
      : `Billet enregistré. Avec l'arrondi des taxes, le prix exact affiché sera ${formatMoney(price.allInCents, "fr")}.`,
  };
}
