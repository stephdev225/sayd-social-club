/** Event status as shown in the admin: label and badge classes. */
export const STATUS_LABEL: Record<string, [string, string]> = {
  draft: ["Brouillon", "bg-ink/10 text-ink/80"],
  published: ["Publié", "bg-sable/15 text-sable"],
  sold_out: ["Complet", "bg-terra/15 text-terra"],
  cancelled: ["Annulé", "bg-terra/15 text-terra"],
  archived: ["Archivé", "bg-ink/5 text-muted"],
};
