# Images — où mettre quoi (plan à appliquer après la soirée du 11 octobre)

Règle : uniquement des images de Sayd (photographe ou équipe), avec crédit. Pas de stock, pas d'images trouvées en ligne.

## Ce qu'on a aujourd'hui
| Fichier | Taille | Usage | Statut |
|---|---|---|---|
| `public/events/sprezzatura-poster.jpg` | 1080×1920 | Affiche : accueil + page événement | ✅ en place — confirmer l'origine de la photo |
| `public/brand/logo-ivory.png` | 319×134 | Logo en-tête (tiré de l'ancien logo) | ⚠️ demander le **SVG** au graphiste |
| `src/app/icon.png` | 512 | Favicon (le « S » du logo) | ✅ |
| 4 vidéos story (320×568) | trop petites | — | ❌ compressées, texte incrusté |
| Vidéo story 1080×1920 | bonne résolution | — | ⚠️ texte incrusté sur presque chaque image |

## Quoi demander après le 11
| Emplacement | Format | Ce qu'il faut | Combien |
|---|---|---|---|
| Accueil — à côté de l'affiche, puis hero entre deux événements | Vidéo 9:16 et 16:9, 6-10 s, **sans texte ni musique incrustés**, ou photo ≥ 2400 px | Foule + DJ, plan large, lumière chaude | 1-2 clips + 1 photo |
| Page événement passé (archive) | Photo 4:5 ≥ 1600 px | Ambiance de la soirée, remplace l'affiche une fois passée | 3 |
| Galerie « Nos soirées en images » | Photos ≥ 2000 px, mélange 4:5 / 3:2 | Foule, détails (verres, tenues, mains, DJ), salle du Mora | 8-12 |
| Le club | Portrait 4:5 | Ben, Stéphane, partenaires — avec accord écrit | 2-3 |
| Ambassadeurs | Portrait 4:5 | Ambassadeurs réels, avec accord | 2-4 |
| Partage social (Open Graph) | 1200×630 | Généré depuis l'affiche ou une photo forte | 1 par événement |

## Comment choisir (grille)
1. **Netteté** sur les visages ou le sujet (rejeter les flous de mouvement, sauf choix assumé).
2. **Lumière** chaude et contrastée, cohérente avec le bordeaux / sable du site.
3. **Des gens, pas des salles vides** : l'énergie vend les billets.
4. **Pas de texte incrusté**, pas de logos de marques tierces en gros plan (bouteilles, parasols Corona).
5. **Consentement** : visage reconnaissable en gros plan → accord de la personne.
6. **Variété** : large / moyen / détail ; ne pas répéter la même scène.

Livraison idéale : un dossier partagé avec les originaux (pas via WhatsApp/Instagram, qui compressent).

## Photos en place (9 oct. 2026)
Toutes les photos de stock (Pexels) ont été retirées. Le site n'utilise que des photos de Sayd :
**La Troisième Mi-Temps, Toronto, 20 juin 2026 — photographe Kendsgns** (crédit en pied de page).

- 36 photos choisies sur 180 (netteté, énergie, variété large / moyen / détail, DJ, foule, invités).
- Originaux : 4672×7008 JPG, **1,4 Go** pour les 36 → exportés en **WebP, 5,3 Mo au total** :
  portraits 1200×1800 (q72, 40-300 Ko), recadrages larges 2000×1125 et 2400×1600 pour les fonds.
- Next/Image génère ensuite des versions AVIF/WebP plus petites selon l'écran.
- Fichiers : `public/photos/toronto-<n>.webp` et `toronto-<n>-wide.webp` ; correspondance dans `src/lib/media.ts`
  (texte alternatif FR/EN et point focal `pos` par photo).
- À venir : photos de The Bagatelle (Québec, 6 sept.) depuis la galerie Pixieset de Veep Media Group.

Pour ajouter une photo : exporter en WebP ≤ 1800 px de haut (≈ 100-250 Ko), la placer dans
`public/photos/` puis l'ajouter dans `src/lib/media.ts`.
