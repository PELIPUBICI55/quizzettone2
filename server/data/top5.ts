import type { Top5CategoryDef, Top5Def } from "../../shared/types.js";
import { TOP5_CATEGORIES } from "../../shared/top5Categories.js";

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
];

export function pickRandomTop5(): Top5Def {
  return TOP5_BANK[Math.floor(Math.random() * TOP5_BANK.length)];
}

// Categorie effettivamente "attive", cioè con almeno una top5 pronta nel
// mazzo. Per ora sono geografia, scienze, serie tv e film; le figurine di
// animali (1-6) sono ancora in attesa di essere assegnate a una loro categoria.
export function pickRandomCategory(): Top5CategoryDef {
  const activeCategories = TOP5_CATEGORIES.filter((c) =>
    TOP5_BANK.some((t) => t.category === c.id)
  );
  const pool = activeCategories.length > 0 ? activeCategories : TOP5_CATEGORIES;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function pickRandomTop5InCategory(categoryId: string): Top5Def {
  const inCategory = TOP5_BANK.filter((t) => t.category === categoryId);
  const pool = inCategory.length > 0 ? inCategory : TOP5_BANK;
  return pool[Math.floor(Math.random() * pool.length)];
}
