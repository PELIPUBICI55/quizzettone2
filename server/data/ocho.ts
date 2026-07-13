import type { OchoCategoryDef } from "../../shared/types.js";
import { OCHO_CATEGORIES } from "../../shared/ochoCategories.js";

// Un "gioco" di OCHO ALLA BOMBA: 9 risposte, di cui esattamente una è la
// bomba (nel file originale segnata come "SCOSSA"/"LA SCOSSA"). bombIndex è
// l'indice di quella risposta DENTRO answers, così com'è scritta qui sotto
// (nel file di partenza la bomba è sempre l'ultima delle 9, ma la teniamo
// esplicita per ogni entry per sicurezza). L'ordine viene rimescolato a
// runtime (vedi shuffleOchoGame più sotto) prima di mostrarlo ai giocatori,
// altrimenti "è sempre l'ultima" diventerebbe presto ovvio e il gioco
// perderebbe senso.
export interface OchoGameInternal {
  id: string;
  categoryId: string;
  prompt: string;
  answers: string[]; // esattamente 9
  bombIndex: number;
}

export const OCHO_GAMES: OchoGameInternal[] = [
  // --- ANIMALI ---
  {
    id: "ocho-animali-uccelli-volano",
    categoryId: "animali",
    prompt: "Uno di questi uccelli sa volare:",
    answers: ["Struzzo", "Emù", "Casuario", "Kiwi", "Pinguino", "Nandù", "Kakapo", "Takahe", "Gallina"],
    bombIndex: 8,
  },
  {
    id: "ocho-animali-panthera",
    categoryId: "animali",
    prompt: "Uno di questi animali non appartiene al genere panthera:",
    answers: [
      "Leone",
      "Tigre",
      "Leopardo",
      "Giaguaro",
      "Leopardo delle nevi",
      "Leone asiatico",
      "Tigre siberiana",
      "Pantera nera",
      "Ghepardo",
    ],
    bombIndex: 8,
  },
  {
    id: "ocho-animali-letargo",
    categoryId: "animali",
    prompt: "Uno di questi animali non va in letargo:",
    answers: [
      "Orso bruno",
      "Ghiro",
      "Riccio",
      "Marmotta",
      "Tasso",
      "Pipistrello",
      "Criceto",
      "Tartaruga di terra",
      "Lupo",
    ],
    bombIndex: 8,
  },
  {
    id: "ocho-animali-velenosi",
    categoryId: "animali",
    prompt: "Uno di questi animali non è velenoso:",
    answers: [
      "Cobra reale",
      "Vipera comune",
      "Scorpione giallo",
      "Ornitorinco (maschio)",
      "Dendrobate (rana freccia)",
      "Ragno violino",
      "Medusa vespa di mare",
      "Serpente corallo",
      "Rana toro",
    ],
    bombIndex: 8,
  },

  // --- GEOGRAFIA ---
  {
    id: "ocho-geografia-intercontinentali",
    categoryId: "geografia",
    prompt: "Uno di questi stati non è intercontinentale:",
    answers: [
      "Turchia",
      "Russia",
      "Egitto",
      "Kazakistan",
      "Azerbaigian",
      "Georgia",
      "Indonesia",
      "Panama",
      "Spagna",
    ],
    bombIndex: 8,
  },
  {
    id: "ocho-geografia-atlantico",
    categoryId: "geografia",
    prompt: "Tutti questi stati hanno sbocco sul mare solo tramite l'oceano atlantico, tranne uno:",
    answers: [
      "Portogallo",
      "Irlanda",
      "Islanda",
      "Capo Verde",
      "Bahamas",
      "Barbados",
      "Guinea-Bissau",
      "Liberia",
      "Seychelles",
    ],
    bombIndex: 8,
  },
  {
    id: "ocho-geografia-equatore",
    categoryId: "geografia",
    prompt: "Uno di questi stati non è attraversato dall'equatore:",
    answers: [
      "Ecuador",
      "Brasile",
      "Gabon",
      "Repubblica del Congo",
      "Repubblica Democratica del Congo",
      "Uganda",
      "Kenya",
      "Indonesia",
      "Tanzania",
    ],
    bombIndex: 8,
  },
  {
    id: "ocho-geografia-g20",
    categoryId: "geografia",
    prompt: "Uno tra questi stati non è membro ufficiale del g20:",
    answers: [
      "Canada",
      "Francia",
      "Germania",
      "Italia",
      "Giappone",
      "Regno Unito",
      "Stati Uniti",
      "Russia",
      "Spagna",
    ],
    bombIndex: 8,
  },

  // --- SCIENZE ---
  {
    id: "ocho-scienze-atmosfera",
    categoryId: "scienze",
    prompt: "Uno di questi elementi non è presente nell'atmosfera terrestre:",
    answers: ["Azoto", "Ossigeno", "Argon", "Anidride carbonica", "Neon", "Elio", "Metano", "Kripton", "Cloro"],
    bombIndex: 8,
  },
  {
    id: "ocho-scienze-alcalini",
    categoryId: "scienze",
    prompt: "Uno di questi non è un metallo alcalino:",
    answers: ["Litio", "Sodio", "Potassio", "Rubidio", "Cesio", "Francio", "Idrogeno", "Berillio", "Magnesio"],
    bombIndex: 8,
  },
  {
    id: "ocho-scienze-teoremi",
    categoryId: "scienze",
    prompt: "Uno di questi non è un teorema di analisi matematica:",
    answers: [
      "Teorema di Rolle",
      "Teorema di Cauchy",
      "Teorema di Weierstrass",
      "Teorema di Bolzano",
      "Teorema di Gauss",
      "Teorema di Stokes",
      "Teorema dei Carabinieri",
      "Teorema di Lagrange",
      "Teorema di Euclide",
    ],
    bombIndex: 8,
  },
  {
    id: "ocho-scienze-schede-video",
    categoryId: "scienze",
    prompt: "Uno di questi non è un produttore di schede video:",
    answers: ["NVIDIA", "AMD", "ASUS", "MSI", "Gigabyte", "EVGA", "Zotac", "Sapphire", "Logitech"],
    bombIndex: 8,
  },

  // --- SERIE TV ---
  {
    id: "ocho-serietv-brooklyn99",
    categoryId: "serietv",
    prompt: "Uno di questi non è un personaggio di Brooklyn 99:",
    answers: [
      "Jake Peralta",
      "Amy Santiago",
      "Raymond Holt",
      "Charles Boyle",
      "Rosa Diaz",
      "Terry Jeffords",
      "Gina Linetti",
      "Hitchcock",
      "Lisa Welsch",
    ],
    bombIndex: 8,
  },
  {
    id: "ocho-serietv-rickandmorty",
    categoryId: "serietv",
    prompt: "Uno di questi non è un luogo di Rick and Morty:",
    answers: [
      "Dimensione C-137",
      "Cittadella dei Rick",
      "Pianeta Squanch",
      "Microverso",
      "Gazorpazorp",
      "Purge Planet",
      "Nuova Canberra",
      "Froopyland",
      "Pianeta Tribale",
    ],
    bombIndex: 8,
  },
  {
    id: "ocho-serietv-springfield",
    categoryId: "serietv",
    prompt: "Una di queste non è una famiglia di Springfield:",
    answers: [
      "Famiglia Simpson",
      "Famiglia Flanders",
      "Famiglia Van Houten",
      "Famiglia Wiggum",
      "Famiglia Hibbert",
      "Famiglia Lovejoy",
      "Famiglia Prince",
      "Famiglia Brockman",
      "Famiglia McKirk",
    ],
    bombIndex: 8,
  },
  {
    id: "ocho-serietv-breakingbad",
    categoryId: "serietv",
    prompt: "Uno di questi non è un membro del cartello in Breaking Bad / Better Call Saul:",
    answers: [
      "Tuco",
      "Hector",
      "Lalo",
      "Juan Bolsa",
      "Don Eladio",
      "Gus Fring",
      "Nacho Varga",
      "Victor",
      "Miguel",
    ],
    bombIndex: 8,
  },

  // --- FILM ---
  {
    id: "ocho-film-jurassicpark",
    categoryId: "film",
    prompt: "Uno di questi non compare in nessun Jurassic Park:",
    answers: [
      "Alan Grant",
      "Ellie Sattler",
      "Ian Malcolm",
      "John Hammond",
      "Robert Muldoon",
      "Dennis Nedry",
      "Tim Murphy",
      "Lex Murphy",
      "Timothy Hammond",
    ],
    bombIndex: 8,
  },
  {
    id: "ocho-film-ritornoalfuturo",
    categoryId: "film",
    prompt: "Uno di questi non compare in nessun Ritorno al Futuro:",
    answers: ["Marty", "Doc", "Biff", "Lorraine", "George", "Jennifer", "Einstein", "Strickland", "Scott"],
    bombIndex: 8,
  },

  // --- STORIA ---
  {
    id: "ocho-storia-dinastie-cinesi",
    categoryId: "storia",
    prompt: "Una di queste non è una dinastia imperiale cinese:",
    answers: [
      "Dinastia Qin",
      "Dinastia Han",
      "Dinastia Tang",
      "Dinastia Song",
      "Dinastia Yuan",
      "Dinastia Ming",
      "Dinastia Qing",
      "Dinastia Sui",
      "Dinastia Wang",
    ],
    bombIndex: 8,
  },
  {
    id: "ocho-storia-interventi-usa",
    categoryId: "storia",
    prompt: "Una tra queste nazioni interessata da interventi militari statunitensi:",
    answers: [
      "Panama",
      "Grenada",
      "Iraq",
      "Afghanistan",
      "Vietnam",
      "Repubblica Dominicana",
      "Haiti",
      "Libia",
      "Jamaica",
    ],
    bombIndex: 8,
  },

  // --- MUSICA ---
  {
    id: "ocho-musica-beatles",
    categoryId: "musica",
    prompt: "Uno tra questi non è stato un componente o collaboratore dei Beatles:",
    answers: [
      "John Lennon",
      "Paul McCartney",
      "George Harrison",
      "Ringo Starr",
      "George Martin",
      "Billy Preston",
      "Brian Epstein",
      "Pete Best",
      "Jerry Lewis",
    ],
    bombIndex: 8,
  },
  {
    id: "ocho-musica-ligabue",
    categoryId: "musica",
    prompt: "Uno di questi non è un album di Luciano Ligabue:",
    answers: [
      "Ligabue",
      "Lambrusco coltelli rose & popcorn",
      "Buonanotte all'Italia",
      "Buon compleanno Elvis",
      "Su e giù da un palco",
      "Miss Mondo",
      "Nome e cognome",
      "Arrivederci, mostro!",
      "Apriti cielo",
    ],
    bombIndex: 8,
  },

  // --- VIDEOGIOCHI ---
  {
    id: "ocho-videogiochi-zelda",
    categoryId: "videogiochi",
    prompt: "Uno di questi non è un gioco della serie di Zelda:",
    answers: [
      "Ocarina of Time",
      "Majora's Mask",
      "The Wind Waker",
      "Twilight Princess",
      "Skyward Sword",
      "Breath of the Wild",
      "Tears of the Kingdom",
      "A Link to the Past",
      "Echoes of the Forgotten Realm",
    ],
    bombIndex: 8,
  },
  {
    id: "ocho-videogiochi-hearthstone",
    categoryId: "videogiochi",
    prompt: "Una tra queste non è un espansione o avventura di Hearthstone:",
    answers: [
      "Naxxramas",
      "Goblins vs Gnomes",
      "Blackrock Mountain",
      "The Grand Tournament",
      "League of Explorers",
      "Whispers of the Old Gods",
      "Knights of the Frozen Throne",
      "Kobolds & Catacombs",
      "Shadows of the Azeroth Kingdom",
    ],
    bombIndex: 8,
  },

  // --- SPORT ---
  {
    id: "ocho-sport-goldenboy",
    categoryId: "sport",
    prompt: "Uno di questi calciatori ha vinto il premio di Golden Boy al torneo di Viareggio:",
    answers: [
      "Alessandro Del Piero",
      "Francesco Totti",
      "Andrea Pirlo",
      "Gennaro Gattuso",
      "Paolo Maldini",
      "Giuseppe Rossi",
      "Mario Balotelli",
      "Daniele De Rossi",
      "Ciro Immobile",
    ],
    bombIndex: 8,
  },
  {
    id: "ocho-sport-scacchi",
    categoryId: "sport",
    prompt: "Uno tra questi non è mai stato Campione del Mondo di scacchi:",
    answers: [
      "Magnus Carlsen",
      "Emanuel Lasker",
      "José Raúl Capablanca",
      "Aleksandr Alechin",
      "Michail Botvinnik",
      "Bobby Fischer",
      "Anatolij Karpov",
      "Garry Kasparov",
      "Fabiano Caruana",
    ],
    bombIndex: 8,
  },
];

