import { DUCK_CATEGORIES } from "../../shared/duckCategories.js";
import type { DuckCategoryDef } from "../../shared/types.js";

// Una domanda di ACCHIAPPA LA PAPERA: esattamente 2 opzioni, con l'indice
// (0 o 1) di quella corretta DENTRO options, così com'è scritta qui sotto
// (nel file originale la risposta corretta è sempre la A, tranne un solo
// caso). L'ordine viene rimescolato a runtime (vedi shuffleDuckQuestions più
// sotto) prima di mostrarlo ai giocatori, altrimenti "è sempre la prima"
// diventerebbe presto ovvio e il minigioco perderebbe senso.
export interface DuckQuestionInternal {
  question: string;
  options: string[]; // esattamente 2
  correctIndex: number;
}

export interface DuckCategoryQuestions {
  categoryId: string; // DuckCategoryDef["id"], da shared/duckCategories.ts
  questions: DuckQuestionInternal[]; // esattamente 4
}

export const DUCK_QUESTION_SETS: DuckCategoryQuestions[] = [
  {
    categoryId: "animali-curriculum",
    questions: [
      {
        question: "Quale animale è stato sindaco onorario della cittadina di Talkeetna, in Alaska?",
        options: ["Un gatto", "Un cane"],
        correctIndex: 0,
      },
      {
        question:
          "Quale animale venne arruolato ufficialmente nell'esercito polacco durante la Seconda Guerra Mondiale?",
        options: ["Un orso", "Un lupo"],
        correctIndex: 0,
      },
      {
        question: 'Nella sede del Primo Ministro britannico, chi ricopre l\'incarico di "Chief Mouser"?',
        options: ["Un gatto", "Un cane"],
        correctIndex: 0,
      },
      {
        question: "Quale animale è stato utilizzato per consegnare messaggi durante entrambe le guerre mondiali?",
        options: ["Piccione viaggiatore", "Corvo"],
        correctIndex: 0,
      },
    ],
  },
  {
    categoryId: "errori-nobel",
    questions: [
      {
        question: "Quale invenzione nacque da una colla giudicata troppo debole?",
        options: ["Post-it", "Nastro biadesivo"],
        correctIndex: 0,
      },
      {
        question:
          "Quale alimento fu inventato da uno chef infastidito da un cliente che voleva la sua ordinazione più sottile?",
        options: ["Patatine", "Carote alla julienne"],
        correctIndex: 0,
      },
      {
        question: "Quale materiale fu scoperto mentre si cercava di creare un nuovo refrigerante?",
        options: ["Teflon", "Plexiglas"],
        correctIndex: 0,
      },
      {
        question: "Quale bevanda fu ideata inizialmente come tonico medicinale?",
        options: ["Coca-Cola", "Tè"],
        correctIndex: 0,
      },
    ],
  },
  {
    categoryId: "mondo-strano",
    questions: [
      {
        question: "Su quale isola giapponese i conigli sono più numerosi degli esseri umani?",
        options: ["Ōkunoshima", "Miyajima"],
        correctIndex: 0,
      },
      {
        question: "In quale Paese è vietato possedere un solo porcellino d'India?",
        options: ["Svizzera", "Norvegia"],
        correctIndex: 0,
      },
      {
        question: "Quale città tedesca ospita un semaforo con pulsanti dedicati ai sondaggi pubblici?",
        options: ["Hildesheim", "Dusseldorf"],
        correctIndex: 0,
      },
      {
        question: "Quale formaggio è spesso indicato come uno dei più odorosi al mondo?",
        options: ["Vieux Boulogne", "Camembert"],
        correctIndex: 0,
      },
    ],
  },
  {
    categoryId: "corpo-umano",
    questions: [
      {
        question: "Quale organo consuma più energia rispetto al proprio peso?",
        options: ["Cervello", "Fegato"],
        correctIndex: 0,
      },
      {
        question: "Quale parte del corpo possiede lo smalto, il tessuto più duro dell'organismo umano?",
        options: ["Denti", "Unghie"],
        correctIndex: 0,
      },
      {
        question: "Quale muscolo esercita la maggiore forza in rapporto alle sue dimensioni?",
        options: ["Massetere", "Sternocleidomastoideo"],
        correctIndex: 0,
      },
      {
        question: "Il nostro scheletro si rinnova completamente. Ma quanto tempo ci mette per farlo?",
        options: ["10 anni circa", "5 anni circa"],
        correctIndex: 0,
      },
    ],
  },
  {
    categoryId: "successo-davvero",
    questions: [
      {
        question:
          'Quale città australiana viene spesso colpita da "piogge" di piccoli pesci dopo forti temporali?',
        options: ["Lajamanu", "Perth"],
        correctIndex: 0,
      },
      {
        question: "Quale animale può sopravvivere più a lungo senza bere acqua?",
        options: ["Ratto canguro", "Bradipo americano"],
        correctIndex: 0,
      },
      {
        question: "Quale frutto galleggia naturalmente nell'acqua?",
        options: ["Mela", "Pesca"],
        correctIndex: 0,
      },
      {
        question: "Quale oggetto fu inventato da un dentista per far divertire i propri pazienti?",
        options: ["Zucchero filato", "Ghiacciolo"],
        correctIndex: 0,
      },
    ],
  },
  {
    categoryId: "animali-furbi",
    questions: [
      {
        question: "Quale animale è in grado di riconoscersi allo specchio?",
        options: ["Delfino", "Iguana"],
        correctIndex: 0,
      },
      {
        question: "Quale uccello è famoso per piegare dei rametti per estrarre insetti dagli alberi?",
        options: ["Corvo della Nuova Caledonia", "Picchio asiatico"],
        correctIndex: 0,
      },
      {
        question: "Quale animale riesce a imitare decine di suoni diversi, comprese le motoseghe?",
        options: ["Lira maggiore", "Tucano toco"],
        correctIndex: 0,
      },
      {
        question: "Quale animale addormenta le prede colpendole con un potente pugno?",
        options: ["Gambero mantide", "Aragosta blu"],
        correctIndex: 0,
      },
    ],
  },
  {
    categoryId: "invenzioni-assurde",
    questions: [
      {
        question: "Qual era lo scopo dietro all'invenzione dell'idromassaggio?",
        options: ["Alleviare l'artrite", "Allenare l'esercito"],
        correctIndex: 0,
      },
      {
        question: "Quale oggetto fu inventato per aiutare i marinai?",
        options: ["Gli occhiali con le aste", "Le lampadine a led"],
        correctIndex: 0,
      },
      {
        question: "Per quale scopo nacque originariamente il pluriball?",
        options: ["Carta da parati", "Pesca"],
        correctIndex: 0,
      },
      {
        question: "Quale gioco fu inventato per spiegare i danni del capitalismo sfrenato?",
        options: ["Monopoly", "Risiko!"],
        correctIndex: 0,
      },
    ],
  },
  {
    categoryId: "mondo-contrario",
    questions: [
      {
        question: "In quale Paese esiste un bancomat che distribuisce lingotti d'oro?",
        options: ["Emirati Arabi Uniti", "Svizzera"],
        correctIndex: 0,
      },
      {
        question: "In quale città si trova una fontana che serve vino gratuitamente durante tutto l'anno?",
        options: ["Caldari di Ortona", "Montepulciano"],
        correctIndex: 0,
      },
      {
        question: "Quale Paese utilizza ancora ufficialmente il calendario imperiale accanto a quello gregoriano?",
        options: ["Giappone", "Cina"],
        correctIndex: 0,
      },
      {
        question: "Quale capitale europea possiede una spiaggia balneabile in pieno centro città?",
        options: ["Vienna", "Berlino"],
        correctIndex: 0,
      },
    ],
  },
  {
    categoryId: "cervello-inganna",
    questions: [
      {
        question: "Quale colore viene ricordato più facilmente dalla maggior parte delle persone?",
        options: ["Rosso", "Giallo"],
        correctIndex: 0,
      },
      {
        question: "Quale numero viene scelto più spesso quando si chiede di dire un numero da 1 a 10?",
        options: ["7", "3"],
        correctIndex: 0,
      },
      {
        question: "Quale volto ricordiamo generalmente meglio dopo pochi secondi?",
        options: ["Un volto sorridente", "Un volto con gli occhiali"],
        correctIndex: 0,
      },
      {
        question: "Quale mano usano più frequentemente le persone quando mescolano le carte da gioco?",
        options: ["La destra", "La sinistra"],
        correctIndex: 0,
      },
    ],
  },
  {
    categoryId: "storie-strane",
    questions: [
      {
        question: "Quale presidente degli Stati Uniti teneva due cuccioli di alligatore alla Casa Bianca?",
        options: ["John Quincy Adams", "Ronald Reagan"],
        correctIndex: 0,
      },
      {
        question: "Quale famosa attrazione turistica fu originariamente costruita come struttura temporanea?",
        options: ["Torre Eiffel", "Statua della libertà"],
        correctIndex: 0,
      },
      {
        question: "Nel 1386 ad Aosta ci fu un curioso caso di condanna. Chi fu condannato?",
        options: ["Una scrofa", "Una persona deceduta 6 mesi prima"],
        correctIndex: 0,
      },
      {
        question: "Quale imperatore romano nominò console il proprio cavallo, almeno secondo le fonti antiche?",
        options: ["Caligola", "Nerone"],
        correctIndex: 0,
      },
    ],
  },
  {
    categoryId: "nomi-inventati",
    questions: [
      {
        question: "Quale città italiana esiste davvero?",
        options: ["Pievepelago", "Montefelice"],
        correctIndex: 0,
      },
      {
        question: 'Quale Stato degli USA possiede una città chiamata "Boring" (Noiosa)?',
        options: ["Oregon", "Nevada"],
        correctIndex: 0,
      },
      {
        question: 'Quale Paese ospita un villaggio chiamato "Batman"?',
        options: ["Turchia", "Romania"],
        correctIndex: 0,
      },
      {
        question: "Quale di queste località esiste davvero in Italia?",
        options: ["Sgurgola", "Strambonia"],
        correctIndex: 0,
      },
    ],
  },
  {
    categoryId: "spazio-testa",
    questions: [
      {
        question: "Su quale pianeta un giorno dura più di un anno?",
        options: ["Venere", "Mercurio"],
        correctIndex: 0,
      },
      {
        question: 'Quale pianeta ruota praticamente "sdraiato" rispetto agli altri?',
        options: ["Urano", "Nettuno"],
        correctIndex: 0,
      },
      {
        question: "Come si chiama il monte più alto del Sistema Solare?",
        options: ["Olympus Mons", "Monte Keplero"],
        correctIndex: 0,
      },
      {
        question: "Quale pianeta possiede il maggior numero di lune conosciute?",
        options: ["Saturno", "Giove"],
        correctIndex: 0,
      },
    ],
  },
  {
    categoryId: "cibi-bugie",
    questions: [
      {
        question: "Quale frutto appartiene alla famiglia delle rose?",
        options: ["Mela", "Banana"],
        correctIndex: 0,
      },
      {
        question: "Quale alimento contiene naturalmente più acqua?",
        options: ["Cetriolo", "Fico"],
        correctIndex: 0,
      },
      {
        question: "Quale spezia è ottenuta dagli stimmi di un fiore?",
        options: ["Zafferano", "Paprika"],
        correctIndex: 0,
      },
      {
        question: 'Quale frutto viene spesso chiamato "mela d\'ananas" in alcune lingue?',
        options: ["Ananas", "Mango"],
        correctIndex: 0,
      },
    ],
  },
  {
    categoryId: "guinness-inutili",
    questions: [
      {
        question: "Quale sportivo detiene il record di medaglie olimpiche vinte?",
        options: ["Michael Phelps", "Eileen Gu"],
        correctIndex: 0,
      },
      {
        question: "Qual è il mammifero terrestre più veloce del mondo?",
        options: ["Ghepardo", "Antilope saiga"],
        correctIndex: 0,
      },
      {
        question: "Quale albero è considerato il più alto al mondo attualmente conosciuto?",
        options: ["Hyperion", "General Sherman"],
        correctIndex: 0,
      },
      {
        question: "Quale animale possiede il cuore più grande del pianeta?",
        options: ["Balenottera azzurra", "Elefante africano"],
        correctIndex: 0,
      },
    ],
  },
  {
    categoryId: "lingue-impossibili",
    questions: [
      {
        question: 'In quale lingua il nome "Italia" si traduce come "Yidaly"?',
        options: ["Coreano", "Giapponese"],
        correctIndex: 0,
      },
      {
        question:
          "Esiste una lingua fischiata usata nelle isole Canarie per comunicare tra valli distanti. Come si chiama?",
        options: ["Silbo gomero", "Fischio canario"],
        correctIndex: 0,
      },
      {
        question: "La lingua basca (Euskara) ha una chiara parentela con le lingue romanze come l'italiano?",
        options: ["Sì", "No"],
        correctIndex: 1,
      },
      {
        question: "Quale Paese ha il maggior numero di lingue ufficiali?",
        options: ["Zimbabwe", "India"],
        correctIndex: 0,
      },
    ],
  },
  {
    categoryId: "record-natura",
    questions: [
      {
        question: "Quale animale possiede gli occhi più grandi in rapporto al corpo?",
        options: ["Calamaro gigante", "Struzzo"],
        correctIndex: 0,
      },
      {
        question: "Quale albero può vivere per migliaia di anni?",
        options: ["Pino loricato", "Pioppo nero"],
        correctIndex: 0,
      },
      {
        question: "Quale uccello migra per la distanza più lunga ogni anno?",
        options: ["Sterna artica", "Albatro reale"],
        correctIndex: 0,
      },
      {
        question: "Quale animale terrestre compie il salto più lungo in rapporto al proprio corpo?",
        options: ["Pulce", "Canguro"],
        correctIndex: 0,
      },
    ],
  },
  {
    categoryId: "chi-inventato",
    questions: [
      {
        question: "Chi inventò il tergicristallo moderno?",
        options: ["Una donna", "Un uomo"],
        correctIndex: 0,
      },
      {
        question: "Chi brevettò il cubo di Rubik?",
        options: ["Un architetto", "Un matematico"],
        correctIndex: 0,
      },
      {
        question: "Chi inventò il bikini moderno?",
        options: ["Un ingegnere automobilistico", "Uno stilista"],
        correctIndex: 0,
      },
      {
        question: "Quale invenzione usata in tutto il mondo non è mai stata brevettata?",
        options: ["La graffetta", "Il sigillo di garanzia dei tappi di plastica"],
        correctIndex: 0,
      },
    ],
  },
  {
    categoryId: "piu-antico",
    questions: [
      {
        question: "Quale animale esisteva già prima dei dinosauri?",
        options: ["Squalo", "Coccodrillo"],
        correctIndex: 0,
      },
      {
        question: "Quale alimento era già consumato oltre 5.000 anni fa?",
        options: ["Popcorn", "Mandarini"],
        correctIndex: 0,
      },
      {
        question: "Quale mezzo acquatico ha origini più antiche?",
        options: ["Canoa", "Barca a vela"],
        correctIndex: 0,
      },
      {
        question: "Quale bevanda è più antica?",
        options: ["Birra", "Tè"],
        correctIndex: 0,
      },
    ],
  },
  {
    categoryId: "stranezze-numeri",
    questions: [
      {
        question: "Quanti denti possiede normalmente una lumaca?",
        options: ["Più di 10.000", "Nessuno"],
        correctIndex: 0,
      },
      {
        question: "Quante zampe ha un gambero?",
        options: ["Dieci", "Otto"],
        correctIndex: 0,
      },
      {
        question: "Quante camere ha lo stomaco di una mucca?",
        options: ["Quattro", "Tre"],
        correctIndex: 0,
      },
      {
        question: "Quanti occhi ha un'ape?",
        options: ["Cinque", "Quattro"],
        correctIndex: 0,
      },
    ],
  },
  {
    categoryId: "luoghi-incredibili",
    questions: [
      {
        question: "In quale Paese si trova il deserto più arido del mondo?",
        options: ["Cile", "Mauritania"],
        correctIndex: 0,
      },
      {
        question: "Quale lago cambia naturalmente colore durante l'anno?",
        options: ["Lago Hillier", "Lago di Neims"],
        correctIndex: 0,
      },
      {
        question: "Quale capitale è attraversata da più ponti?",
        options: ["Venezia", "Praga"],
        correctIndex: 1,
      },
      {
        question: 'Dove si trova la "Porta dell\'Inferno", il cratere di gas in fiamme da decenni?',
        options: ["Turkmenistan", "Mongolia"],
        correctIndex: 0,
      },
    ],
  },
];

