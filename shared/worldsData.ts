import type { WorldDef } from "./types.js";

// Nomi placeholder: rinominali pure, l'importante è mantenere gli "id" stabili
// perché sono referenziati dalle carte in cards.ts
export const WORLDS: WorldDef[] = [
  {
    id: "vulcano",
    name: "TOP",
    emoji: "🌋",
    tagline: "Ardente e imprevedibile",
    colorFrom: "#8a2b1d",
    colorTo: "#3a0f08",
  },
  {
    id: "abisso",
    name: "TCT",
    emoji: "🌊",
    tagline: "Freddo, profondo, silenzioso",
    colorFrom: "#0f5c73",
    colorTo: "#062633",
  },
  {
    id: "foresta",
    name: "GRANDIOSO QUIZ PARTICOLARE",
    emoji: "🌲",
    tagline: "Ogni albero nasconde un segreto",
    colorFrom: "#2f6f4f",
    colorTo: "#0f2a1c",
  },
  {
    id: "deserto",
    name: "OCHO ALLA BOMBA",
    emoji: "🏜️",
    tagline: "Miraggi e rovine sepolte",
    colorFrom: "#c98a2c",
    colorTo: "#4a300d",
  },
  {
    id: "ghiacciaia",
    name: "ACCHIAPPA LA PAPERA",
    emoji: "❄️",
    tagline: "Non tutto ciò che è ghiacciato è morto",
    colorFrom: "#4f8fbf",
    colorTo: "#173042",
  },
  {
    id: "cieli",
    name: "IL GRANDIOSO BUZZ",
    emoji: "☁️",
    tagline: "Sopra le nuvole, oltre le regole",
    colorFrom: "#7a6bc4",
    colorTo: "#2b2350",
  },
  {
    id: "rovine",
    name: "3/4",
    emoji: "🏛️",
    tagline: "Ciò che resta di un impero dimenticato",
    colorFrom: "#8a7a4f",
    colorTo: "#332c15",
  },
  {
    id: "officina",
    name: "CARO AMICO TI SCRIVO",
    emoji: "⚙️",
    tagline: "Dove tutto ha un meccanismo",
    colorFrom: "#7d7d7d",
    colorTo: "#2a2a2a",
  },
];

export const CITTADELLA_ID = "cittadella";
