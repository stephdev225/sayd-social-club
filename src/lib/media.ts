/**
 * Ambiance photos from Pexels (free for commercial use, no attribution required —
 * https://www.pexels.com/license/). Mood images only: they are NOT presented as
 * Sayd events and will be replaced by Sayd's own photos (see docs/IMAGES.md).
 */
export interface StockPhoto {
  id: string;
  alt: { fr: string; en: string };
  w: number;
  h: number;
  photographer: string;
}

export function pexels(id: string, width = 1600): string {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;
}

export const ambiance = {
  crowd: { id: "5192266", w: 3, h: 2, photographer: "cottonbro studio", alt: { fr: "Foule dans une salle baignée de lumière chaude", en: "Crowd in a room bathed in warm light" } },
  dancing: { id: "5152595", w: 3, h: 2, photographer: "cottonbro studio", alt: { fr: "Silhouettes qui dansent sous les projecteurs", en: "Silhouettes dancing under the lights" } },
  djHands: { id: "30727065", w: 2, h: 3, photographer: "Pexels", alt: { fr: "Mains d'un DJ sur la table de mixage, lumière rouge", en: "DJ's hands on the mixer, red light" } },
  mixer: { id: "31827066", w: 3, h: 2, photographer: "Pexels", alt: { fr: "Table de mixage vue de dessus", en: "Mixing desk seen from above" } },
  cocktail: { id: "36189454", w: 2, h: 3, photographer: "Pexels", alt: { fr: "Espresso martini sur fond sombre", en: "Espresso martini on a dark background" } },
  toast: { id: "36873979", w: 3, h: 2, photographer: "Basunga Visual", alt: { fr: "Verres levés et champagne servi", en: "Glasses raised as champagne is poured" } },
  duo: { id: "17533400", w: 3, h: 2, photographer: "Pexels", alt: { fr: "Deux femmes élégantes en tenue noire", en: "Two elegant women dressed in black" } },
  group: { id: "28280981", w: 3, h: 2, photographer: "Covantnyc", alt: { fr: "Groupe d'amis qui dansent en soirée", en: "Friends dancing on a night out" } },
  bar: { id: "29455146", w: 3, h: 2, photographer: "Pexels", alt: { fr: "Bar éclairé, étagères de bouteilles", en: "Lit bar with shelves of bottles" } },
  monochrome: { id: "3419648", w: 3, h: 2, photographer: "cottonbro studio", alt: { fr: "Portrait noir et blanc en soirée", en: "Black-and-white party portrait" } },
  party: { id: "12297243", w: 3, h: 2, photographer: "Joegraphy", alt: { fr: "Soirée animée dans un club", en: "Lively night in a club" } },
} satisfies Record<string, StockPhoto>;

export const galleryOrder: (keyof typeof ambiance)[] = ["party", "cocktail", "mixer", "monochrome", "bar"];
