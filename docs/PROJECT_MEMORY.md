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
| D-009 | 2026-10-06 | Aucune photo stock | Brief client | REMPLACÉE par D-014 |
| D-010 | 2026-10-06 | Palette du brief : noir charbon #120F0E, sable #D9B26A, terracotta #DA7656, vert bouteille #16382B, ivoire #EFE6D8 + accent par événement (bordeaux #5A1420 pour Sprezzatura) | Brief + affiche | ACTIVE |
| D-011 | 2026-10-06 | Polices auto-hébergées (fontsource) Cormorant Garamond + DM Sans, gardées de l'ancien site | Identité existante, pas d'appel à Google Fonts (vie privée, build hors-ligne) | ACTIVE |
| D-012 | 2026-10-06 | Mode démo local (`DEMO_PAYMENTS`) pour tester l'achat sans Stripe ; impossible en production | Démonstration et tests E2E | ACTIVE |
| D-014 | 2026-10-06 | Photos d'ambiance Pexels (licence libre, usage commercial) en attendant les vraies photos de Sayd ; images d'ambiance seulement, jamais présentées comme nos soirées ; crédit en pied de page | Demande de Stéphane : embellir aujourd'hui, remplacement après le 11 | ACTIVE |
| D-015 | 2026-10-06 | Le site porte l'identité Sayd (hero plein écran, wordmark) ; la prochaine soirée est un élément du site, pas son thème (plus de bandeau bordeaux) | Retour de Stéphane | ACTIVE |
| D-016 | 2026-10-06 | Prix affichés taxes incluses : 26,49 $ = 23,04 $ + TPS + TVQ ; taxes envoyées à Stripe en lignes séparées | Stéphane : 26,49 $ = prix lepointdevente tout compris | ACTIVE (remplace la question prix) |
| D-017 | 2026-10-06 | Admin et porte : deux mots de passe (ADMIN_PASSWORD, STAFF_PASSWORD), cookie signé httpOnly 12 h | Livrable aujourd'hui sans dépendre d'un compte Firebase Auth | ACTIVE |
| D-018 | 2026-10-06 | Hébergement : Vercel projet sayd-social-club relié au dépôt GitHub privé stephdev225/sayd-social-club (déploiement à chaque push) ; Firebase projet sayd-social-club, Firestore northamerica-northeast1 | — | ACTIVE |
| D-019 | 2026-10-06 | Site = entonnoir de vente : bouton Billets toujours visible dans la navbar (fixe), pastille flottante, barre d'achat mobile sur la page événement, bloc « prochaine soirée » en bas de chaque page | Demande de Stéphane | ACTIVE |
| D-020 | 2026-10-06 | Nouvelles pages Showcase (artistes invités : Waklexx, DJ Madmaxx, Kulturr ; Leto et Bilouki = info interne, jamais affichés sans annonce de Stéphane) et Partenariats (formulaire `partnership`) | Demande de Stéphane | ACTIVE |
| D-021 | 2026-10-06 | Page événement : visuel sans texte (`heroImage`) à gauche, infos de l'affiche déplacées à droite au-dessus de « Présenté par » ; affiche complète via « Voir l'affiche » | Demande de Stéphane | ACTIVE |
| D-022 | 2026-10-06 | Champ `externalTicketUrl` : tant que la vente en ligne du site n'est pas ouverte, le bouton d'achat renvoie vers Le Point de Vente (soirée du 11 oct.) | « l'event du 11 reste sur le point de vente » | ACTIVE, URL à fournir |
| D-023 | 2026-10-07 | Aucun prix dans les boutons/CTA du site : le prix n'apparaît que dans la boîte de billetterie | Demande de Stéphane | ACTIVE |
| D-024 | 2026-10-07 | Événements et billets gérés dans /admin/evenements (prix saisis taxes incluses, heures de Québec, images stockées dans Firestore en WebP ≤ 700 Ko) ; le site public se met à jour à l'enregistrement | Stéphane veut annoncer les prochains events lui-même | ACTIVE |
| D-025 | 2026-10-07 | Vente non ouverte : à moins de 21 jours → boîte « Réserver » (WhatsApp/téléphone, comme l'affiche) ; plus tôt → « Me prévenir » ; lien externe (Le Point de Vente) prioritaire s'il est renseigné | Sprezzatura reste sur lepointdevente, lien exact à fournir | ACTIVE |
| D-026 | 2026-10-07 | Domaine visé : saydsocialclub.com (disponible, 11,25 $ US/an chez Vercel au 2026-10-07). Achat par Stéphane | — | EN ATTENTE |
| D-027 | 2026-10-07 | Le site s'ouvre toujours en français (plus de détection de langue du navigateur) ; l'anglais est mémorisé seulement si le visiteur le choisit | Demande de Stéphane | ACTIVE |
| D-028 | 2026-10-07 | Aucune tranche d'âge dans les textes ; lien « ← Accueil » / « ← Tous les événements » sous l'en-tête des pages intérieures | Demande de Stéphane | ACTIVE |
| D-029 | 2026-10-07 | Page événement : une seule action (bouton billetterie externe, ou réservation WhatsApp près de la date, ou formulaire de vente du site) ; pas de « Voir l'affiche » ; pas de bouton Billets dans l'en-tête sur une page événement | Demande de Stéphane : trop de CTA | ACTIVE |
| D-030 | 2026-10-07 | Accueil : héros et marquee réduits, sans sur-titre ; « L'expérience Sayd » en cartes photo qui s'empilent au scroll ; « L'ambiance » en bandes de photos qui défilent au scroll | Demande de Stéphane | ACTIVE |
| D-031 | 2026-10-07 | /evenements : section « Événements précédents » (événements passés publiés, ajoutés depuis l'admin) | Demande de Stéphane | ACTIVE |
| D-032 | 2026-10-07 | Hébergement recommandé : Vercel Pro (le plan Hobby gratuit interdit l'usage commercial). Pas d'hébergement mutualisé cPanel/WordPress : le site a un serveur (paiements, webhook, admin) | Vérifié sur vercel.com/pricing le 2026-10-07 | PROPOSÉ |
| D-013 | 2026-10-06 | Sites de motion fournis (Jitter, Dribbble, Framer, motionsites.ai) = inspiration uniquement, aucun template copié | Règle références | ACTIVE |

## Journal de session
### 2026-10-06
- Fait : nouveau projet Next.js 16 ; modèle de données typé ; logique stock / checkout / webhook ; routes `/api/checkout`, `/api/checkout/cancel`, `/api/stripe/webhook`, `/api/orders/status`, `/api/forms` ; pages accueil, événements, événement + achat, confirmation, billet (QR), ambassadeurs, le club, contact, confidentialité, conditions ; courriel de confirmation (Brevo) avec QR ; seed Sprezzatura ; règles Firestore ; scripts seed + taxes ; docs.
- Vérifié (comment) : `tsc` OK ; `eslint` OK ; `next build` OK ; 28 tests Vitest OK (taxes, stock, 5 achats simultanés pour 1 place, webhook ×3, expiration, échec, remboursement, route webhook signée / signature invalide / rejeu) ; parcours complet en navigateur (mobile 390 px) en mode démo : 2 billets → 60,91 $ → confirmation → 2 QR uniques → page billet « Valide » ; aucun débordement horizontal 390 / 1440 px.
- Non vérifié : vrais appels Stripe test (pas de clés), Firestore réel (pas de projet), envoi Brevo réel, rendu sur iPhone réel, embed Spotify (bloqué dans l'environnement de test).
- Prochaine étape : clés Stripe test + projet Firebase → test de bout en bout réel ; puis `/admin` (auth) + `/scan` (check-in) + vente à la porte.

### 2026-10-06 (après-midi)
- Fait : mise en ligne https://sayd-social-club.vercel.app ; photos d'ambiance ; animations (révélation des titres, masques d'images, parallaxe, galerie épinglée, compte à rebours, transitions de page, défilement doux) ; accueil centré sur la marque ; prix taxes incluses ; tableau de bord /admin ; scanner /scan ; export CSV ; Firestore créé et règles déployées ; auto-seed.
- Vérifié : 33 tests ; build Vercel OK ; parcours achat → admin → scan en local ; rendu en ligne dans le navigateur Claude.
- Non vérifié : Stripe test réel et Firestore réel (variables Vercel à ajouter par Stéphane) ; caméra du scanner sur iPhone réel.

## Questions ouvertes
- Clé Stripe live exposée dans le chat le 2026-10-06 : à faire tourner par Stéphane.
- Capacité du Mora et nombre de billets en ligne (250 mis par défaut).
- Adresse exacte du Mora (seulement « Grande Allée Est » confirmé).
- Origine de la photo de l'affiche (photographe ? IA ?) avant usage public large.
- Clés Stripe **test** et projet Firebase : à créer / fournir via Vercel (jamais dans le chat).
- Compte Brevo et adresse d'envoi (domaine non encore acheté → adresse d'envoi à définir).
- Rushs vidéo bruts sans texte en haute résolution pour le hero.