// I 9 premi nascosti dietro le celle della griglia finale: esattamente
// questi valori, rimescolati a runtime (vedi shuffleDuckPrizes più sotto).
export const DUCK_GRID_PRIZES = [500, 100, 100, 50, 50, 50, 50, 40, 40];

// Pesca una categoria a caso tra quelle non ancora giocate in questa
// partita. Se sono state usate tutte, ricomincia daccapo ignorando
// l'esclusione invece di bloccare il gioco (stesso pattern di
// pickRandomOchoCategory/pickRandomCategory).
export function pickRandomDuckCategory(
  excludedIds: ReadonlySet<string> = new Set()
): DuckCategoryDef {
  const fresh = DUCK_CATEGORIES.filter((c) => !excludedIds.has(c.id));
  const pool = fresh.length > 0 ? fresh : DUCK_CATEGORIES;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Ritorna le 4 domande (nell'ordine originale) della categoria indicata.
export function getDuckQuestions(categoryId: string): DuckQuestionInternal[] {
  const set = DUCK_QUESTION_SETS.find((s) => s.categoryId === categoryId);
  return set ? set.questions : [];
}

// Rimescola l'ordine delle 2 opzioni di OGNI domanda (Fisher-Yates su un
// array di 2 elementi = 50% di possibilità di scambio): nel file originale
// la risposta corretta è quasi sempre la prima, quindi senza rimescolare
// diventerebbe presto ovvio e il minigioco perderebbe di senso. Ritorna un
// nuovo array di domande, SENZA modificare i DuckQuestionInternal originali
// (che restano la fonte "canonica" e vengono rimescolati di nuovo a ogni
// pesca).
export function shuffleDuckQuestions(questions: DuckQuestionInternal[]): DuckQuestionInternal[] {
  return questions.map((q) => {
    const paired = q.options.map((text, i) => ({ text, isCorrect: i === q.correctIndex }));
    for (let i = paired.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [paired[i], paired[j]] = [paired[j], paired[i]];
    }
    return {
      question: q.question,
      options: paired.map((p) => p.text),
      correctIndex: paired.findIndex((p) => p.isCorrect),
    };
  });
}

// Rimescola l'ordine dei 9 premi della griglia finale (Fisher-Yates): deve
// essere pescata di nuovo a ogni accesso alla griglia, altrimenti il premio
// da 500 finirebbe sempre nella stessa casella.
export function shuffleDuckPrizes(): number[] {
  const prizes = [...DUCK_GRID_PRIZES];
  for (let i = prizes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [prizes[i], prizes[j]] = [prizes[j], prizes[i]];
  }
  return prizes;
}
