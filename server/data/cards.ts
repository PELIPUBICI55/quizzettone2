import type { CardDef, CardEffectDef, CardRarity } from "../../shared/types.js";
import { WORLDS } from "./worlds.js";

const EFFECTS: CardEffectDef[] = [
  { type: "extraTime", value: 10, label: "+10 secondi al timer" },
  { type: "removeWrongOption", label: "Elimina una risposta sbagliata" },
  { type: "doubleCoins", label: "Raddoppia le monete della prossima vittoria" },
  { type: "secondChance", label: "Se sbagli, ricevi comunque metà monete" },
  { type: "skipQuestion", label: "Salta la domanda e pescane un'altra" },
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
        effect,
      });
      globalIndex++;
    }
  }
  return list;
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
