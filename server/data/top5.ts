import type { Top5Def } from "../../shared/types.js";

// Categorie placeholder: personalizzale pure in seguito, l'importante è che
// ogni "answers" abbia esattamente 5 elementi, in ordine dal 1° al 5° posto.
export const TOP5_BANK: Top5Def[] = [
  {
    id: "top5-1",
    title: "Top 5 film più visti di sempre al cinema",
    answers: ["Avatar", "Avengers: Endgame", "Titanic", "Star Wars: Il Risveglio della Forza", "Avengers: Infinity War"],
  },
  {
    id: "top5-2",
    title: "Top 5 Paesi più popolosi del mondo",
    answers: ["India", "Cina", "Stati Uniti", "Indonesia", "Pakistan"],
  },
  {
    id: "top5-3",
    title: "Top 5 montagne più alte del mondo",
    answers: ["Everest", "K2", "Kangchenjunga", "Lhotse", "Makalu"],
  },
  {
    id: "top5-4",
    title: "Top 5 squadre con più titoli di Champions League",
    answers: ["Real Madrid", "Milan", "Bayern Monaco", "Liverpool", "Barcellona"],
  },
  {
    id: "top5-5",
    title: "Top 5 fiumi più lunghi del mondo",
    answers: ["Nilo", "Rio delle Amazzoni", "Fiume Azzurro (Yangtze)", "Mississippi", "Fiume Giallo (Huang He)"],
  },
];

export function pickRandomTop5(): Top5Def {
  return TOP5_BANK[Math.floor(Math.random() * TOP5_BANK.length)];
}
