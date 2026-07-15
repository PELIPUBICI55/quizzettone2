import type { ParticolareCategoryDef } from "./types.js";

// Le 5 categorie di GRANDIOSO QUIZ PARTICOLARE (mondo "foresta"), condivise
// fra client (per la ruota) e server (per pescare gli item veri, che invece
// restano in server/data/particolare.ts perché contengono URL/risposte che
// non devono essere note al client prima del tempo).
export const PARTICOLARE_CATEGORIES: ParticolareCategoryDef[] = [
  { id: "animali", name: "Animali", emoji: "🐾", mediaKind: "image" },
  { id: "serie-tv", name: "Serie TV", emoji: "📺", mediaKind: "youtube" },
  { id: "film", name: "Film", emoji: "🎬", mediaKind: "image" },
  { id: "musica", name: "Musica", emoji: "🎵", mediaKind: "youtube" },
  { id: "videogiochi", name: "Videogiochi", emoji: "🎮", mediaKind: "image" },
];