// Pesca una categoria a caso tra quelle che hanno ancora almeno un gioco
// "fresco" (non escluso). Se tutte le categorie sono esaurite, ricomincia
// daccapo ignorando l'esclusione invece di bloccare il gioco (stesso
// pattern di pickRandomCategory in server/data/top5.ts).
export function pickRandomOchoCategory(
  excludedIds: ReadonlySet<string> = new Set()
): OchoCategoryDef {
  const categoriesWithFreshGame = OCHO_CATEGORIES.filter((c) =>
    OCHO_GAMES.some((g) => g.categoryId === c.id && !excludedIds.has(g.id))
  );
  if (categoriesWithFreshGame.length > 0) {
    return categoriesWithFreshGame[Math.floor(Math.random() * categoriesWithFreshGame.length)];
  }
  const activeCategories = OCHO_CATEGORIES.filter((c) =>
    OCHO_GAMES.some((g) => g.categoryId === c.id)
  );
  const pool = activeCategories.length > 0 ? activeCategories : OCHO_CATEGORIES;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Pesca un gioco della categoria indicata, escludendo quelli già giocati in
// questa partita. Se la categoria non ha più giochi "freschi", ricade su
// quelli già giocati della stessa categoria (mazzo esaurito, non blocca mai
// il gioco).
export function pickRandomOchoGameInCategory(
  categoryId: string,
  excludedIds: ReadonlySet<string> = new Set()
): OchoGameInternal {
  const inCategory = OCHO_GAMES.filter((g) => g.categoryId === categoryId);
  const fresh = inCategory.filter((g) => !excludedIds.has(g.id));
  const pool = fresh.length > 0 ? fresh : inCategory.length > 0 ? inCategory : OCHO_GAMES;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Rimescola l'ordine delle 9 risposte di un gioco (Fisher-Yates) prima di
// mostrarlo ai giocatori: nel file originale la bomba è sempre l'ultima
// delle 9, quindi senza rimescolare diventerebbe presto ovvio dove si trova
// e il minigioco perderebbe di senso. Ritorna un nuovo array di risposte più
// il nuovo indice della bomba, SENZA modificare l'OchoGameInternal originale
// (che resta la fonte "canonica" e viene rimescolato di nuovo a ogni pesca).
export function shuffleOchoGame(game: OchoGameInternal): { answers: string[]; bombIndex: number } {
  const paired = game.answers.map((text, i) => ({ text, isBomb: i === game.bombIndex }));
  for (let i = paired.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [paired[i], paired[j]] = [paired[j], paired[i]];
  }
  return {
    answers: paired.map((p) => p.text),
    bombIndex: paired.findIndex((p) => p.isBomb),
  };
}
