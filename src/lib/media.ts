/**
 * Sayd's own photos.
 * - Sprezzatura at Mora, Québec, 11 Oct 2026 — photographer: Rogelio Photographe.
 * - La Troisième Mi-Temps, Toronto, June 2026 — photographer: Kendsgns.
 * Exported from the camera originals to WebP (1200×1800 portraits, 1800×1200 landscape),
 * colours untouched. Shown whole wherever possible (no heavy crops). See docs/IMAGES.md.
 */
export interface Photo {
  src: string;
  w: number;
  h: number;
  /** CSS object-position for the rare places where a photo has to be cropped. */
  pos?: string;
  alt: { fr: string; en: string };
}

const M = (n: string, fr: string, en: string, pos?: string): Photo => ({ src: `/photos/mora-${n}.webp`, w: 1200, h: 1800, pos, alt: { fr, en } });
const T = (n: number, fr: string, en: string, pos?: string): Photo => ({ src: `/photos/toronto-${n}.webp`, w: 1200, h: 1800, pos, alt: { fr, en } });

export const photos = {
  // Aerial show (priority)
  aerialSplit: M("08684", "Acrobate aérienne en grand écart au-dessus de la salle", "Aerial acrobat in a split above the room", "50% 35%"),
  aerial: M("08675", "Acrobate aérienne au-dessus des invités", "Aerial acrobat above the guests", "50% 35%"),
  aerialBeams: M("08714", "Acrobate dans les faisceaux rouges", "Acrobat in the red light beams", "50% 40%"),
  aerialDj: M("08715", "Acrobate au-dessus de la cabine du DJ", "Acrobat above the DJ booth", "50% 40%"),
  aerialHoop: M("08733", "Acrobate dans son anneau, faisceaux rouges", "Acrobat in her hoop, red beams", "50% 40%"),
  aerialist: M("08270", "Acrobate vue d'en bas, sous la boule à facettes", "Acrobat seen from below, under the mirror ball", "50% 40%"),
  balcony: M("09183", "Acrobate au balcon, au-dessus de la foule", "Acrobat on the balcony, above the crowd", "50% 40%"),
  hoop: M("08229", "Acrobate dans son anneau, lumière rouge", "Acrobat in her hoop, red light"),
  // Music
  djAbove: M("08296", "Le DJ aux platines, vu d'en haut", "The DJ at the decks, seen from above", "50% 45%"),
  djDecks: M("08800", "Mains du DJ sur les platines", "The DJ's hands on the decks", "50% 50%"),
  decks: { src: "/photos/mora-08606.webp", w: 1800, h: 1200, alt: { fr: "Les platines dans la lumière rouge", en: "The decks in red light" } } as Photo,
  djRed: M("08238", "Le DJ dans la lumière rouge", "The DJ in red light", "50% 40%"),
  djBooth: M("09029", "La cabine du DJ", "The DJ booth"),
  djViolet: M("09433", "Le DJ sous la lumière violette", "The DJ under violet light"),
  // People
  couple: M("08371", "Un couple élégant pose à l'entrée", "An elegant couple posing at the entrance", "50% 35%"),
  duo: M("08565", "Deux amis et leurs bouteilles Belvedere", "Two friends with their Belvedere bottles", "50% 40%"),
  trio: M("09153", "Trois amis élégants", "Three elegant friends", "50% 40%"),
  yellow: M("09220", "Invitée en robe jaune qui danse", "A guest dancing in a yellow dress", "50% 35%"),
  smiles: M("09065", "Sourires entre amies", "Friends sharing a smile", "50% 35%"),
  ben: M("08146", "Ben, de Sayd Social Club", "Ben, from Sayd Social Club", "50% 35%"),
  // Room, bar & bottles
  crowd: M("08581", "La salle comble vue d'en haut", "The packed room from above", "50% 50%"),
  above: M("09167", "La salle et la cabine du DJ vues d'en haut", "The room and the DJ booth from above"),
  haze: M("09566", "La foule dans la brume rouge", "The crowd in a red haze"),
  dance: M("09465", "La piste en pleine soirée", "The dance floor in full swing"),
  facade: M("08159", "La façade du Mora, Grande Allée", "The Mora façade on Grande Allée"),
  wine: M("08143", "Le mur de champagne éclairé", "The lit champagne wall"),
  bar: M("08275", "Le bar vu d'en haut", "The bar seen from above"),
  bucket: M("08575", "Belvedere dans son seau à glace", "Belvedere in its ice bucket", "50% 40%"),
  service: M("08837", "Service bouteille à table", "Table bottle service"),
  veuve: M("09005", "Veuve Clicquot servie au-dessus de la foule", "Veuve Clicquot served above the crowd", "50% 30%"),
  glow: M("09135", "Bouteilles Belvedere lumineuses", "Glowing Belvedere bottles", "50% 40%"),
  sign: M("09401", "Enseigne Belvedere portée au-dessus de la foule", "A Belvedere sign carried above the crowd", "50% 30%"),
  signClose: M("09111", "Bouteille Belvedere dans son enseigne lumineuse", "A Belvedere bottle in its light-up sign", "50% 35%"),
  sparklers: M("09568", "Service bouteille avec étincelles", "Bottle service with sparklers", "50% 35%"),
  champagne: M("09336", "Bouteille de champagne levée sur la piste", "A champagne bottle raised on the dance floor", "50% 35%"),
  toast: M("09592", "Invités qui trinquent en salon", "Guests toasting in a lounge"),
  // Toronto
  hands: T(46, "Mains levées dans une salle comble", "Hands up in a packed room"),
  braids: T(82, "Une invitée qui danse, sourire aux lèvres", "A guest dancing with a smile", "50% 40%"),
  orangeDress: T(98, "Robe orange sur la piste", "An orange dress on the dance floor", "50% 40%"),
} satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof photos;

/** Gallery page order: the aerial show and Stéphane's picks first. */
export const galleryPage: PhotoKey[] = [
  "aerialSplit", "couple", "djAbove", "wine", "aerial", "duo", "bar", "aerialHoop",
  "veuve", "glow", "crowd", "aerialist", "bucket", "decks", "djDecks", "sign", "balcony",
  "service", "sparklers", "aerialBeams", "facade", "trio", "yellow", "aerialDj", "smiles",
  "dance", "haze", "champagne", "hoop", "toast", "djViolet", "hands", "braids", "orangeDress",
];
