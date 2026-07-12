import type { CaroAmicoPersonaDef } from "./types.js";

// Le "categorie" del mondo "officina" (CARO AMICO TI SCRIVO) sono persone
// reali: la ruota estrae una persona e chi gioca deve indovinare a voce la
// SUA risposta a una domanda personale. Solo id/nome/emoji sono condivisi
// col client: le domande vere e proprie con le risposte (server/data/caroAmico.ts)
// restano server-side per non spoilerarle a chi gioca.
export const CARO_AMICO_PERSONE: CaroAmicoPersonaDef[] = [
  { id: "frost", name: "Frost", emoji: "🧊" },
  { id: "venni", name: "Venni", emoji: "🍃" },
  { id: "slander", name: "Slander", emoji: "🎧" },
  { id: "checky", name: "Checky", emoji: "✅" },
  { id: "glitch", name: "Glitch", emoji: "🖥️" },
  { id: "sheren", name: "Sheren", emoji: "🌙" },
  { id: "davide", name: "Davide", emoji: "🙂" },
];
