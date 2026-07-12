import type { Top5Def } from "../../shared/types.js";

export const TOP5_BANK: Top5Def[] = [
  {
    id: "top5-animali-case-mondo",
    title: "Animali più presenti nelle case (nel mondo)",
    answers: ["Gatti", "Cani", "Pesci", "Roditori (criceti, conigli, ecc.)", "Uccelli"],
    source: "Stime globali sul possesso di animali domestici (Spiegato.com e altre fonti comparate)",
  },
  {
    id: "top5-razze-cane-mondo",
    title: "Razze di cane più diffuse nel mondo",
    answers: ["Bulldog Francese", "Labrador Retriever", "Golden Retriever", "Pastore Tedesco", "Barboncino"],
    source: "American Kennel Club (AKC), classifica 2023",
  },
  {
    id: "top5-nazioni-rateo-pet",
    title: "Nazioni con rateo animali domestici per famiglia più alto",
    answers: ["Ungheria", "Italia", "Francia", "Germania", "Spagna"],
    source: "Indagine GfK/Censis su 22 Paesi, riportata da MyPersonalTrainer",
  },
  {
    id: "top5-animali-cucinati",
    title: "Animali più cucinati al mondo",
    answers: ["Pollo", "Maiale", "Manzo", "Pecora", "Capra"],
    source: "OCSE-FAO (Organizzazione per la Cooperazione e lo Sviluppo Economico / FAO)",
  },
  {
    id: "top5-animali-italia",
    title: "Animali più presenti in Italia",
    answers: ["Pesci", "Gatti", "Cani", "Uccelli", "Rettili e anfibi"],
    source: "Rapporto Assalco-Zoomark 2026",
  },
  {
    id: "top5-animali-zoo",
    title: "Animali più presenti negli zoo",
    answers: ["Leoni", "Elefanti", "Giraffe", "Tigri", "Scimmie/Primati"],
    source:
      "Non esiste una classifica statistica ufficiale unica: elenco basato sul consenso comune tra le principali guide di zoo nel mondo",
  },
];

export function pickRandomTop5(): Top5Def {
  return TOP5_BANK[Math.floor(Math.random() * TOP5_BANK.length)];
}
