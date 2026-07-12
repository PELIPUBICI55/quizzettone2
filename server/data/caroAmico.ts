import type { CaroAmicoDomandaDef, CaroAmicoPersonaDef } from "../../shared/types.js";
import { CARO_AMICO_PERSONE } from "../../shared/caroAmicoPersone.js";

// Le 23 domande del mondo "officina" (CARO AMICO TI SCRIVO), con la risposta
// vera di ciascuna delle 7 persone. La stessa domanda può uscire per
// qualunque persona: cambia solo quale risposta è quella "giusta".
export const CARO_AMICO_DOMANDE: CaroAmicoDomandaDef[] = [
  {
    id: "ca-q1",
    question: "Qual è il tuo anime preferito?",
    answers: {
      frost: "Haikyuu",
      venni: "Akame ga Kill",
      slander: "Love Live",
      checky: "One Piece",
      glitch: "Hunter x Hunter",
      sheren: "Monogatari",
      davide: "Hunter x Hunter",
    },
  },
  {
    id: "ca-q2",
    question: "Qual è la tua macchina dei sogni?",
    answers: {
      frost: "Cross-Hybrid",
      venni: "Toyota Pickup",
      slander: "Mazda Miata",
      checky: "Lamborghini",
      glitch: "Toyota Supra",
      sheren: "Lamborghini",
      davide: "Lamborghini",
    },
  },
  {
    id: "ca-q3",
    question: "Qual è la tua vacanza dei sogni?",
    answers: {
      frost: "Giappone",
      venni: "Giappone",
      slander: "Scozia",
      checky: "Giappone",
      glitch: "Giappone",
      sheren: "Giappone",
      davide: "Islanda",
    },
  },
  {
    id: "ca-q4",
    question: "Qual è la tua compagnia aerea preferita?",
    answers: {
      frost: "ITA Airways",
      venni: "Ryanair",
      slander: "Lufthansa",
      checky: "Ryanair",
      glitch: "China Airlines",
      sheren: "Ryanair",
      davide: "Wizz Air",
    },
  },
  {
    id: "ca-q5",
    question: "Qual è il tuo superpotere preferito?",
    answers: {
      frost: "Supervelocità",
      venni: "Volare",
      slander: "Telecinesi",
      checky: "Leggere la mente",
      glitch: "Supervelocità",
      sheren: "Teletrasporto",
      davide: "Superforza",
    },
  },
  {
    id: "ca-q6",
    question: "Qual è il tuo cibo preferito?",
    answers: {
      frost: "Melanzane alla parmigiana",
      venni: "Pizza",
      slander: "Lasagna",
      checky: "Fiorentina",
      glitch: "Noodles",
      sheren: "Polpette di patate",
      davide: "Pitta di patate salentina",
    },
  },
  {
    id: "ca-q7",
    question: "In quale epoca vorresti vivere?",
    answers: {
      frost: "Anni 60-80",
      venni: "Epoca attuale",
      slander: "Epoca attuale",
      checky: "Romanticismo (1800)",
      glitch: "800 d.C.",
      sheren: "Epoca attuale",
      davide: "Epoca attuale",
    },
  },
  {
    id: "ca-q8",
    question: "Qual è il tuo film preferito?",
    answers: {
      frost: "Dragon Trainer 2",
      venni: "Il Signore degli Anelli",
      slander: "Il Re Leone",
      checky: "Le cronache di Narnia",
      glitch: "Interstellar",
      sheren: "Harry Potter",
      davide: "Porco Rosso",
    },
  },
  {
    id: "ca-q9",
    question: "Qual è la tua stagione preferita?",
    answers: {
      frost: "Inverno",
      venni: "Autunno",
      slander: "Inverno",
      checky: "Primavera",
      glitch: "Primavera",
      sheren: "Autunno",
      davide: "Primavera",
    },
  },
  {
    id: "ca-q10",
    question: "Qual è il mezzo di trasporto migliore?",
    answers: {
      frost: "Macchina",
      venni: "Macchina",
      slander: "Treno",
      checky: "Macchina",
      glitch: "Aereo",
      sheren: "Macchina",
      davide: "Auto",
    },
  },
  {
    id: "ca-q11",
    question: "Qual è il tuo sport preferito?",
    answers: {
      frost: "Pallavolo",
      venni: "Calcio",
      slander: "Kendo",
      checky: "Pallavolo",
      glitch: "Basket",
      sheren: "Ginnastica artistica",
      davide: "Pallavolo",
    },
  },
  {
    id: "ca-q12",
    question: "Qual è l'invenzione più importante della storia?",
    answers: {
      frost: "Telefono",
      venni: "Corrente elettrica",
      slander: "Transistor",
      checky: "Stampa",
      glitch: "Fuoco",
      sheren: "Telefono",
      davide: "Internet",
    },
  },
  {
    id: "ca-q13",
    question: "Qual è la tua materia scolastica preferita?",
    answers: {
      frost: "Storia",
      venni: "Storia",
      slander: "Informatica",
      checky: "Inglese",
      glitch: "Scienze",
      sheren: "Italiano",
      davide: "Educazione fisica",
    },
  },
  {
    id: "ca-q14",
    question: "Qual è il tuo colore preferito?",
    answers: {
      frost: "Rosso",
      venni: "Verde",
      slander: "Lilla",
      checky: "Verde",
      glitch: "Viola",
      sheren: "Viola",
      davide: "Azzurro e rosso",
    },
  },
  {
    id: "ca-q15",
    question: "Qual è il tuo animale preferito?",
    answers: {
      frost: "Tartaruga",
      venni: "Gatto",
      slander: "Gatto",
      checky: "Gatto",
      glitch: "Panda rosso",
      sheren: "Merlo",
      davide: "Cane",
    },
  },
  {
    id: "ca-q16",
    question: "Qual è il tuo videogioco preferito?",
    answers: {
      frost: "Pokémon Zaffiro",
      venni: "Total War: Warhammer",
      slander: "Monster Hunter",
      checky: "Pokémon",
      glitch: "Hunter x Hunter: Nen x Impact",
      sheren: "Paladins",
      davide: "Pokémon Zaffiro",
    },
  },
  {
    id: "ca-q17",
    question: "Qual è il tuo frutto preferito?",
    answers: {
      frost: "Mela",
      venni: "Mandarino",
      slander: "Noci",
      checky: "Fico d'India",
      glitch: "Mango",
      sheren: "Mandarancio",
      davide: "Anguria",
    },
  },
  {
    id: "ca-q18",
    question: "Qual è la lingua più bella?",
    answers: {
      frost: "Spagnolo",
      venni: "Italiano",
      slander: "Giapponese",
      checky: "Italiano",
      glitch: "Cinese",
      sheren: "Francese",
      davide: "Italiano",
    },
  },
  {
    id: "ca-q19",
    question: "Qual è la tua città preferita?",
    answers: {
      frost: "Firenze",
      venni: "Firenze",
      slander: "Gaeta",
      checky: "Firenze",
      glitch: "Shanghai",
      sheren: "Bordeaux",
      davide: "Boh, forse una che deve ancora visitare",
    },
  },
  {
    id: "ca-q20",
    question: "Qual è il tuo gioco da tavolo preferito?",
    answers: {
      frost: "Hitster",
      venni: "Risiko",
      slander: "Bang!",
      checky: "Scala 40",
      glitch: "Uno",
      sheren: "Monopoly",
      davide: "Non ne ha uno",
    },
  },
  {
    id: "ca-q21",
    question: "Qual è il tuo giorno della settimana preferito?",
    answers: {
      frost: "Mercoledì",
      venni: "Venerdì",
      slander: "Mercoledì",
      checky: "Venerdì",
      glitch: "Sabato",
      sheren: "Venerdì",
      davide: "Venerdì",
    },
  },
  {
    id: "ca-q22",
    question: "Qual è il tuo supereroe preferito?",
    answers: {
      frost: "Spider-Man",
      venni: "Iron Man",
      slander: "Spider-Man",
      checky: "Black Widow",
      glitch: "Spider-Man",
      sheren: "Batman",
      davide: "Spider-Man",
    },
  },
  {
    id: "ca-q23",
    question: "Qual è il tuo strumento musicale preferito?",
    answers: {
      frost: "Pianoforte",
      venni: "Chitarra",
      slander: "Chitarra",
      checky: "Pianoforte",
      glitch: "Pianoforte",
      sheren: "Basso",
      davide: "Batteria",
    },
  },
];

// Pesca una persona a caso, escludendo quella che il giocatore ha indicato
// come "sé stesso" (così non gli capita mai una domanda di cui conosce già
// la risposta). Se per qualche motivo il pool si svuota, ricade su tutte.
export function pickRandomPersonaExcluding(excludeId: string | null): CaroAmicoPersonaDef {
  const pool = excludeId
    ? CARO_AMICO_PERSONE.filter((p) => p.id !== excludeId)
    : CARO_AMICO_PERSONE;
  const finalPool = pool.length > 0 ? pool : CARO_AMICO_PERSONE;
  return finalPool[Math.floor(Math.random() * finalPool.length)];
}

export function pickRandomDomanda(): CaroAmicoDomandaDef {
  return CARO_AMICO_DOMANDE[Math.floor(Math.random() * CARO_AMICO_DOMANDE.length)];
}
