// Le domande del mondo "abisso" (TCT): quiz a tempo tutti-contro-tutti.
// Ogni domanda ha 4 opzioni; correctIndex NON viene mai inviato al client
// prima che la domanda si chiuda (vedi GameSession.resolveTctQuestion).
export interface TctQuestionInternal {
  id: string;
  category: string;
  question: string;
  options: string[]; // esattamente 4
  correctIndex: number;
}

export const TCT_DOMANDE: TctQuestionInternal[] = [
  // --- Animali ---
  {
    id: "tct-q1",
    category: "Animali",
    question: "Che animale è Garfield?",
    options: ["Gatto", "Cane", "Topo", "Procione"],
    correctIndex: 0,
  },
  {
    id: "tct-q2",
    category: "Animali",
    question: "Che animale è Yoghi?",
    options: ["Lupo", "Orso", "Volpe", "Procione"],
    correctIndex: 1,
  },
  {
    id: "tct-q3",
    category: "Animali",
    question: "Che animale è Dumbo?",
    options: ["Ippopotamo", "Rinoceronte", "Elefante", "Tapiro"],
    correctIndex: 2,
  },
  {
    id: "tct-q4",
    category: "Animali",
    question: "Qual è l'animale più grande della Terra?",
    options: ["Elefante africano", "Squalo balena", "Balena franca", "Balenottera azzurra"],
    correctIndex: 3,
  },
  {
    id: "tct-q5",
    category: "Animali",
    question: "Qual è l'animale più grande sulla terraferma?",
    options: ["Giraffa", "Elefante africano", "Rinoceronte bianco", "Ippopotamo"],
    correctIndex: 1,
  },
  {
    id: "tct-q6",
    category: "Animali",
    question: "Quale tra questi NON è un rettile?",
    options: ["Coccodrillo", "Iguana", "Salamandra", "Tartaruga"],
    correctIndex: 2,
  },
  {
    id: "tct-q7",
    category: "Animali",
    question: "Quale tra questi NON è un anfibio?",
    options: ["Rana", "Rospo", "Geco", "Salamandra"],
    correctIndex: 2,
  },
  {
    id: "tct-q8",
    category: "Animali",
    question: "Qual è l'uccello con l'apertura alare maggiore?",
    options: ["Condor delle Ande", "Albatro urlatore", "Aquila reale", "Pellicano"],
    correctIndex: 1,
  },

  // --- Geografia ---
  {
    id: "tct-q9",
    category: "Geografia",
    question: "Qual è la capitale dell'Irlanda?",
    options: ["Dublino", "Belfast", "Cork", "Edimburgo"],
    correctIndex: 0,
  },
  {
    id: "tct-q10",
    category: "Geografia",
    question: "Qual è la capitale dell'India?",
    options: ["Mumbai", "Nuova Delhi", "Calcutta", "Bangalore"],
    correctIndex: 1,
  },
  {
    id: "tct-q11",
    category: "Geografia",
    question: "Qual è la capitale dell'Australia?",
    options: ["Sydney", "Melbourne", "Canberra", "Perth"],
    correctIndex: 2,
  },
  {
    id: "tct-q12",
    category: "Geografia",
    question: "Qual è la capitale della Colombia?",
    options: ["Medellín", "Cali", "Cartagena", "Bogotá"],
    correctIndex: 3,
  },
  {
    id: "tct-q13",
    category: "Geografia",
    question: "Qual è la capitale del Senegal?",
    options: ["Dakar", "Abidjan", "Bamako", "Conakry"],
    correctIndex: 0,
  },
  {
    id: "tct-q14",
    category: "Geografia",
    question: "Qual è la capitale della Finlandia?",
    options: ["Oslo", "Helsinki", "Stoccolma", "Copenaghen"],
    correctIndex: 1,
  },
  {
    id: "tct-q15",
    category: "Geografia",
    question: "Qual è la capitale dell'Arabia Saudita?",
    options: ["Dubai", "Jeddah", "Riad", "Doha"],
    correctIndex: 2,
  },
  {
    id: "tct-q16",
    category: "Geografia",
    question: "Qual è la capitale del Marocco?",
    options: ["Casablanca", "Marrakech", "Tangeri", "Rabat"],
    correctIndex: 3,
  },

  // --- Scienze ---
  {
    id: "tct-q17",
    category: "Scienze",
    question: "Quale gruppo sanguigno può donare sangue a tutti?",
    options: ["0 negativo", "AB positivo", "A positivo", "B negativo"],
    correctIndex: 0,
  },
  {
    id: "tct-q18",
    category: "Scienze",
    question: "Quale condizione colora gli occhi di colore diverso tra loro?",
    options: ["Daltonismo", "Eterocromia", "Albinismo", "Glaucoma"],
    correctIndex: 1,
  },
  {
    id: "tct-q19",
    category: "Scienze",
    question: "Qual è la stella più vicina al Sistema Solare?",
    options: ["Alpha Centauri A", "Sirio", "Proxima Centauri", "Stella Polare"],
    correctIndex: 2,
  },
  {
    id: "tct-q20",
    category: "Scienze",
    question: "Qual è il pianeta più lontano dal Sole?",
    options: ["Plutone", "Urano", "Saturno", "Nettuno"],
    correctIndex: 3,
  },
  {
    id: "tct-q21",
    category: "Scienze",
    question: "Quale elemento chimico ha numero atomico 8?",
    options: ["Azoto", "Ossigeno", "Carbonio", "Fluoro"],
    correctIndex: 1,
  },
  {
    id: "tct-q22",
    category: "Scienze",
    question: "Qual è l'elemento più duro presente sulla Terra?",
    options: ["Titanio", "Quarzo", "Diamante", "Acciaio"],
    correctIndex: 2,
  },
  {
    id: "tct-q23",
    category: "Scienze",
    question: "Qual è il mammifero più grande della Terra?",
    options: ["Elefante africano", "Balenottera azzurra", "Balena franca", "Capodoglio"],
    correctIndex: 1,
  },
  {
    id: "tct-q24",
    category: "Scienze",
    question: "Quale di queste basi azotate NON appartiene al DNA?",
    options: ["Adenina", "Citosina", "Uracile", "Guanina"],
    correctIndex: 2,
  },

  // --- Serie TV ---
  {
    id: "tct-q25",
    category: "Serie TV",
    question: "In quale serie TV compare Jesse Pinkman?",
    options: ["Breaking Bad", "Better Call Saul", "The Wire", "Narcos"],
    correctIndex: 0,
  },
  {
    id: "tct-q26",
    category: "Serie TV",
    question: "In quale serie TV compare Tom Tucker?",
    options: ["I Simpson", "I Griffin", "American Dad", "South Park"],
    correctIndex: 1,
  },
  {
    id: "tct-q27",
    category: "Serie TV",
    question: "In quale serie TV compare Miranda Hobbes?",
    options: ["Friends", "Girls", "Sex and the City", "Gossip Girl"],
    correctIndex: 2,
  },
  {
    id: "tct-q28",
    category: "Serie TV",
    question: "In quale serie TV compare Jimmy McNulty?",
    options: ["Breaking Bad", "True Detective", "The Wire", "Chicago P.D."],
    correctIndex: 2,
  },
  {
    id: "tct-q29",
    category: "Serie TV",
    question: "In quale serie TV compare Rusty?",
    options: ["Naruto", "Dragon Ball", "One Piece", "Bleach"],
    correctIndex: 2,
  },
  {
    id: "tct-q30",
    category: "Serie TV",
    question: "In quale serie TV compare Montgomery Scott?",
    options: ["Star Wars", "Star Trek", "Battlestar Galactica", "Stargate"],
    correctIndex: 1,
  },
  {
    id: "tct-q31",
    category: "Serie TV",
    question: "In quale serie TV compare il Signor Heartland?",
    options: ["Yu-Gi-Oh!", "Yu-Gi-Oh! 5D's", "Yu-Gi-Oh! Zexal", "Beyblade"],
    correctIndex: 2,
  },
  {
    id: "tct-q32",
    category: "Serie TV",
    question: "In quale serie TV compare Dvalin?",
    options: ["Capitan Tsubasa", "Inazuma Eleven", "Holly e Benji", "Pokémon"],
    correctIndex: 1,
  },

  // --- Film ---
  {
    id: "tct-q33",
    category: "Film",
    question: "Quale film ha vinto l'Oscar come miglior film nel 2004?",
    options: [
      "Mystic River",
      "Il Signore degli Anelli - Il Ritorno del Re",
      "Master and Commander",
      "Seabiscuit",
    ],
    correctIndex: 1,
  },
  {
    id: "tct-q34",
    category: "Film",
    question: "Qual è stato il primo film italiano a vincere un Oscar?",
    options: ["Ladri di biciclette", "La Strada", "Sciuscià", "La vita è bella"],
    correctIndex: 2,
  },
  {
    id: "tct-q35",
    category: "Film",
    question: "Con quale film DiCaprio ha vinto l'Oscar come miglior attore?",
    options: ["Titanic", "The Wolf of Wall Street", "The Revenant - Redivivo", "Django Unchained"],
    correctIndex: 2,
  },
  {
    id: "tct-q36",
    category: "Film",
    question: "Quanti film di Star Wars sono usciti al cinema (aggiornato al 2026)?",
    options: ["9", "11", "12", "14"],
    correctIndex: 2,
  },

  // --- Storia ---
  {
    id: "tct-q37",
    category: "Storia",
    question: "Chi è stato l'ultimo re di Roma?",
    options: ["Romolo", "Numa Pompilio", "Servio Tullio", "Tarquinio il Superbo"],
    correctIndex: 3,
  },
  {
    id: "tct-q38",
    category: "Storia",
    question: "Quale tra queste è una delle 7 meraviglie del mondo antico?",
    options: ["Colosseo", "Muraglia Cinese", "Piramidi di Giza", "Machu Picchu"],
    correctIndex: 2,
  },
  {
    id: "tct-q39",
    category: "Storia",
    question: "Chi è stato l'ultimo imperatore cinese?",
    options: ["Kangxi", "Qianlong", "Guangxu", "Puyi"],
    correctIndex: 3,
  },

  // --- Musica ---
  {
    id: "tct-q40",
    category: "Musica",
    question: "Quale di queste è una canzone di Calcutta?",
    options: ["Riccione", "Rolls Royce", "Kiwi", "Weekend"],
    correctIndex: 2,
  },
  {
    id: "tct-q41",
    category: "Musica",
    question: "Quale di queste è una canzone dei Beatles?",
    options: ["Bohemian Rhapsody", "Hotel California", "Imagine", "Let It Be"],
    correctIndex: 3,
  },
  {
    id: "tct-q42",
    category: "Musica",
    question: "Quale di queste è una canzone dei Police?",
    options: ["Sweet Child O' Mine", "Sultans of Swing", "Money for Nothing", "Every Breath You Take"],
    correctIndex: 3,
  },
  {
    id: "tct-q43",
    category: "Musica",
    question: 'Chi canta la canzone "P.I.M.P."?',
    options: ["Snoop Dogg", "50 Cent", "Eminem", "Dr. Dre"],
    correctIndex: 1,
  },
  {
    id: "tct-q44",
    category: "Musica",
    question: 'Chi canta la canzone "Thrift Shop"?',
    options: ["Flo Rida", "Pitbull", "Macklemore & Ryan Lewis", "Mike Posner"],
    correctIndex: 2,
  },

  // --- Videogiochi ---
  {
    id: "tct-q45",
    category: "Videogiochi",
    question: "Quale videogioco ha come protagonista un buffo idraulico?",
    options: ["Super Mario", "Sonic the Hedgehog", "Rayman", "Crash Bandicoot"],
    correctIndex: 0,
  },
  {
    id: "tct-q46",
    category: "Videogiochi",
    question: 'Quale videogioco ti permette di esplorare "Los Santos"?',
    options: ["Watch Dogs 2", "Grand Theft Auto V", "Saints Row", "Sleeping Dogs"],
    correctIndex: 1,
  },
  {
    id: "tct-q47",
    category: "Videogiochi",
    question: "Quale videogioco ha tre gusci rossi tra gli oggetti consumabili?",
    options: ["Crash Team Racing", "Sonic & All-Stars Racing", "Mario Kart", "Diddy Kong Racing"],
    correctIndex: 2,
  },
  {
    id: "tct-q48",
    category: "Videogiochi",
    question: "Qual è il personaggio protagonista della serie Zelda?",
    options: ["Zelda", "Link", "Ganondorf", "Impa"],
    correctIndex: 1,
  },
  {
    id: "tct-q49",
    category: "Videogiochi",
    question: "Chi è il cattivo principale di Crash Bandicoot?",
    options: ["Doctor Eggman", "Bowser", "Doctor Neo Cortex", "King K. Rool"],
    correctIndex: 2,
  },
  {
    id: "tct-q50",
    category: "Videogiochi",
    question: "Qual è il videogioco preferito di Gino?",
    options: ["Kim Possible", "Jackie Chan Adventures", "Ben 10", "Avatar - La leggenda di Aang"],
    correctIndex: 1,
  },

  // --- Sport ---
  {
    id: "tct-q51",
    category: "Sport",
    question: 'Quale calciatore era soprannominato "El Niño"?',
    options: ["David Villa", "Fernando Torres", "Fernando Llorente", "Álvaro Morata"],
    correctIndex: 1,
  },
  {
    id: "tct-q52",
    category: "Sport",
    question: "Quale sport si gioca con una mazza e a cavallo?",
    options: ["Golf", "Cricket", "Polo", "Baseball"],
    correctIndex: 2,
  },
  {
    id: "tct-q53",
    category: "Sport",
    question: "Quale sport si gioca in un campo a forma di diamante?",
    options: ["Cricket", "Baseball", "Football americano", "Rugby"],
    correctIndex: 1,
  },
  {
    id: "tct-q54",
    category: "Sport",
    question: "Quale calciatore detiene il record di Palloni d'Oro vinti?",
    options: ["Cristiano Ronaldo", "Michel Platini", "Lionel Messi", "Johan Cruijff"],
    correctIndex: 2,
  },
  {
    id: "tct-q55",
    category: "Sport",
    question: 'Quale squadra gioca allo stadio "Diego Armando Maradona"?',
    options: ["Boca Juniors", "Roma", "Napoli", "Inter"],
    correctIndex: 2,
  },
  {
    id: "tct-q56",
    category: "Sport",
    question: "A quale sport giocano i Los Angeles Clippers?",
    options: ["Football americano", "Baseball", "Basket", "Hockey su ghiaccio"],
    correctIndex: 2,
  },
];

// Pesca `count` domande diverse tra loro, escludendo quelle già uscite in
// questa partita (vedi GameSession.playedTctQuestionIds). Se il mazzo
// disponibile scende sotto `count`, si ricomincia ignorando l'esclusione
// (mazzo esaurito) invece di bloccare il gioco.
export function pickRandomTctQuestions(
  count: number,
  excludedIds: ReadonlySet<string>
): TctQuestionInternal[] {
  let pool = TCT_DOMANDE.filter((q) => !excludedIds.has(q.id));
  if (pool.length < count) pool = TCT_DOMANDE;
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}
