# PROJECT_MEMORY — Sayd Social Club

## Décisions
| ID | Date | Décision | Raison | Statut |
|---|---|---|---|---|
| D-001 | 2026-10-05 | Billetterie intégrée au site (Stripe Checkout, compte Stripe de Stéphane, sans Connect) à la place de lepointdevente et des factures manuelles à la porte | Demande de Stéphane | ACTIVE |
| D-002 | 2026-10-06 | **Reconstruction** dans un nouveau projet (Next.js 16, React 19, Tailwind 4) au lieu de corriger l'ancien | Ancien build cassé, Next 14.2.3 vulnérable, aucune API réelle, pas de git | ACTIVE (remplace la proposition « corriger l'existant » de l'audit) |
| D-003 | 2026-10-05 | Firestore via Admin SDK serveur uniquement ; règles client = tout refusé | Surface d'attaque minimale | ACTIVE |
| D-004 | 2026-10-06 | Stock réservé en transaction au départ vers Stripe, 35 min (minimum Stripe 30 min + marge), converti par le webhook | Pas de survente | ACTIVE |
| D-005 | 2026-10-05 | Le webhook signé est la seule preuve de paiement ; idempotence par `stripeEvents/{id}` + statut de commande | Recommandation Stripe | ACTIVE |
| D-006 | 2026-10-06 | Prix stockés hors taxes ; TPS 5 % + TVQ 9,975 % ajoutées (Tax Rates Stripe exclusives) | Stéphane : « les prix c'est sans les taxes » | ACTIVE — voir question prix |
| D-007 | 2026-10-06 | Billets non remboursables (affiché avant paiement et dans les conditions) | Stéphane | ACTIVE |
| D-008 | 2026-10-06 | Hébergement Vercel, pas de domaine pour l'instant | Stéphane | ACTIVE |
| D-009 | 2026-10-06 | Aucune photo stock. Affiche officielle Sprezzatura utilisée pour l'événement ; galerie vide (état vide honnête) jusqu'aux vraies photos | Brief client + règle vérité | ACTIVE |
| D-010 | 2026-10-06 | Palette du brief : noir charbon #120F0E, sable #D9B26A, terracotta #DA7656, vert bouteille #16382B, ivoire #EFE6D8 + accent par événement (bordeaux #5A1420 pour Sprezzatura) | Brief + affiche | ACTIVE |
| D-011 | 2026-10-06 | Polices auto-hébergées (fontsource) Cormorant Garamond + DM Sans, gardées de l'ancien site | Identité existante, pas d'appel à Google Fonts (vie privée, build hors-ligne) | ACTIVE |
| D-012 | 2026-10-06 | Mode démo local (`DEMO_PAYMENTS`) pour tester l'achat sans Stripe ; impossible en production | Démonstration et tests E2E | ACTIVE |
| D-013 | 2026-10-06 | Sites de motion fournis (Jitter, Dribbble, Framer, motionsites.ai) = inspiration uniquement, aucun template copié | Règle références | ACTIVE |

## Journal de session
### 2026-10-06
- Fait : nouveau projet Next.js 16 ; modèle de données typé ; logique stock / checkout / webhook ; routes `/api/checkout`, `/api/checkout/cancel`, `/api/stripe/webhook`, `/api/orders/status`, `/api/forms` ; pages accueil, événements, événement + achat, confirmation, billet (QR), ambassadeurs, le club, contact, confidentialité, conditions ; courriel de confirmation (Brevo) avec QR ; seed Sprezzatura ; règles Firestore ; scripts seed + taxes ; docs.
- Vérifié (comment) : `tsc` OK ; `eslint` OK ; `next build` OK ; 28 tests Vitest OK (taxes, stock, 5 achats simultanés pour 1 place, webhook ×3, expiration, échec, remboursement, route webhook signée / signature invalide / rejeu) ; parcours complet en navigateur (mobile 390 px) en mode démo : 2 billets → 60,91 $ → confirmation → 2 QR uniques → page billet « Valide » ; aucun débordement horizontal 390 / 1440 px.
- Non vérifié : vrais appels Stripe test (pas de clés), Firestore réel (pas de projet), envoi Brevo réel, rendu sur iPhone réel, embed Spotify (bloqué dans l'environnement de test).
- Prochaine étape : clés Stripe test + projet Firebase → test de bout en bout réel ; puis `/admin` (auth) + `/scan` (check-in) + vente à la porte.

## Questions ouvertes
- **Prix** : 26,49 $ hors taxes = **30,45 $ taxes incluses**, plus cher que 30 $ à la porte. Le 26,49 $ est-il déjà taxes incluses (prix lepointdevente) ? Le 30 $ à la porte inclut-il les taxes ?
- Capacité du Mora et nombre de billets en ligne (250 mis par défaut).
- Adresse exacte du Mora (seulement « Grande Allée Est » confirmé).
- Origine de la photo de l'affiche (photographe ? IA ?) avant usage public large.
- Clés Stripe **test** et projet Firebase : à créer / fournir via Vercel (jamais dans le chat).
- Compte Brevo et adresse d'envoi (domaine non encore acheté → adresse d'envoi à définir).
- Rushs vidéo bruts sans texte en haute résolution pour le hero.
