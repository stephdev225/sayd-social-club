import { authConfigured } from "@/lib/auth/session";
import { isFirebaseConfigured } from "@/lib/env";
import { siteUrl } from "@/lib/seo";

interface Item {
  ok: boolean;
  label: string;
  detail: string;
  optional?: boolean;
}

/**
 * What is configured in Vercel, without ever showing a value. Lets the owner see at a
 * glance what still blocks online sales.
 */
export function SetupChecklist() {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  const live = key.startsWith("sk_live_") || key.startsWith("rk_live_");
  const webhookUrl = `${siteUrl()}/api/stripe/webhook`;
  const items: Item[] = [
    { ok: isFirebaseConfigured(), label: "Base de données (Firebase)", detail: "FIREBASE_SERVICE_ACCOUNT : commandes, billets, contacts et événements sont enregistrés." },
    { ok: authConfigured(), label: "Accès admin et porte", detail: "ADMIN_PASSWORD (10 caractères min.) et STAFF_PASSWORD pour le scanner." },
    {
      ok: Boolean(key),
      label: `Clé Stripe ${key ? (live ? "(LIVE)" : "(mode test)") : ""}`,
      detail: "Facultatif tant que les billets sont vendus sur Le Point de Vente. STRIPE_SECRET_KEY : commencer par sk_test_.",
      optional: true,
    },
    {
      ok: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
      label: "Webhook Stripe",
      detail: `Facultatif. STRIPE_WEBHOOK_SECRET (whsec_…) : endpoint ${webhookUrl}`,
      optional: true,
    },
    { ok: Boolean(process.env.BREVO_API_KEY), label: "Courriels de confirmation (Brevo)", detail: "BREVO_API_KEY + EMAIL_FROM sur un domaine vérifié. Sans clé, les messages du site restent visibles dans Contacts." , optional: true },
    { ok: Boolean(process.env.SITE_URL), label: "Adresse du site", detail: "SITE_URL (ex. https://saydsocialclub.com) : liens des courriels et retour de paiement.", optional: true },
  ];
  const ready = isFirebaseConfigured() && authConfigured();
  const missing = items.filter((i) => !i.ok && !i.optional).length;
  if (missing === 0 && !live) return null;

  return (
    <section aria-labelledby="t-config" className="rounded-lg border border-line bg-night-2 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="t-config" className="font-display text-2xl">Mise en route</h2>
        <p className={`text-sm ${ready ? "text-sable" : "text-terra"}`}>
          {ready ? (live ? "Stripe en mode LIVE" : "Site prêt : formulaires et admin actifs") : `${missing} réglage(s) manquant(s) dans Vercel`}
        </p>
      </div>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map((i) => (
          <li key={i.label} className="flex gap-3 text-sm">
            <span aria-hidden className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-xs ${i.ok ? "bg-sable text-night" : i.optional ? "bg-ink/10 text-muted" : "bg-terra/20 text-terra"}`}>
              {i.ok ? "✓" : i.optional ? "–" : "!"}
            </span>
            <span>
              <span className="block text-ink">
                {i.label}
                <span className="sr-only">{i.ok ? " : configuré" : " : manquant"}</span>
              </span>
              <span className="block break-words text-xs text-muted">{i.detail}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
