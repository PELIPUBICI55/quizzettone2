import type { OchoCategoryDef } from "./types.js";

// Metadati delle categorie di OCHO ALLA BOMBA: SOLO id/nome/emoji, nessuna
// risposta né indice della bomba. È l'unica parte del mondo "deserto"
// condivisa col client: i giochi veri e propri (server/data/ocho.ts)
// restano server-side, altrimenti si spoilererebbe subito qual è la bomba.
export const OCHO_CATEGORIES: OchoCategoryDef[] = [
  { id: "animali", name: "Animali", emoji: "🐾" },
  { id: "geografia", name: "Geografia", emoji: "🌍" },
  { id: "scienze", name: "Scienze", emoji: "🔬" },
  { id: "serietv", name: "Serie TV", emoji: "📺" },
  { id: "film", name: "Film", emoji: "🎬" },
  { id: "storia", name: "Storia", emoji: "📜" },
  { id: "musica", name: "Musica", emoji: "🎵" },
  { id: "videogiochi", name: "Videogiochi", emoji: "🎮" },
  { id: "sport", name: "Sport", emoji: "⚽" },
];
