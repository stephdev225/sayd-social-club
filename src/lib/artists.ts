/**
 * Artists and DJs invited by Sayd Social Club (Showcase page).
 * Only facts given by Sayd. Add `image` only with a photo Sayd has the right to use
 * (official press kit or the artist's permission).
 * status: "past" = already performed, "upcoming" = announced soon, "resident" = Sayd's own DJs.
 */
export interface Artist {
  name: string;
  role: { fr: string; en: string };
  origin?: { fr: string; en: string };
  status: "past" | "upcoming" | "current";
  instagram?: string;
  image?: string;
}

export const artists: Artist[] = [
  {
    name: "Waklexx",
    role: { fr: "DJ", en: "DJ" },
    status: "current",
    instagram: "https://www.instagram.com/waklexx_",
  },
  {
    name: "DJ Madmaxx",
    role: { fr: "DJ", en: "DJ" },
    origin: { fr: "France", en: "France" },
    status: "past",
  },
  {
    name: "Kulturr",
    role: { fr: "Artiste", en: "Artist" },
    status: "past",
  },
  {
    name: "Leto",
    role: { fr: "Artiste", en: "Artist" },
    status: "upcoming",
  },
  {
    name: "Bilouki",
    role: { fr: "Artiste", en: "Artist" },
    status: "upcoming",
  },
];
