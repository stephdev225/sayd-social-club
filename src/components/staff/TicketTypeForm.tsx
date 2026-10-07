"use client";

import { useActionState } from "react";
import type { FormState } from "@/app/admin/evenements/actions";
import { Check, Field, TextArea } from "./fields";

export interface TicketTypeValues {
  nameFr: string;
  nameEn: string;
  descriptionFr: string;
  descriptionEn: string;
  allInPrice: string; // "26,49"
  quantityTotal: number;
  maxPerOrder: number;
  sortOrder: number;
  online: boolean;
  door: boolean;
  active: boolean;
}

/** Create or edit one ticket type. Prices are typed taxes included, as buyers see them. */
export function TicketTypeForm({
  action,
  values,
  committed = 0,
  isNew,
  onDone,
}: {
  action: (prev: FormState, form: FormData) => Promise<FormState>;
  values: TicketTypeValues;
  committed?: number;
  isNew: boolean;
  onDone?: (message: string) => void;
}) {
  const [state, formAction, pending] = useActionState(async (prev: FormState, form: FormData) => {
    const res = await action(prev, form);
    if (res.ok && onDone) onDone(res.message ?? "Billet enregistré.");
    return res;
  }, {});
  const err = (k: string) => state.fieldErrors?.[k];

  return (
    <form action={formAction} className="grid gap-5 rounded-lg border border-line bg-night p-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="nameFr" label="Nom (FR)" required defaultValue={values.nameFr} error={err("nameFr")} placeholder="Billet en ligne" />
        <Field name="nameEn" label="Nom (EN)" required defaultValue={values.nameEn} error={err("nameEn")} placeholder="Online ticket" />
        <TextArea name="descriptionFr" label="Description (FR)" rows={2} defaultValue={values.descriptionFr} />
        <TextArea name="descriptionEn" label="Description (EN)" rows={2} defaultValue={values.descriptionEn} />
      </div>
      <div className="grid gap-5 sm:grid-cols-4">
        <Field
          name="allInPrice"
          label="Prix taxes incluses ($)"
          required
          inputMode="decimal"
          defaultValue={values.allInPrice}
          error={err("allInPrice")}
          placeholder="26,49"
          hint="TPS et TVQ comprises."
        />
        <Field
          name="quantityTotal"
          type="number"
          min={committed}
          label="Stock total"
          required
          defaultValue={values.quantityTotal}
          error={err("quantityTotal")}
          hint={committed ? `Minimum ${committed} (déjà vendus ou en cours).` : undefined}
        />
        <Field name="maxPerOrder" type="number" min={1} max={20} label="Max. par commande" required defaultValue={values.maxPerOrder} error={err("maxPerOrder")} />
        <Field name="sortOrder" type="number" min={0} max={99} label="Ordre d'affichage" defaultValue={values.sortOrder} />
      </div>
      <div className="flex flex-wrap gap-x-8 gap-y-3">
        <Check name="online" label="Vendu en ligne" defaultChecked={values.online} />
        <Check name="door" label="Vendu à la porte" defaultChecked={values.door} />
        <Check name="active" label="Actif" defaultChecked={values.active} hint="Décochez pour arrêter la vente sans rien supprimer." />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p role="status" aria-live="polite" className={`text-sm ${state.ok ? "text-sable" : "text-terra"}`}>{state.message}</p>
        <button disabled={pending} className="min-h-10 rounded-full bg-sable px-6 text-sm font-semibold text-night disabled:opacity-60">
          {pending ? "Enregistrement…" : isNew ? "Ajouter ce billet" : "Enregistrer le billet"}
        </button>
      </div>
    </form>
  );
}
