import type { CardDef, CardEffectDef, CardRarity } from "../../shared/types.js";
import { WORLDS } from "./worlds.js";

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
  const perWorldCount: Record<string, number> = {};
  let globalIndex = 0;

  for (const { rarity, count } of RARITY_PLAN) {
    for (let i = 0; i < count; i++) {
      const world = WORLDS[globalIndex % WORLDS.length];
      const effect = EFFECTS[globalIndex % EFFECTS.length];
      const n = (perWorldCount[world.id] = (perWorldCount[world.id] ?? 0) + 1);
      list.push({
        id: `card-${globalIndex + 1}`,
        name: `Talismano di ${world.name} ${n}`,
        worldId: world.id,
        rarity,
        emoji: world.emoji,
        // testo placeholder: verrà personalizzato in seguito carta per carta
        description: `Un manufatto legato al mondo di ${world.name}, la cui origine resta ancora un mistero.`,
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
  };

  return list.map((card) => (OVERRIDES[card.id] ? { ...card, ...OVERRIDES[card.id] } : card));
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
