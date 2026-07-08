import type { QuizQuestion } from "../../shared/types.js";

// Domande di esempio: sostituiscile/ampliale liberamente.
// correctIndex è tenuto separato dal tipo QuizQuestion "pubblico" perché
// non deve mai essere inviato al client prima della risposta.
export interface QuizQuestionInternal extends QuizQuestion {
  correctIndex: number;
}

export const QUESTION_BANK: QuizQuestionInternal[] = [
  {
    id: "q1",
    category: "Cultura generale",
    question: "Qual è la capitale dell'Australia?",
    options: ["Sydney", "Melbourne", "Canberra", "Perth"],
    correctIndex: 2,
    timeLimitSec: 20,
  },
  {
    id: "q2",
    category: "Storia",
    question: "In che anno è caduto il Muro di Berlino?",
    options: ["1987", "1989", "1991", "1993"],
    correctIndex: 1,
    timeLimitSec: 20,
  },
  {
    id: "q3",
    category: "Scienza",
    question: "Qual è l'elemento chimico con simbolo 'Fe'?",
    options: ["Fluoro", "Ferro", "Francio", "Fermio"],
    correctIndex: 1,
    timeLimitSec: 15,
  },
  {
    id: "q4",
    category: "Cinema",
    question: "Chi ha diretto 'Il Padrino'?",
    options: [
      "Martin Scorsese",
      "Francis Ford Coppola",
      "Stanley Kubrick",
      "Sergio Leone",
    ],
    correctIndex: 1,
    timeLimitSec: 20,
  },
  {
    id: "q5",
    category: "Geografia",
    question: "Qual è il fiume più lungo del mondo?",
    options: ["Nilo", "Rio delle Amazzoni", "Yangtze", "Mississippi"],
    correctIndex: 1,
    timeLimitSec: 20,
  },
  {
    id: "q6",
    category: "Sport",
    question: "Quante squadre partecipano a un Mondiale FIFA (dal 2026)?",
    options: ["24", "32", "48", "64"],
    correctIndex: 2,
    timeLimitSec: 15,
  },
  {
    id: "q7",
    category: "Musica",
    question: "Quale strumento ha tipicamente 88 tasti?",
    options: ["Organo", "Pianoforte", "Fisarmonica", "Clavicembalo"],
    correctIndex: 1,
    timeLimitSec: 15,
  },
  {
    id: "q8",
    category: "Arte",
    question: "Chi ha dipinto 'La nascita di Venere'?",
    options: ["Leonardo da Vinci", "Raffaello", "Botticelli", "Michelangelo"],
    correctIndex: 2,
    timeLimitSec: 20,
  },
  {
    id: "q9",
    category: "Natura",
    question: "Qual è l'animale terrestre più veloce?",
    options: ["Leone", "Ghepardo", "Gazzella", "Struzzo"],
    correctIndex: 1,
    timeLimitSec: 15,
  },
  {
    id: "q10",
    category: "Cultura generale",
    question: "Quante sono le corde di una chitarra classica?",
    options: ["4", "5", "6", "7"],
    correctIndex: 2,
    timeLimitSec: 15,
  },
];

export function pickRandomQuestion(): QuizQuestionInternal {
  return QUESTION_BANK[Math.floor(Math.random() * QUESTION_BANK.length)];
}
