# Mise en ligne — ce que Stéphane fait lui-même

Les clés secrètes ne passent jamais par Claude : tu les colles toi-même dans
**Vercel → projet sayd-social-club → Settings → Environment Variables**
(cocher *Production* et *Preview*), puis **Deployments → … → Redeploy**.

Le tableau de bord admin (`/admin`) affiche une carte « Mise en route » qui coche
chaque réglage dès qu'il est présent (sans jamais afficher les valeurs).

## 1. Base de données et accès admin (débloque les formulaires et /admin)

| Variable | Où la trouver |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | Console Firebase → projet *sayd-social-club* → ⚙️ Paramètres du projet → Comptes de service → **Générer une nouvelle clé privée**. Ouvrir le fichier JSON téléchargé et coller **tout son contenu** comme valeur. Supprimer ensuite le fichier de l'ordinateur. |
| `ADMIN_PASSWORD` | Un mot de passe que tu inventes, 10 caractères minimum (gestionnaire de mots de passe). |
| `STAFF_PASSWORD` | Mot de passe pour l'équipe de la porte (scanner seulement), 8 caractères minimum. |

> Tant que `FIREBASE_SERVICE_ACCOUNT` manque, les formulaires du site (contact,
> « Me prévenir », partenariats) répondent par une erreur en production.

## 2. Stripe en mode TEST

1. Stripe → activer **Mode test** (interrupteur en haut à droite).
2. **Développeurs → Clés API** → copier la *clé secrète* `sk_test_…` → variable `STRIPE_SECRET_KEY`.
3. **Développeurs → Webhooks → Ajouter un endpoint**
   - URL : `https://sayd-social-club.vercel.app/api/stripe/webhook`
     (à remplacer par `https://saydsocialclub.com/api/stripe/webhook` après le domaine)
   - Événements à cocher :
     `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
     `checkout.session.async_payment_failed`, `checkout.session.expired`, `charge.refunded`
   - Copier la *clé de signature* `whsec_…` → variable `STRIPE_WEBHOOK_SECRET`.
4. Redeploy. Faire un achat avec la carte de test `4242 4242 4242 4242`, date future, CVC quelconque.
5. Vérifier dans `/admin` : la commande passe à « Payé », le billet apparaît, le stock baisse.

La clé `sk_live_…` est **refusée** par le site tant que `STRIPE_ALLOW_LIVE=true`
n'est pas ajouté : impossible de passer en réel par accident.

## 3. Courriels de confirmation (Brevo)

| Variable | Valeur |
|---|---|
| `BREVO_API_KEY` | Brevo → SMTP & API → Clés API → Générer |
| `EMAIL_FROM` | `billets@saydsocialclub.com` (une fois le domaine vérifié dans Brevo) |
| `EMAIL_FROM_NAME` | `Sayd Social Club` |
| `TEAM_EMAIL` | l'adresse qui reçoit les messages du formulaire de contact |

Dans Brevo → Expéditeurs et domaines → ajouter `saydsocialclub.com` et créer les
enregistrements DNS demandés (SPF, DKIM, DMARC). Sans ça, les billets risquent
d'arriver dans les indésirables.

## 4. Domaine saydsocialclub.com

1. Acheter le domaine (Vercel → Domains, ou un registraire au choix).
2. Vercel → projet → Settings → Domains → ajouter `saydsocialclub.com` et `www.saydsocialclub.com` (redirection vers la version sans www).
3. Variable `SITE_URL=https://saydsocialclub.com`, puis Redeploy.
4. Stripe → Webhooks : changer l'URL de l'endpoint pour le nouveau domaine.

## 5. Avant d'ouvrir la vente réelle

- [ ] Achat test réussi, billet reçu par courriel, QR scanné à `/scan` (« valide » puis « déjà utilisé »).
- [ ] Remboursement test dans Stripe → la commande passe à « Remboursé ».
- [ ] Clés **live** : nouvel endpoint webhook en mode live (nouvelle clé `whsec_`), `STRIPE_SECRET_KEY=sk_live_…`, `STRIPE_ALLOW_LIVE=true`.
