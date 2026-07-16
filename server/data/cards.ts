import type { CardDef, CardEffectDef, CardRarity } from "../../shared/types.js";

// Numero massimo di copie possedibili per ogni singola figurina.
export const MAX_CARD_COPIES = 5;

const EFFECTS: CardEffectDef[] = [
  { type: "extraTime", value: 10, label: "+10 secondi al timer", isQuickEffect: false },
  { type: "removeWrongOption", label: "Elimina una risposta sbagliata", isQuickEffect: false },
  { type: "doubleCoins", label: "Raddoppia le monete della prossima vittoria", isQuickEffect: false },
  { type: "secondChance", label: "Se sbagli, ricevi comunque metà monete", isQuickEffect: false },
  { type: "skipQuestion", label: "Salta la domanda e pescane un'altra", isQuickEffect: false },
];

// Esattamente 25 carte in totale, con questa distribuzione di rarità.
const RARITY_PLAN: { rarity: CardRarity; count: number }[] = [
  { rarity: "leggendaria", count: 3 },
  { rarity: "epica", count: 5 },
  { rarity: "rara", count: 7 },
  { rarity: "comune", count: 10 },
];

export const CARD_CATALOG: CardDef[] = (() => {
  const list: CardDef[] = [];
  let globalIndex = 0;

  for (const { rarity, count } of RARITY_PLAN) {
    for (let i = 0; i < count; i++) {
      const effect = EFFECTS[globalIndex % EFFECTS.length];
      list.push({
        id: `card-${globalIndex + 1}`,
        name: `Figurina misteriosa ${globalIndex + 1}`,
        rarity,
        emoji: "🃏",
        // testo placeholder: verrà personalizzato in seguito carta per carta
        description: "Un manufatto la cui origine resta ancora un mistero.",
        effect,
      });
      globalIndex++;
    }
  }

  // Personalizzazioni carta per carta: sovrascrivono nome/descrizione/immagine/
  // effetto dei placeholder generati sopra, una carta alla volta man mano che
  // vengono definite. Le 3 leggendarie sono "card-1", "card-2", "card-3" (in
  // quest'ordine).
  const OVERRIDES: Record<
    string,
    Partial<Pick<CardDef, "name" | "description" | "image" | "effect">>
  > = {
    "card-1": {
      name: "Frost3737 da Gaeta",
      image: "/cards/frost3737-da-gaeta.webp",
      description:
        "L'ultimo dei dinosauri rimasti sulla terra. A causa delle braccia da T-Rex incredibilmente corte, non riesce a prendere il portafogli. Si vocifera viva a Gaeta, ma sono solo voci, forse..",
      effect: {
        type: "passiveFreeChest",
        label: "Passivo: dopo ogni gioco a cui partecipi, ricevi lo status Baule Gratis",
        isQuickEffect: false,
        isPassive: true,
      },
    },
    "card-2": {
      name: "Venni - Il falso palestrato",
      image: "/cards/venni-il-falso-palestrato.webp",
      description:
        "Soprannominato \"L'Emanuela Orlandi delle palestre\", nessuno l'ha mai visto effettivamente allenarsi, o dentro una palestra. Se gli offri dei bits, canterà per te.",
      effect: {
        type: "stealAllFromTwo",
        label: "Ruba tutte le monete a 2 giocatori a tua scelta",
        isQuickEffect: false,
      },
    },
    "card-3": {
      name: "Davide la tartaruga",
      image: "/cards/davide-la-tartaruga.webp",
      description:
        "Ha un animo calmo e gentile, ma si arrabbia facilmente quando perde ai videogiochi. Non conosce quali giochi hanno avuto candidature GOTY.",
      effect: {
        type: "swapZeroTripleWin",
        label:
          "Effetto rapido: scambiati di posizione con un giocatore a scelta, azzera le sue monete e triplica la tua prossima vincita",
        isQuickEffect: true,
      },
    },
    "card-4": {
      name: "Nuvola",
      image: "/cards/nuvola.webp",
      description:
        "Nonostante sia albanese, non capisce se gli dici sciarop. Ha più anni che neuroni, ma gli si vuole bene lo stesso.",
      effect: {
        type: "chooseNextCategory",
        label: "Effetto rapido: scegli la categoria del tuo prossimo gioco",
        isQuickEffect: true,
      },
    },
    "card-5": {
      name: "Geoffrey",
      image: "/cards/geoffrey.webp",
      description:
        "Qualcuno ha detto coccole? Qualcuno ha detto obeso? Qualcuno ha detto meooow? Fagli un po' di coccole e sarà il tuo migliore amico.",
      effect: {
        type: "passiveDoubleImprevistoCoins",
        label: "Effetto continuo: raddoppia ogni imprevisto che ti fa guadagnare o rubare monete",
        isQuickEffect: false,
        isPassive: true,
      },
    },
    "card-6": {
      name: "Bandar Seri Begawan",
      image: "/cards/bandar-seri-begawan.webp",
      description:
        "Prepotente, stronzo, stinfio. Decide lui se puoi toccarlo, quando puoi toccarlo e per quanto tempo.. ma che bello che è.",
      effect: {
        type: "forceSkipTurn",
        label: "Fai saltare il prossimo turno a un giocatore a scelta",
        isQuickEffect: false,
      },
    },
    "card-7": {
      name: "Fabio",
      image: "/cards/fabio.webp",
      description:
        "Dolcissimo gattino che ha paura anche della propria ombra. Come hai detto fabietto? L'aspirapolvere è uno strumento del diavolo? Ma no schiocchino!",
      effect: {
        type: "gainThreeShields",
        label: "Guadagna 3 scudi",
        isQuickEffect: false,
      },
    },
    "card-8": {
      name: "Gino",
      image: "/cards/gino.webp",
      description:
        "Soprannominato anche \"L'allievo di MadMarco\". Non ha un rank su Overwatch per scelta, ma sarebbe senza dubbio master. Non sbaglia mai il momento di pushare.",
      effect: {
        type: "moveAllToCittadella",
        label: "Sposta tutti gli avversari alla Cittadella",
        isQuickEffect: false,
      },
    },
    "card-9": {
      name: "Sheren",
      image: "/cards/sheren.webp",
      description:
        "Una vita passata in metro, alcuni della MetroB iniziano a credere sia un barbone che vive lì. Non credergli se ti dice che è forte su Fortnite, ma è bravissima a navigare tra i menu di TaniTina, forse anche un po' troppo.",
      effect: {
        type: "teleportSelfToCittadella",
        label: "Effetto rapido: teletrasportati alla Cittadella",
        isQuickEffect: true,
      },
    },
    "card-10": {
      name: "Slander",
      image: "/cards/slander.webp",
      description:
        "Grande esperto di coltelli, che usa per minacciare le persone e vincere i giveaway. Ti guarda vestito col pigiama di Hello Kitty mentre ti dice \"ESTO TU NO LO TIENEEEES\", e tu non puoi farci assolutamente nulla.",
      effect: {
        type: "steal200Coins",
        label: "Ruba 200 monete a un avversario a scelta",
        isQuickEffect: false,
      },
    },
    "card-11": {
      name: "Glitch",
      image: "/cards/glitch.webp",
      description:
        "Può essere evocato con l'apposito sound alert. Il suo predatore naturale è Venni, fortunatamente si mimetizza bene tra i suoi simili.",
      effect: {
        type: "swapPositionChosen",
        label: "Scambiati di posizione con un giocatore a scelta",
        isQuickEffect: false,
      },
    },
    "card-12": {
      name: "Luna",
      image: "/cards/luna.webp",
      description: "Hai bevuto l'acquetta? Dai bevi l'acquetta. HO DETTO BEVI L'ACQUETTA. SUBITO.",
      effect: {
        type: "gainFreeChest",
        label: "Effetto rapido: guadagna subito un Baule gratis alla Cittadella",
        isQuickEffect: true,
      },
    },
    "card-13": {
      name: "Dante",
      image: "/cards/dante.webp",
      description:
        "Nel mezzo del cammin di nostra vita mi ritrovai per una selva oscura, che la dritta via era smarrita.",
      effect: {
        type: "discardTwoRandomFromChosen",
        label: "Fai scartare 2 figurine casuali a un giocatore a scelta",
        isQuickEffect: false,
      },
    },
    "card-14": {
      name: "Checky",
      image: "/cards/checky.webp",
      description:
        "Diventata cieca dopo anni rinchiusa in una cantina al buio. Nota positiva: ha guadagnato il potere speciale di poter vivere a Venezia senza diventare un piccione.",
      effect: {
        type: "gainDoubleWin",
        label: "Raddoppia la vincita del tuo prossimo gioco",
        isQuickEffect: false,
      },
    },
    "card-15": {
      name: "TheMadMarco",
      image: "/cards/themadmarco.webp",
      description:
        "Anche il kraken Matteo Renzi ha paura a intraprendere un dibattito con lui. SE TI DICE DI NON PUSHARE, NON PUSHARE.",
      effect: {
        type: "advanceThreeTiles",
        label: "Avanza di tre caselle",
        isQuickEffect: false,
      },
    },
    "card-16": {
      name: "Firenze",
      image: "/cards/firenze.webp",
      description:
        "Il luogo perfetto per trovarsi tutti insieme. TUTTI INSIEME, a meno che tu non sia in Puglia. In quel caso non sei invitato.",
      effect: {
        type: "moveChosenBackwardOne",
        label: "Effetto rapido: fai indietreggiare un giocatore a scelta di una casella",
        isQuickEffect: true,
      },
    },
    "card-17": {
      name: "Gaeta",
      image: "/cards/gaeta.webp",
      description: "Peggio di questo forse solo Gaza. FORSE.",
      effect: {
        type: "gain20Coins",
        label: "Guadagna 20 monete",
        isQuickEffect: false,
      },
    },
    "card-18": {
      name: "Il Focolare",
      image: "/cards/il-focolare.webp",
      description:
        "Il Focolare è un luogo di ritrovo. Qui il fuoco è sempre acceso, le partite si giocano in compagnia e le risate fanno parte del rituale. Vieni dentro, avvicina una sedia al focolare.",
      effect: {
        type: "advanceOneTile",
        label: "Effetto rapido: avanza di una casella",
        isQuickEffect: true,
      },
    },
    "card-19": {
      name: "TfueBeppeVessicchio",
      image: "/cards/tfuebeppevessicchio.webp",
      description:
        "Membro dei TFUE. Come dirige lui l'orchestra nessuno. Scammato nei giveaway, ma è troppo altolocato per queste baggianate.",
      effect: {
        type: "gainOneShield",
        label: "Ottieni uno scudo",
        isQuickEffect: false,
      },
    },
    "card-20": {
      name: "Nadia Toffa",
      image: "/cards/nadia-toffa.webp",
      description: "Grandissima giornalista, pilastro della community di Overwatch. Pace all'anima sua.",
      effect: {
        type: "gain20Coins",
        label: "Guadagna 20 monete",
        isQuickEffect: false,
      },
    },
    "card-21": {
      name: "Giveaway",
      image: "/cards/giveaway.webp",
      description:
        "Puoi provare la fortuna se vuoi, tanto non vincerai mai. È TUTTO PILOTATO SVEGLIATI, SEI UNA PEDINA IN MANO AI POTENTI.",
      effect: {
        type: "gainRandomCommonCard",
        label: "Ricevi una figurina comune casuale",
        isQuickEffect: false,
      },
    },
    "card-22": {
      name: "Pullata su NTE",
      image: "/cards/pullata-su-nte.webp",
      description:
        "Cosa c'è di meglio di passare un mese a farmare monete su un gioco inutile per sperare di trovare skin inutili? Qualsiasi altra cosa, ma sei libero di scegliere come passare il tuo tempo..",
      effect: {
        type: "gainFreePack",
        label: "Guadagna subito un Pacchetto gratis alla Cittadella",
        isQuickEffect: false,
      },
    },
    "card-23": {
      name: "TheMaddierMarco",
      image: "/cards/themaddiermarco.webp",
      description: "Come fa MadMarco ad essere più mad? Fidati non vuoi scoprirlo.",
      effect: {
        type: "extraRollThisTurn",
        label: "Tira due volte il dado in questo turno",
        isQuickEffect: false,
      },
    },
    "card-24": {
      name: "Scrivania Segreta",
      image: "/cards/scrivania-segreta.webp",
      description: "Un tempo un luogo sicuro per le ragazze in pericolo. Poi Frost ha trovato anche questo.",
      effect: {
        type: "steal20Coins",
        label: "Ruba 20 monete a un giocatore a scelta",
        isQuickEffect: false,
      },
    },
    "card-25": {
      name: "I Pirati",
      image: "/cards/i-pirati.webp",
      description:
        "Ripudiati da chi non capisce o non vuole vincere. NON TUTTI CAPISCONO LA POTENZA, ALCUNI SONO DESTINATI ALL'ETERNO FALLIMENTO.",
      effect: {
        type: "advanceTwoTiles",
        label: "Avanza di due caselle",
        isQuickEffect: false,
      },
    },
  };

  const withOverrides = list.map((card) =>
    OVERRIDES[card.id] ? { ...card, ...OVERRIDES[card.id] } : card
  );

  // 26esima figurina: rarità speciale "segreta", unica nel suo genere. Non fa
  // parte del RARITY_PLAN (non è generata dal round-robin qui sopra) e non ha
  // nessun effetto di gioco: vale solo come pezzo raro da collezione. Non
  // compare mai nella "Collezione completa" finché non viene trovata (vedi
  // FullCollectionMenu.tsx).
  withOverrides.push({
    id: "card-26",
    name: "IL GOAT",
    rarity: "segreta",
    emoji: "🐐",
    image: "/cards/il-goat.webp",
    description: "Semplicemente il migliore in tutto, soprattutto nei noleggi con conducente.",
  });

  return withOverrides;
})();

// Probabilità di estrazione per OGNI singola carta pescata da un pacchetto:
// 50% comune, 38% rara, 10% epica, 2% leggendaria.
function pickRarity(): CardRarity {
  const roll = Math.random();
  if (roll < 0.5) return "comune";
  if (roll < 0.88) return "rara";
  if (roll < 0.98) return "epica";
  return "leggendaria";
}

export function pickRandomCards(count: number): CardDef[] {
  const result: CardDef[] = [];
  for (let i = 0; i < count; i++) {
    const rarity = pickRarity();
    const pool = CARD_CATALOG.filter((c) => c.rarity === rarity);
    const source = pool.length > 0 ? pool : CARD_CATALOG;
    result.push(source[Math.floor(Math.random() * source.length)]);
  }
  return result;
}
