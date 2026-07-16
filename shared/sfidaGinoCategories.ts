import type { SfidaGinoCategoryDef } from "./types.js";

// Condiviso fra client e server (come particolareCategories.ts): la ruota
// del client ha bisogno degli emoji/nomi senza importare i dataset veri
// (bandiere/capitali), che restano server-only in server/data/sfidaGino.ts.
export const SFIDA_GINO_CATEGORIES: SfidaGinoCategoryDef[] = [
  { id: "capitali", name: "Indovina la Capitale", emoji: "🏛️" },
  { id: "bandiere", name: "Indovina la Bandiera", emoji: "🚩" },
];
