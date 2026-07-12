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
  {
    id: "top5-altitudine-media",
    title: "Nazioni con l'altezza media dal livello del mare più alta",
    answers: ["Bhutan", "Nepal", "Lesotho", "Andorra", "Afghanistan"],
    source: "Dati comparati sull'altitudine media nazionale (World Atlas / Ripley's Believe It or Not)",
  },
  {
    id: "top5-nazioni-popolose",
    title: "Nazioni più popolose",
    answers: ["India", "Cina", "Stati Uniti", "Indonesia", "Pakistan"],
    source: "ONU – World Population Prospects, dati aggiornati al 2026 (via Worldometer)",
  },
  {
    id: "top5-qi-alto",
    title: "Nazioni con il QI più alto",
    answers: ["Giappone", "Taiwan", "Singapore", "Hong Kong", "Cina"],
    source:
      "Dataset Lynn & Vanhanen — metodologia ampiamente contestata dalla comunità scientifica per campioni non rappresentativi: da prendere con le pinze",
  },
  {
    id: "top5-pene-grande",
    title: "Nazioni con il pene più grande",
    answers: ["Ecuador", "Camerun", "Bolivia", "Sudan", "Haiti"],
    source:
      "Mappa virale ripresa da Daily Mail/World Data — dati in gran parte autodichiarati e non verificabili in modo indipendente: puro intrattenimento, non prendetela sul serio",
  },
  {
    id: "top5-seno-grosso",
    title: "Nazioni con il seno più grosso",
    answers: ["Russia", "Finlandia", "Svezia", "Norvegia", "Germania"],
    source:
      "Mappa virale di TargetMap.com — dati aneddotici e non verificabili: puro intrattenimento, non prendetela sul serio",
  },
  {
    id: "top5-fiumi-lunghi",
    title: "Fiumi più lunghi",
    answers: ["Nilo", "Rio delle Amazzoni", "Fiume Azzurro (Yangtze)", "Mississippi-Missouri", "Fiume Giallo (Huang He)"],
    source:
      "Classifica tradizionale (Guinness dei Primati/Enciclopedia Britannica); nota: è in corso un dibattito scientifico su chi sia davvero il più lungo tra Nilo e Rio delle Amazzoni",
  },
];

export function pickRandomTop5(): Top5Def {
  return TOP5_BANK[Math.floor(Math.random() * TOP5_BANK.length)];
}
