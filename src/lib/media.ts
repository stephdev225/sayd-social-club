/**
 * Sayd's own photos (La Troisième Mi-Temps, Toronto, June 2026 — photographer: Kendsgns).
 * Exported from the 30–60 MB camera originals to WebP: 1200×1800 for portraits,
 * 2000–2400 px wide crops for full-width backgrounds. Next/Image then serves
 * smaller AVIF/WebP variants per screen. See docs/IMAGES.md.
 */
export interface Photo {
  src: string;
  w: number;
  h: number;
  /** CSS object-position: keeps faces in frame when the photo is cropped. */
  pos?: string;
  alt: { fr: string; en: string };
}

const P = (n: number, fr: string, en: string, pos?: string): Photo => ({ src: `/photos/toronto-${n}.webp`, w: 1200, h: 1800, pos, alt: { fr, en } });
const W = (n: number, w: number, h: number, fr: string, en: string, pos?: string): Photo => ({ src: `/photos/toronto-${n}-wide.webp`, w, h, pos, alt: { fr, en } });

export const photos = {
  // Full-width crops
  crowdWide: W(47, 2400, 1600, "La foule, mains levées, sous les lumières de la salle", "The crowd, hands up, under the room lights"),
  floorWide: W(103, 2000, 1125, "Piste pleine, téléphones levés", "A full dance floor, phones in the air"),
  floorWide2: W(104, 2000, 1125, "La salle en pleine soirée, lumières rouges et bleues", "The room in full swing, red and blue lights"),
  barWide: W(37, 2000, 1125, "Invités devant le bar éclairé en rouge", "Guests in front of the red-lit bar"),
  friendsWide: W(100, 2000, 1125, "Amis qui posent avec le drapeau ivoirien", "Friends posing with the Ivorian flag", "50% 35%"),
  // Portraits
  bottles: P(2, "Bouteilles et étincelles portées au-dessus de la foule", "Bottles and sparklers carried above the crowd"),
  sparklers: P(3, "Service bouteille sous les néons", "Bottle service under the neon lights"),
  booth: P(4, "Les DJs derrière les platines, lumière rouge", "The DJs behind the decks, red light"),
  djClose: P(13, "La DJ aux platines, maillot orange", "The DJ at the decks in an orange jersey", "50% 45%"),
  hype: P(21, "Un groupe d'amis en pleine euphorie", "A group of friends in full celebration", "50% 55%"),
  hype2: P(22, "Le groupe chante et danse ensemble", "The group singing and dancing together", "50% 55%"),
  stageLine: P(25, "Invitées qui dansent devant le mur de disques", "Guests dancing in front of the record wall", "50% 45%"),
  violet: P(32, "Danseuse en tenue brodée, lumière violette", "Dancer in an embroidered outfit, violet light", "50% 40%"),
  pink: P(41, "Ambiance rose et violette sur la piste", "Pink and violet mood on the dance floor"),
  hands: P(46, "Mains levées dans une salle comble", "Hands up in a packed room"),
  djBlue: P(54, "Le DJ dans la lumière bleue", "The DJ in blue light"),
  barViolet: P(64, "Le bar illuminé en violet", "The bar lit in violet"),
  braids: P(82, "Une invitée qui danse, sourire aux lèvres", "A guest dancing with a smile", "50% 40%"),
  jersey: P(85, "Invité en maillot qui danse", "Guest in a jersey dancing", "50% 40%"),
  orangeDress: P(98, "Robe orange sur la piste", "An orange dress on the dance floor", "50% 40%"),
  flag: P(100, "Amis qui posent avec le drapeau ivoirien", "Friends posing with the Ivorian flag", "50% 35%"),
  dance: P(105, "Invitée qui danse au milieu de la foule", "A guest dancing in the middle of the crowd"),
  twirl: P(106, "Pas de danse en chemise blanche", "Dance moves in a white shirt"),
  duo: P(112, "Deux amies qui dansent", "Two friends dancing", "50% 40%"),
  djDark: P(115, "Silhouette du DJ dans la pénombre", "The DJ's silhouette in the dark"),
  djCap: P(119, "Le DJ en maillot turquoise", "The DJ in a turquoise jersey", "50% 40%"),
  smile: P(125, "Invitée souriante, lumière rouge", "A smiling guest in red light", "50% 40%"),
  laugh: P(127, "Éclats de rire entre amis", "Friends laughing together", "50% 40%"),
  cheer: P(130, "Invité qui applaudit sous les lumières rouges", "A guest cheering under red lights", "50% 40%"),
  heart: P(140, "Un cœur avec les mains", "A heart made with hands", "50% 40%"),
  arms: P(144, "Bras levés en maillot vert", "Arms up in a green jersey", "50% 35%"),
  white: P(152, "Invité en t-shirt blanc qui danse", "A guest in a white tee dancing", "50% 35%"),
  portrait: P(157, "Invitée en maillot orange, sourire", "A guest in an orange jersey, smiling", "50% 40%"),
  pair: P(161, "Deux amies en maillots", "Two friends in jerseys", "50% 40%"),
  dj: P(165, "La DJ aux platines Pioneer", "The DJ at the Pioneer decks", "50% 70%"),
  redRoom: P(173, "La salle baignée de rouge", "The room bathed in red"),
} satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof photos;

/** Full gallery page order (masonry). */
export const galleryPage: PhotoKey[] = [
  "hands", "djClose", "bottles", "braids", "hype", "orangeDress", "dj", "violet", "smile", "barViolet", "arms", "portrait",
  "dance", "pink", "djCap", "stageLine", "heart", "duo", "flag", "booth", "white", "pair", "twirl", "redRoom",
];

export const PHOTO_CREDIT = "Kendsgns";
