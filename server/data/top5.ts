import type { Top5CategoryDef, Top5Def } from "../../shared/types.js";
import { TOP5_CATEGORIES } from "../../shared/top5Categories.js";

export const TOP5_BANK: Top5Def[] = [
  {
    id: "top5-animali-case-mondo",
    title: "Animali più presenti nelle case (nel mondo)",
    category: "animali",
    answers: ["Gatti", "Cani", "Pesci", "Roditori (criceti, conigli, ecc.)", "Uccelli"],
    source: "Stime globali sul possesso di animali domestici (Spiegato.com e altre fonti comparate)",
  },
  {
    id: "top5-razze-cane-mondo",
    title: "Razze di cane più diffuse nel mondo",
    category: "animali",
    answers: ["Bulldog Francese", "Labrador Retriever", "Golden Retriever", "Pastore Tedesco", "Barboncino"],
    source: "American Kennel Club (AKC), classifica 2023",
  },
  {
    id: "top5-nazioni-rateo-pet",
    title: "Nazioni con rateo animali domestici per famiglia più alto",
    category: "animali",
    answers: ["Ungheria", "Italia", "Francia", "Germania", "Spagna"],
    source: "Indagine GfK/Censis su 22 Paesi, riportata da MyPersonalTrainer",
  },
  {
    id: "top5-animali-cucinati",
    title: "Animali più cucinati al mondo",
    category: "animali",
    answers: ["Pollo", "Maiale", "Manzo", "Pecora", "Capra"],
    source: "OCSE-FAO (Organizzazione per la Cooperazione e lo Sviluppo Economico / FAO)",
  },
  {
    id: "top5-animali-italia",
    title: "Animali più presenti in Italia",
    category: "animali",
    answers: ["Pesci", "Gatti", "Cani", "Uccelli", "Rettili e anfibi"],
    source: "Rapporto Assalco-Zoomark 2026",
  },
  {
    id: "top5-animali-zoo",
    title: "Animali più presenti negli zoo",
    category: "animali",
    answers: ["Leoni", "Elefanti", "Giraffe", "Tigri", "Scimmie/Primati"],
    source:
      "Non esiste una classifica statistica ufficiale unica: elenco basato sul consenso comune tra le principali guide di zoo nel mondo",
  },
  {
    id: "top5-altitudine-media",
    title: "Nazioni con l'altezza media dal livello del mare più alta",
    category: "geografia",
    answers: ["Bhutan", "Nepal", "Lesotho", "Andorra", "Afghanistan"],
    source: "Dati comparati sull'altitudine media nazionale (World Atlas / Ripley's Believe It or Not)",
  },
  {
    id: "top5-nazioni-popolose",
    title: "Nazioni più popolose",
    category: "geografia",
    answers: ["India", "Cina", "Stati Uniti", "Indonesia", "Pakistan"],
    source: "ONU – World Population Prospects, dati aggiornati al 2026 (via Worldometer)",
  },
  {
    id: "top5-qi-alto",
    title: "Nazioni con il QI più alto",
    category: "geografia",
    answers: ["Giappone", "Taiwan", "Singapore", "Hong Kong", "Cina"],
    source:
      "Dataset Lynn & Vanhanen — metodologia ampiamente contestata dalla comunità scientifica per campioni non rappresentativi: da prendere con le pinze",
  },
  {
    id: "top5-pene-grande",
    title: "Nazioni con il pene più grande",
    category: "geografia",
    answers: ["Ecuador", "Camerun", "Bolivia", "Sudan", "Haiti"],
    source:
      "Mappa virale ripresa da Daily Mail/World Data — dati in gran parte autodichiarati e non verificabili in modo indipendente: puro intrattenimento, non prendetela sul serio",
  },
  {
    id: "top5-seno-grosso",
    title: "Nazioni con il seno più grosso",
    category: "geografia",
    answers: ["Russia", "Finlandia", "Svezia", "Norvegia", "Germania"],
    source:
      "Mappa virale di TargetMap.com — dati aneddotici e non verificabili: puro intrattenimento, non prendetela sul serio",
  },
  {
    id: "top5-fiumi-lunghi",
    title: "Fiumi più lunghi",
    category: "geografia",
    answers: ["Nilo", "Rio delle Amazzoni", "Fiume Azzurro (Yangtze)", "Mississippi-Missouri", "Fiume Giallo (Huang He)"],
    source:
      "Classifica tradizionale (Guinness dei Primati/Enciclopedia Britannica); nota: è in corso un dibattito scientifico su chi sia davvero il più lungo tra Nilo e Rio delle Amazzoni",
  },
  {
    id: "top5-malattie-genetiche",
    title: "Malattie genetiche più comuni",
    category: "scienze",
    answers: ["Ipercolesterolemia familiare", "Anemia falciforme", "Talassemia", "Fibrosi cistica", "Sindrome di Down"],
    source:
      "Stime di prevalenza comunemente citate in letteratura medica/genetica (non esiste una classifica ufficiale unica)",
  },
  {
    id: "top5-primi-elementi",
    title: "Primi 5 elementi della tavola periodica",
    category: "scienze",
    answers: ["Idrogeno", "Elio", "Litio", "Berillio", "Boro"],
    source: "Tavola periodica IUPAC, ordinamento per numero atomico",
  },
  {
    id: "top5-organi-pesanti",
    title: "Organi più pesanti del corpo umano",
    category: "scienze",
    answers: ["Pelle", "Fegato", "Cervello", "Polmoni", "Cuore"],
    source: "Dati comparati sul peso medio degli organi umani (studio Grandmaison 2001 e fonti medico-divulgative)",
  },
  {
    id: "top5-metalli-conduttori",
    title: "Metalli con la maggiore conduzione elettrica",
    category: "scienze",
    answers: ["Argento", "Rame", "Oro", "Alluminio", "Tungsteno"],
    source: "Valori standard di conducibilità elettrica (S/m) — dati di fisica di riferimento",
  },
  {
    id: "top5-scimmie-intelligenti",
    title: "Scimmie più intelligenti",
    category: "scienze",
    answers: ["Scimpanzé", "Orango", "Bonobo", "Gorilla", "Scimmia cappuccina"],
    source: "Studio comparativo Duke University (via Focus.it) e Istituto Jane Goodall Italia",
  },
  {
    id: "top5-epidemie-morti",
    title: "Epidemie con più morti",
    category: "scienze",
    answers: ["Vaiolo", "Peste Nera", "Influenza Spagnola", "Peste di Giustiniano", "HIV/AIDS"],
    source:
      "Stime storiche comparate (OMS e fonti storiche multiple) — i numeri esatti variano molto da fonte a fonte",
  },
  {
    id: "top5-serietv-incassi",
    title: "Serie TV con più incassi di sempre",
    category: "serietv",
    answers: ["I Simpson", "The Big Bang Theory", "Seinfeld", "Frasier", "Friends"],
    source:
      "Stime aggregate di ricavi pubblicitari, syndication e streaming (Forbes, GOBankingRates, Collider); le reti non divulgano cifre ufficiali uniche, quindi l'ordine esatto tra le prime posizioni è indicativo",
  },
  {
    id: "top5-serietv-lunghe",
    title: "Serie TV più lunghe di sempre (per numero di episodi)",
    category: "serietv",
    answers: ["Guiding Light", "General Hospital", "Days of Our Lives", "As the World Turns", "The Young and the Restless"],
    source:
      "Guinness World Records / Wikipedia — soap opera americane per numero di episodi trasmessi (alcune sono ancora in onda, quindi il conteggio cresce nel tempo)",
  },
  {
    id: "top5-serietv-emmy",
    title: "Serie TV con più premi Emmy",
    category: "serietv",
    answers: ["Saturday Night Live", "Game of Thrones", "Frasier", "The Simpsons", "Last Week Tonight with John Oliver"],
    source: "Television Academy — albo d'oro dei Primetime Emmy Awards",
  },
  {
    id: "top5-franchise-incassi",
    title: "Franchise che generano più incassi (merchandising incluso)",
    category: "serietv",
    answers: ["Pokémon", "Mickey Mouse & Friends", "Winnie the Pooh", "Star Wars", "Disney Princess"],
    source: "Wikipedia — List of highest-grossing media franchises",
  },
  {
    id: "top5-anime-mal",
    title: "Anime con valutazione più alta su MyAnimeList",
    category: "serietv",
    answers: ["Frieren: Beyond Journey's End", "Fullmetal Alchemist: Brotherhood", "Steins;Gate", "Attack on Titan", "Gintama: The Very Final"],
    source:
      "MyAnimeList, classifica per punteggio medio degli utenti (posizione soggetta a variazioni nel tempo, aggiornata a metà 2026)",
  },
  {
    id: "top5-disney-incassi",
    title: "Serie Disney con più incassi",
    category: "serietv",
    answers: ["The Mandalorian", "Hannah Montana", "High School Musical", "Wizards of Waverly Place", "Phineas and Ferb"],
    source:
      "Stima basata su ricavi di merchandising/home video riportati da Disney e dalla stampa di settore (Hollywood Reporter, Billboard); non esiste una classifica ufficiale unica",
  },
  {
    id: "top5-film-incassi",
    title: "Film con più incassi di sempre",
    category: "film",
    answers: ["Avatar (2009)", "Avengers: Endgame (2019)", "Avatar: La via dell'acqua (2022)", "Titanic (1997)", "Ne Zha 2 (2025)"],
    source:
      "Box Office Mojo / Wikipedia — incassi mondiali non aggiustati per l'inflazione, dati aggiornati a metà 2026 (Titanic e Ne Zha 2 sono sostanzialmente a pari merito)",
  },
  {
    id: "top5-film-lunghi",
    title: "Film più lunghi di sempre",
    category: "film",
    answers: ["Logistics (2012) – 51.420 minuti", "La Flor (2018) – 808 minuti", "Out 1 (1971) – 773 minuti", "Sátántangó (1994) – circa 432 minuti", "La meglio gioventù (2003) – 366 minuti"],
    source:
      "Wikipedia — List of longest films; la classifica include anche opere sperimentali/istallazioni, non solo blockbuster convenzionali",
  },
  {
    id: "top5-film-imdb",
    title: "Film con rating più alto su IMDb",
    category: "film",
    answers: ["Le ali della libertà", "Il padrino", "Il cavaliere oscuro", "Il Signore degli Anelli - Il ritorno del re", "Il buono, il brutto, il cattivo"],
    source: "IMDb Top 250, classifica per voto medio degli utenti (aggiornata a metà 2026)",
  },
  {
    id: "top5-disney-film-lunghi",
    title: "Film Disney più lunghi",
    category: "film",
    answers: ["Fantasia (1940) – 126 min", "Ralph spacca Internet (2018) – 112 min", "Zootropolis 2 (2025) – 108 min", "Zootropolis (2016) – 108 min", "Raya e l'ultimo drago (2021) – 107 min"],
    source: "ScreenRant / Guinness World Records — durata dei lungometraggi d'animazione Disney",
  },
  {
    id: "top5-disney-film-antichi",
    title: "Film Disney più antichi",
    category: "film",
    answers: ["Biancaneve e i sette nani (1937)", "Pinocchio (1940)", "Fantasia (1940)", "Dumbo (1941)", "Bambi (1942)"],
    source: "Lista ufficiale dei lungometraggi d'animazione Disney (Wikipedia / D23), in ordine cronologico di uscita",
  },
  {
    id: "top5-disney-film-premiati",
    title: "Film Disney più premiati",
    category: "film",
    answers: ["Mary Poppins (1964) – 5 premi Oscar", "Chi ha incastrato Roger Rabbit (1988) – 3 premi Oscar", "Pinocchio (1940) – 2 premi Oscar", "La bella e la bestia (1991) – 2 premi Oscar", "Il Re Leone (1994) – 2 premi Oscar"],
    source:
      "Academy of Motion Picture Arts and Sciences — albo d'oro degli Oscar; le posizioni 3-5 sono a pari merito con altri titoli Disney a 2 premi (es. Frozen, Coco)",
  },
  {
    id: "top5-musica-streaming",
    title: "Canzoni più streammate di sempre su Spotify",
    category: "musica",
    answers: ["Blinding Lights – The Weeknd", "Shape of You – Ed Sheeran", "Sweater Weather – The Neighbourhood", "Starboy – The Weeknd", "As It Was – Harry Styles"],
    source: "kworb.net (dati Spotify aggiornati in tempo reale), luglio 2026",
  },
  {
    id: "top5-musica-ascoltatori",
    title: "Artisti con più ascoltatori mensili su Spotify",
    category: "musica",
    answers: ["Bruno Mars", "Justin Bieber", "The Weeknd", "Rihanna", "Michael Jackson"],
    source: "kworb.net — Spotify Top Artists by Monthly Listeners, luglio 2026 (la classifica cambia di continuo)",
  },
  {
    id: "top5-sanremo-ultimi",
    title: "Ultime 5 canzoni vincitrici di Sanremo",
    category: "musica",
    answers: [
      "Per sempre sì – Sal Da Vinci (2026)",
      "Balorda nostalgia – Olly (2025)",
      "La noia – Angelina Mango (2024)",
      "Due vite – Marco Mengoni (2023)",
      "Brividi – Mahmood e Blanco (2022)",
    ],
    source: "Albo d'oro ufficiale del Festival di Sanremo (categoria Campioni), RAI",
  },
  {
    id: "top5-eurovision-ultime",
    title: "Ultime 5 nazioni vincitrici dell'Eurovision",
    category: "musica",
    answers: [
      "Bulgaria (2026) – DARA, \"Bangaranga\"",
      "Austria (2025) – JJ",
      "Svizzera (2024) – Nemo",
      "Svezia (2023) – Loreen",
      "Ucraina (2022) – Kalush Orchestra",
    ],
    source: "Eurovision.tv / Wikipedia — albo d'oro dell'Eurovision Song Contest",
  },
  {
    id: "top5-sigle-anime",
    title: "5 sigle anime più ascoltate su Spotify",
    category: "musica",
    answers: [
      "Gurenge – LiSA (Demon Slayer)",
      "Peace Sign – Kenshi Yonezu (My Hero Academia)",
      "KICK BACK – Kenshi Yonezu (Chainsaw Man)",
      "Blue Bird – Ikimonogakari (Naruto Shippuden)",
      "Unravel – TK from Ling tosite sigure (Tokyo Ghoul)",
    ],
    source:
      "Aggregazione di dati Spotify riportati da Xeud.it e AnimeClick; non esiste una classifica ufficiale unica sempre aggiornata",
  },
  {
    id: "top5-canzoni-disney",
    title: "5 canzoni Disney con più ascolti su Spotify",
    category: "musica",
    answers: [
      "We Don't Talk About Bruno – Encanto",
      "Let It Go – Frozen",
      "How Far I'll Go – Oceania",
      "You're Welcome (Tranquilla!) – Oceania",
      "Life Is a Highway – Cars",
    ],
    source:
      "Dati Spotify riportati da varie testate (Sky TG24, Velvet Gossip, HipLatina); \"We Don't Talk About Bruno\" ha superato \"Let It Go\" dopo l'uscita di Encanto nel 2021",
  },
  {
    id: "top5-vg-goty",
    title: "Ultimi 5 vincitori GOTY (The Game Awards)",
    category: "videogiochi",
    answers: [
      "Clair Obscur: Expedition 33 (2025)",
      "Astro Bot (2024)",
      "Baldur's Gate 3 (2023)",
      "Elden Ring (2022)",
      "It Takes Two (2021)",
    ],
    source: "The Game Awards — albo d'oro ufficiale del Game of the Year",
  },
  {
    id: "top5-vg-steam",
    title: "Giochi più venduti di sempre su Steam",
    category: "videogiochi",
    answers: ["PUBG: Battlegrounds", "Terraria", "Garry's Mod", "Grand Theft Auto V", "Rust"],
    source: "Stime aggregate di vendite su Steam (SteamDB / VG Insights), dati aggiornati a metà 2026",
  },
  {
    id: "top5-vg-mario",
    title: "Ultimi 5 videogiochi del mondo Mario usciti",
    category: "videogiochi",
    answers: [
      "Super Mario Bros. Wonder – Nintendo Switch 2 Edition (2026)",
      "Mario Tennis Fever (2026)",
      "Donkey Kong Bananza (2025)",
      "Mario Kart World (2025)",
      "Mario & Luigi: Brothership (2024)",
    ],
    source: "Nintendo — calendario ufficiale delle uscite, ordine cronologico decrescente aggiornato a luglio 2026",
  },
  {
    id: "top5-vg-console",
    title: "Console più vendute di sempre",
    category: "videogiochi",
    answers: [
      "PlayStation 2 – 160 milioni",
      "Nintendo Switch – 155,37 milioni",
      "Nintendo DS – 154,02 milioni",
      "Game Boy / Game Boy Color – 118,69 milioni",
      "PlayStation 4 – 117,2 milioni",
    ],
    source: "Wikipedia — List of best-selling game consoles, dati ufficiali dei produttori aggiornati a metà 2026",
  },
  {
    id: "top5-vg-costosi",
    title: "Videogiochi più costosi da produrre",
    category: "videogiochi",
    answers: [
      "Grand Theft Auto VI – stimato 2 miliardi $",
      "Star Citizen – oltre 650 milioni $ (crowdfunding continuo)",
      "Cyberpunk 2077 – 498 milioni $",
      "Call of Duty: Black Ops III – 450 milioni $",
      "Grand Theft Auto V – 265 milioni $",
    ],
    source:
      "Stime aggregate di budget di sviluppo e marketing riportate da stampa specializzata (IGN, Game Rant, Wikipedia); alcune cifre (es. GTA VI) sono stime non ufficiali",
  },
  {
    id: "top5-vg-mappe",
    title: "Mappe più grandi nei videogiochi",
    category: "videogiochi",
    answers: [
      "Microsoft Flight Simulator – 510.000.000 km² (l'intera Terra)",
      "Fuel – 18.130 km²",
      "The Crew 2 – 5.700 km²",
      "The Crew – 5.180 km²",
      "The Elder Scrolls II: Daggerfall – 1.616 km²",
    ],
    source: "en.eloutput.com — classifica delle mappe open world più estese nei videogiochi",
  },
  {
    id: "top5-sport-pallone-oro",
    title: "Ultimi 5 Palloni d'Oro diversi",
    category: "sport",
    answers: [
      "Ousmane Dembélé (2025)",
      "Rodri (2024)",
      "Lionel Messi (2023)",
      "Karim Benzema (2022)",
      "Luka Modrić (2018)",
    ],
    source:
      "France Football / UEFA — albo d'oro del Pallone d'Oro; esclusi i vincitori ripetuti (Messi anche nel 2021 e 2019) e l'edizione 2020, non assegnata per la pandemia",
  },
  {
    id: "top5-sport-mondiali-calcio",
    title: "Nazioni con più Mondiali di calcio vinti",
    category: "sport",
    answers: [
      "Brasile – 5 titoli",
      "Germania – 4 titoli",
      "Italia – 4 titoli",
      "Argentina – 3 titoli",
      "Francia – 2 titoli",
    ],
    source:
      "FIFA — albo d'oro dei Campionati del Mondo di calcio, aggiornato al 2026; Germania e Italia a pari merito con 4 titoli, Francia a pari merito con l'Uruguay con 2 titoli",
  },
  {
    id: "top5-sport-champions",
    title: "Squadre con più Champions League vinte",
    category: "sport",
    answers: [
      "Real Madrid – 15",
      "Milan – 7",
      "Bayern Monaco – 6",
      "Liverpool – 6",
      "Barcellona – 5",
    ],
    source:
      "UEFA — albo d'oro della Champions League, aggiornato dopo la finale 2025-2026 vinta dal Paris Saint-Germain; Bayern Monaco e Liverpool a pari merito con 6 titoli",
  },
  {
    id: "top5-sport-titoli-nazionali",
    title: "Squadre con più titoli nazionali (Top 5 campionati europei)",
    category: "sport",
    answers: [
      "Juventus – 36 (Serie A)",
      "Real Madrid – 35 (Liga)",
      "Bayern Monaco – 33 (Bundesliga)",
      "Barcellona – 27 (Liga)",
      "Manchester United – 20 (Premier League)",
    ],
    source: "Dati aggregati sui titoli nazionali vinti nei Big 5 campionati europei (Calciomercato.com e fonti storiche ufficiali)",
  },
  {
    id: "top5-sport-medaglie-olimpiche",
    title: "Atleti con più medaglie olimpiche",
    category: "sport",
    answers: [
      "Michael Phelps – 28 (nuoto)",
      "Larisa Latynina – 18 (ginnastica)",
      "Nikolaj Andrianov – 15 (ginnastica)",
      "Boris Shakhlin – 13 (ginnastica)",
      "Edoardo Mangiarotti – 13 (scherma)",
    ],
    source:
      "Wikipedia — List of multiple Olympic medalists; Boris Shakhlin è a pari merito con Edoardo Mangiarotti e con il ginnasta giapponese Takashi Ono, tutti a 13 medaglie",
  },
  {
    id: "top5-sport-mondiali-pallavolo",
    title: "Nazioni con più Mondiali di pallavolo (maschile)",
    category: "sport",
    answers: [
      "Unione Sovietica – 6 titoli",
      "Italia – 5 titoli",
      "Brasile – 3 titoli",
      "Polonia – 3 titoli",
      "Cecoslovacchia – 2 titoli",
    ],
    source:
      "FIVB / Wikipedia — albo d'oro del Campionato mondiale maschile di pallavolo, aggiornato dopo la vittoria dell'Italia nelle Filippine nel settembre 2025 (quinto titolo azzurro, secondo consecutivo); Brasile e Polonia a pari merito con 3 titoli",
  },
];

