/**
 * Sayd's own photos.
 * - Sprezzatura at Mora, Québec, 11 Oct 2026 — photographer: Rogelio Photographe.
 * - La Troisième Mi-Temps, Toronto, June 2026 — photographer: Kendsgns.
 * Exported from the camera originals to WebP: 1200×1800 portraits, 2000–2400 px wide
 * crops for full-width backgrounds. Next/Image then serves smaller AVIF/WebP variants
 * per screen. See docs/IMAGES.md.
 */
export interface Photo {
  src: string;
  w: number;
  h: number;
  /** CSS object-position: keeps faces in frame when the photo is cropped. */
  pos?: string;
  alt: { fr: string; en: string };
}

const M = (n: string, fr: string, en: string, pos?: string): Photo => ({ src: `/photos/mora-${n}.webp`, w: 1200, h: 1800, pos, alt: { fr, en } });
const MW = (n: string, w: number, h: number, fr: string, en: string): Photo => ({ src: `/photos/mora-${n}-wide.webp`, w, h, alt: { fr, en } });
const T = (n: number, fr: string, en: string, pos?: string): Photo => ({ src: `/photos/toronto-${n}.webp`, w: 1200, h: 1800, pos, alt: { fr, en } });

export const photos = {
  // Full-width crops (Mora)
  heroWide: MW("08714", 2400, 1600, "Acrobate aérienne dans les faisceaux rouges au-dessus de la foule", "Aerial acrobat in red light beams above the crowd"),
  aerialWide: MW("08675", 2000, 1125, "Acrobate en grand écart au-dessus des invités", "Acrobat in a split above the guests"),
  crowdAbove: MW("09167", 2000, 1125, "La salle comble vue d'en haut, la cabine du DJ au centre", "The packed room from above, the DJ booth at its heart"),
  wineWide: MW("08143", 2000, 1125, "Le mur de bouteilles de champagne éclairé", "The lit wall of champagne bottles"),
  bottleWide: MW("09123", 2000, 1125, "Service bouteille Belvedere porté au-dessus de la foule", "Belvedere bottle service carried above the crowd"),
  facadeWide: MW("08159", 2000, 1125, "L'enseigne du Mora sur sa façade en pierre", "The Mora sign on its stone façade"),
  // Portraits (Mora)
  djSuit: M("08402", "Le DJ en costume aux platines", "The DJ in a suit at the decks", "50% 45%"),
  elegant: M("08480", "Invitée élégante sous la lumière rouge", "An elegant guest under red light", "50% 40%"),
  friends: M("08982", "Un groupe d'amies qui posent", "A group of friends posing", "50% 50%"),
  aerial: M("08675", "Acrobate aérienne au-dessus de la salle", "Aerial acrobat above the room"),
  aerialBeams: M("08714", "Acrobate dans les faisceaux rouges", "Acrobat in the red beams"),
  sign: M("09111", "Bouteille Belvedere dans son enseigne lumineuse", "A Belvedere bottle in its light-up sign", "50% 35%"),
  scarf: M("09274", "Invité au foulard, sourire aux lèvres", "A guest in a scarf, smiling", "50% 35%"),
  champagne: M("09336", "Bouteille de champagne levée sur la piste", "A champagne bottle raised on the dance floor", "50% 35%"),
  facade: M("08159", "La façade du Mora, Grande Allée", "The Mora façade on Grande Allée"),
  veuve: M("09005", "Veuve Clicquot servie au-dessus de la foule", "Veuve Clicquot served above the crowd", "50% 30%"),
  dance: M("09465", "La piste en pleine soirée", "The dance floor in full swing"),
  bottleGirl: M("09570", "Service bouteille avec étincelles", "Bottle service with sparklers"),
  hoop: M("08229", "Acrobate dans son anneau, lumière rouge", "Acrobat in her hoop, red light"),
  wine: M("08143", "Le mur de champagne", "The champagne wall"),
  bar: M("08284", "Le bar vu d'en haut", "The bar seen from above"),
  above: M("09167", "La salle comble vue d'en haut", "The packed room from above"),
  haze: M("09566", "La foule dans la brume rouge", "The crowd in a red haze"),
  yellow: M("09220", "Invitée en robe jaune qui danse", "A guest dancing in a yellow dress", "50% 35%"),
  smiles: M("09065", "Sourires entre amies", "Friends sharing a smile", "50% 35%"),
  couple: M("08371", "Un couple élégant pose à l'entrée", "An elegant couple posing at the entrance", "50% 40%"),
  djLaptop: M("09257", "Le DJ aux platines devant la foule", "The DJ at the decks facing the crowd"),
  service: M("08833", "Service bouteille à table", "Table bottle service"),
  aerialist: M("08270", "Acrobate aérienne vue d'en bas", "Aerial acrobat seen from below"),
  toast: M("09592", "Invités qui trinquent en salon", "Guests toasting in a lounge"),
  trio: M("09153", "Trois amis élégants", "Three elegant friends", "50% 40%"),
  djRed: M("08238", "Le DJ dans la lumière rouge", "The DJ in red light", "50% 40%"),
  djBooth: M("09029", "La cabine du DJ", "The DJ booth"),
  djViolet: M("09433", "Le DJ sous la lumière violette", "The DJ under violet light"),
  // Portraits (Toronto)
  hands: T(46, "Mains levées dans une salle comble", "Hands up in a packed room"),
  braids: T(82, "Une invitée qui danse, sourire aux lèvres", "A guest dancing with a smile", "50% 40%"),
  orangeDress: T(98, "Robe orange sur la piste", "An orange dress on the dance floor", "50% 40%"),
  stageLine: T(25, "Invitées qui dansent devant le mur de disques", "Guests dancing in front of the record wall", "50% 45%"),
  violet: T(32, "Danseuse en tenue brodée, lumière violette", "Dancer in an embroidered outfit, violet light", "50% 40%"),
} satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof photos;

/** Full gallery page order (masonry). */
export const galleryPage: PhotoKey[] = [
  "aerialBeams", "facade", "djSuit", "elegant", "friends", "sign", "scarf", "champagne", "hands", "couple",
  "veuve", "dance", "hoop", "yellow", "wine", "bar", "braids", "smiles", "above", "service",
  "aerialist", "haze", "trio", "orangeDress", "toast", "bottleGirl", "stageLine", "violet",
];
