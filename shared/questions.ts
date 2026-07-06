import type { Question } from "./types.js";

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Qual è la capitale dell'Italia?",
    options: ["Milano", "Roma", "Napoli", "Firenze"],
    correctIndex: 1,
    category: "Geografia",
  },
  {
    id: 2,
    text: "In quale anno è caduto il muro di Berlino?",
    options: ["1987", "1989", "1991", "1993"],
    correctIndex: 1,
    category: "Storia",
  },
  {
    id: 3,
    text: "Quale pianeta è conosciuto come il 'pianeta rosso'?",
    options: ["Venere", "Giove", "Marte", "Saturno"],
    correctIndex: 2,
    category: "Scienza",
  },
  {
    id: 4,
    text: "Chi ha dipinto la Gioconda?",
    options: ["Michelangelo", "Raffaello", "Leonardo da Vinci", "Caravaggio"],
    correctIndex: 2,
    category: "Arte",
  },
  {
    id: 5,
    text: "Quale elemento chimico ha simbolo 'O'?",
    options: ["Oro", "Ossigeno", "Osmio", "Ottonio"],
    correctIndex: 1,
    category: "Scienza",
  },
  {
    id: 6,
    text: "Quanti giocatori ci sono in una squadra di calcio in campo?",
    options: ["9", "10", "11", "12"],
    correctIndex: 2,
    category: "Sport",
  },
  {
    id: 7,
    text: "Qual è il fiume più lungo d'Italia?",
    options: ["Arno", "Tevere", "Po", "Adige"],
    correctIndex: 2,
    category: "Geografia",
  },
  {
    id: 8,
    text: "Chi ha scritto 'I Promessi Sposi'?",
    options: ["Leopardi", "Manzoni", "Dante", "Pirandello"],
    correctIndex: 1,
    category: "Letteratura",
  },
  {
    id: 9,
    text: "Quale oceano bagna la costa orientale degli Stati Uniti?",
    options: ["Pacifico", "Indiano", "Atlantico", "Artico"],
    correctIndex: 2,
    category: "Geografia",
  },
  {
    id: 10,
    text: "Quanti continenti ci sono sulla Terra?",
    options: ["5", "6", "7", "8"],
    correctIndex: 2,
    category: "Geografia",
  },
  {
    id: 11,
    text: "In quale città si trova il Colosseo?",
    options: ["Atene", "Roma", "Istanbul", "Cartagine"],
    correctIndex: 1,
    category: "Storia",
  },
  {
    id: 12,
    text: "Qual è l'animale terrestre più veloce al mondo?",
    options: ["Leone", "Ghepardo", "Antilope", "Cavallo"],
    correctIndex: 1,
    category: "Natura",
  },
  {
    id: 13,
    text: "Quale strumento ha 88 tasti?",
    options: ["Chitarra", "Violino", "Pianoforte", "Flauto"],
    correctIndex: 2,
    category: "Musica",
  },
  {
    id: 14,
    text: "Chi inventò la lampadina (versione pratica e commerciale)?",
    options: ["Tesla", "Edison", "Bell", "Marconi"],
    correctIndex: 1,
    category: "Scienza",
  },
  {
    id: 15,
    text: "Quale paese ha vinto i Mondiali di calcio del 2006?",
    options: ["Francia", "Germania", "Italia", "Brasile"],
    correctIndex: 2,
    category: "Sport",
  },
  {
    id: 16,
    text: "Qual è la formula chimica dell'acqua?",
    options: ["CO2", "H2O", "NaCl", "O2"],
    correctIndex: 1,
    category: "Scienza",
  },
  {
    id: 17,
    text: "In quale opera compare il personaggio di Otello?",
    options: ["Rigoletto", "Otello", "Aida", "Tosca"],
    correctIndex: 1,
    category: "Musica",
  },
  {
    id: 18,
    text: "Quale organo del corpo umano pompa il sangue?",
    options: ["Polmoni", "Fegato", "Cuore", "Reni"],
    correctIndex: 2,
    category: "Scienza",
  },
  {
    id: 19,
    text: "Qual è la montagna più alta del mondo?",
    options: ["K2", "Mont Blanc", "Everest", "Kilimanjaro"],
    correctIndex: 2,
    category: "Geografia",
  },
  {
    id: 20,
    text: "Quanti lati ha un esagono?",
    options: ["5", "6", "7", "8"],
    correctIndex: 1,
    category: "Matematica",
  },
];

export function pickQuestions(count: number): Question[] {
  const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
