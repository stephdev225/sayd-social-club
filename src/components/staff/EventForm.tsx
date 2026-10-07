"use client";

import { useActionState } from "react";
import type { FormState } from "@/app/admin/evenements/actions";
import { Field, ImageField, Select, TextArea } from "./fields";

export interface EventFormValues {
  name: string;
  slug: string;
  editionFr: string;
  editionEn: string;
  taglineFr: string;
  taglineEn: string;
  descriptionFr: string;
  descriptionEn: string;
  dressCodeFr: string;
  dressCodeEn: string;
  date: string;
  startTime: string;
  endTime: string;
  venueName: string;
  address: string;
  city: string;
  capacity: number;
  status: string;
  lineup: string;
  partners: string;
  heroImage: string;
  coverImage: string;
  externalTicketUrl: string;
}

const STATUS: [string, string][] = [
  ["draft", "Brouillon (invisible sur le site)"],
  ["published", "Publié"],
  ["sold_out", "Complet"],
  ["cancelled", "Annulé (reste affiché comme annulé)"],
  ["archived", "Archivé (retiré du site)"],
];

function Section({ title, intro, children }: { title: string; intro?: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-6 border-t border-line pt-8 lg:grid-cols-[14rem_1fr]">
      <div>
        <h2 className="font-display text-2xl">{title}</h2>
        {intro && <p className="mt-1 text-sm text-muted">{intro}</p>}
      </div>
      <div className="grid gap-5">{children}</div>
    </section>
  );
}

export function EventForm({
  action,
  values,
  isNew,
}: {
  action: (prev: FormState, form: FormData) => Promise<FormState>;
  values: EventFormValues;
  isNew: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const err = (k: string) => state.fieldErrors?.[k];

  return (
    <form action={formAction} className="space-y-8 pb-28">
      <Section title="L'essentiel" intro="Ce que le public voit en premier.">
        <Field name="name" label="Nom de la soirée" required defaultValue={values.name} error={err("name")} placeholder="Sprezzatura" />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field name="editionFr" label="Sous-titre (FR)" defaultValue={values.editionFr} placeholder="Édition" />
          <Field name="editionEn" label="Sous-titre (EN)" defaultValue={values.editionEn} placeholder="Edition" />
          <Field name="taglineFr" label="Accroche (FR)" required defaultValue={values.taglineFr} error={err("taglineFr")} placeholder="Une expérience festive unique." />
          <Field name="taglineEn" label="Accroche (EN)" required defaultValue={values.taglineEn} error={err("taglineEn")} placeholder="A one-of-a-kind night out." />
        </div>
        <Field
          name="slug"
          label="Adresse de la page"
          defaultValue={values.slug}
          error={err("slug")}
          placeholder="créée à partir du nom"
          hint={isNew ? "Laissez vide : elle sera créée à partir du nom (ex. /evenements/sprezzatura)." : "Changer l'adresse casse les liens déjà partagés."}
        />
      </Section>

      <Section title="Date et lieu" intro="Heures de Québec. Une heure de fin plus tôt que le début = après minuit.">
        <div className="grid gap-5 sm:grid-cols-3">
          <Field name="date" type="date" label="Date" required defaultValue={values.date} error={err("date")} />
          <Field name="startTime" type="time" label="Début" required defaultValue={values.startTime} error={err("startTime")} />
          <Field name="endTime" type="time" label="Fin" required defaultValue={values.endTime} error={err("endTime")} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field name="venueName" label="Lieu" required defaultValue={values.venueName} error={err("venueName")} placeholder="Mora" />
          <Field name="address" label="Adresse" required defaultValue={values.address} error={err("address")} placeholder="Grande Allée Est" />
          <Field name="city" label="Ville" required defaultValue={values.city} error={err("city")} />
          <Field name="capacity" type="number" min={1} label="Capacité de la salle" required defaultValue={values.capacity} error={err("capacity")} />
        </div>
      </Section>

      <Section title="Programme" intro="Un nom par ligne. Ajoutez « | lien Instagram » pour le rendre cliquable.">
        <TextArea name="lineup" label="Artistes et DJs" defaultValue={values.lineup} rows={3} placeholder={"Waklexx | https://www.instagram.com/waklexx_"} />
        <Field name="partners" label="Présenté par" defaultValue={values.partners} hint="Séparés par des virgules." placeholder="Sayd Social Club, Ben G Signature" />
      </Section>

      <Section title="Textes" intro="Français et anglais : le site est bilingue.">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextArea name="descriptionFr" label="Description (FR)" required rows={6} defaultValue={values.descriptionFr} error={err("descriptionFr")} />
          <TextArea name="descriptionEn" label="Description (EN)" required rows={6} defaultValue={values.descriptionEn} error={err("descriptionEn")} />
          <TextArea name="dressCodeFr" label="Code vestimentaire (FR)" rows={2} defaultValue={values.dressCodeFr} />
          <TextArea name="dressCodeEn" label="Code vestimentaire (EN)" rows={2} defaultValue={values.dressCodeEn} />
        </div>
      </Section>

      <Section title="Images" intro="JPG, PNG ou WebP. Les photos de téléphone sont réduites automatiquement.">
        <ImageField name="heroImage" label="Visuel principal (sans texte)" defaultValue={values.heroImage} hint="Grande image de la page. Format paysage idéal. Évitez l'affiche avec texte ici." />
        <ImageField name="coverImage" label="Affiche officielle" defaultValue={values.coverImage} hint="Le flyer complet, ouvert par « Voir l'affiche ». Format story (9:16) accepté." />
      </Section>

      <Section title="Vente" intro="Tant que la vente en ligne du site n'est pas ouverte, le bouton d'achat peut renvoyer vers une autre billetterie.">
        <Select name="status" label="Statut" options={STATUS} defaultValue={values.status} hint="« Publié » rend l'événement visible et en vente." />
        <Field
          name="externalTicketUrl"
          type="url"
          label="Lien de billetterie externe (facultatif)"
          defaultValue={values.externalTicketUrl}
          error={err("externalTicketUrl")}
          placeholder="https://lepointdevente.com/..."
          hint="Utilisé seulement si la vente en ligne du site est fermée."
        />
      </Section>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-night/95 px-5 py-3 backdrop-blur lg:left-60">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <p role="status" aria-live="polite" className={`text-sm ${state.ok ? "text-sable" : state.message ? "text-terra" : "text-muted"}`}>
            {state.message ?? (isNew ? "Brouillon : rien n'est publié tant que le statut n'est pas « Publié »." : "Les changements sont visibles sur le site dès l'enregistrement.")}
          </p>
          <button disabled={pending} className="min-h-11 rounded-full bg-sable px-7 font-semibold text-night transition hover:brightness-110 disabled:opacity-60">
            {pending ? "Enregistrement…" : isNew ? "Créer l'événement" : "Enregistrer"}
          </button>
        </div>
      </div>
    </form>
  );
}