export function pickRandomTop5(): Top5Def {
  return TOP5_BANK[Math.floor(Math.random() * TOP5_BANK.length)];
}

// Categorie effettivamente "attive", cioè con almeno una top5 pronta nel
// mazzo (geografia, scienze, serie tv, film, musica, videogiochi, sport,
// animali).
//
// excludedIds permette di escludere le top5 già giocate in questa partita
// (vedi GameSession.playedTop5Ids, in server/game/GameSession.ts): una
// categoria è "attiva" solo se ha ancora almeno una top5 NON esclusa. Una
// top5 già giocata non può più essere ripescata: se TUTTE le categorie sono
// esaurite questa funzione restituisce null, e sarà GameSession a
// disattivare il mondo "vulcano" (nessun ripiego che ripete domande).
export function pickRandomCategory(excludedIds: ReadonlySet<string> = new Set()): Top5CategoryDef | null {
  const categoriesWithFreshTop5 = TOP5_CATEGORIES.filter((c) =>
    TOP5_BANK.some((t) => t.category === c.id && !excludedIds.has(t.id))
  );
  if (categoriesWithFreshTop5.length === 0) return null;
  return categoriesWithFreshTop5[Math.floor(Math.random() * categoriesWithFreshTop5.length)];
}

// Pesca una top5 della categoria indicata, escludendo quelle già giocate in
// questa partita. Non ripiega mai su top5 già usate: se la categoria non ha
// più fresche (non dovrebbe succedere se si è passati da pickRandomCategory,
// che offre solo categorie ancora fresche) restituisce null.
export function pickRandomTop5InCategory(
  categoryId: string,
  excludedIds: ReadonlySet<string> = new Set()
): Top5Def | null {
  const fresh = TOP5_BANK.filter((t) => t.category === categoryId && !excludedIds.has(t.id));
  if (fresh.length === 0) return null;
  return fresh[Math.floor(Math.random() * fresh.length)];
}

// true se OGNI categoria ha esaurito le sue top5 fresche: il mondo "vulcano"
// va disattivato.
export function isTop5WorldExhausted(excludedIds: ReadonlySet<string>): boolean {
  return TOP5_CATEGORIES.every((c) =>
    TOP5_BANK.filter((t) => t.category === c.id).every((t) => excludedIds.has(t.id))
  );
}
