"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { FormState } from "@/app/admin/evenements/actions";
import { TicketTypeForm, type TicketTypeValues } from "./TicketTypeForm";

export interface TicketTypeRow {
  id: string;
  values: TicketTypeValues;
  allInLabel: string;
  sold: number;
  reserved: number;
  available: number;
  action: (prev: FormState, form: FormData) => Promise<FormState>;
}

const NEW: TicketTypeValues = {
  nameFr: "",
  nameEn: "",
  descriptionFr: "",
  descriptionEn: "",
  allInPrice: "",
  quantityTotal: 100,
  maxPerOrder: 10,
  sortOrder: 0,
  online: true,
  door: false,
  active: true,
};

export function TicketTypesPanel({ rows, createAction }: { rows: TicketTypeRow[]; createAction: (prev: FormState, form: FormData) => Promise<FormState> }) {
  const [open, setOpen] = useState<string | null>(rows.length === 0 ? "new" : null);
  const [flash, setFlash] = useState("");

  return (
    <div className="space-y-3">
      {rows.length === 0 && <p className="text-sm text-muted">Aucun billet pour l&apos;instant. Ajoutez au moins un type pour ouvrir la vente.</p>}
      {rows.map((r) => (
        <div key={r.id} className="rounded-lg border border-line bg-night-2">
          <button
            type="button"
            onClick={() => setOpen(open === r.id ? null : r.id)}
            aria-expanded={open === r.id}
            className="grid w-full grid-cols-[1fr_auto] items-center gap-4 p-4 text-left sm:grid-cols-[1fr_7rem_10rem_6rem_auto]"
          >
            <span>
              <span className="block font-medium">{r.values.nameFr}</span>
              <span className="text-xs text-muted">
                {[r.values.online && "En ligne", r.values.door && "Porte"].filter(Boolean).join(" · ")}
              </span>
            </span>
            <span className="hidden tabular-nums sm:block">{r.allInLabel}</span>
            <span className="hidden text-sm tabular-nums text-muted sm:block">
              {r.sold} vendus · {r.available} dispo.
              {r.reserved > 0 && <span className="block text-xs">{r.reserved} en paiement</span>}
            </span>
            <span className={`hidden text-xs sm:block ${r.values.active ? "text-sable" : "text-muted"}`}>{r.values.active ? "Actif" : "Inactif"}</span>
            <span aria-hidden className={`text-muted transition-transform ${open === r.id ? "rotate-180" : ""}`}>⌄</span>
          </button>
          <AnimatePresence initial={false}>
            {open === r.id && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="px-4 pb-4">
                  <TicketTypeForm
                    key={JSON.stringify(r.values)}
                    action={r.action}
                    values={r.values}
                    committed={r.sold + r.reserved}
                    isNew={false}
                    onDone={(m) => {
                      setFlash(m);
                      setOpen(null);
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}

      {flash && open !== "new" && (
        <p role="status" className="text-sm text-sable">{flash}</p>
      )}
      {open === "new" ? (
        <TicketTypeForm action={createAction} values={NEW} isNew onDone={(m) => {
            setFlash(m);
            setOpen(null);
          }} />
      ) : (
        <button type="button" onClick={() => {
            setFlash("");
            setOpen("new");
          }} className="min-h-11 rounded-full border border-line px-5 text-sm hover:border-sable">
          + Ajouter un type de billet
        </button>
      )}
    </div>
  );
}
