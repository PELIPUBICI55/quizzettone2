import type { PackDef } from "../../shared/types.js";

export const PACKS: PackDef[] = [
  {
    id: "pack-base",
    name: "Pacchetto del Viandante",
    cost: 50,
    cardCount: 1,
    description: "Una singola carta, ma ogni viaggio inizia da un passo.",
  },
  {
    id: "pack-medio",
    name: "Baule del Mercante",
    cost: 100,
    cardCount: 3,
    description: "Tre carte, buone probabilità di trovare qualcosa di raro.",
  },
  {
    id: "pack-grande",
    name: "Forziere della Cittadella",
    cost: 150,
    cardCount: 5,
    description: "Cinque carte: il modo più veloce per completare la collezione.",
  },
];
