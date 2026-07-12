import type { Top5CategoryDef } from "./types.js";

// Metadati delle categorie Top 5: SOLO id/nome/emoji, nessuna risposta.
// È l'unica parte del mondo "vulcano" (TOP) condivisa col client: le classifiche
// vere e proprie (server/data/top5.ts) restano server-side per non spoilerare
// le risposte a chi gioca.
export const TOP5_CATEGORIES: Top5CategoryDef[] = [
  { id: "geografia", name: "Geografia", emoji: "🌍" },
  { id: "scienze", name: "Scienze", emoji: "🔬" },
  { id: "serietv", name: "Serie TV", emoji: "📺" },
  { id: "film", name: "Film", emoji: "🎬" },
  { id: "musica", name: "Musica", emoji: "🎵" },
  { id: "videogiochi", name: "Videogiochi", emoji: "🎮" },
];
