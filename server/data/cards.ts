import type { CardDef, CardEffectDef } from "../../shared/types.js";
import { WORLDS } from "./worlds.js";

const EFFECTS: CardEffectDef[] = [
  { type: "extraTime", value: 10, label: "+10 secondi al timer" },
  { type: "removeWrongOption", label: "Elimina una risposta sbagliata" },
  { type: "doubleCoins", label: "Raddoppia le monete della prossima vittoria" },
  { type: "secondChance", label: "Se sbagli, ricevi comunque metà monete" },
  { type: "skipQuestion", label: "Salta la domanda e pescane un'altra" },
];

const RARITY_CYCLE = ["comune", "comune", "rara", "epica"] as const;

// 3 carte per ognuno degli 8 mondi = 24 carte nel catalogo base
export const CARD_CATALOG: CardDef[] = WORLDS.flatMap((world, wIdx) => {
  return [0, 1, 2].map((i) => {
    const effect = EFFECTS[(wIdx * 3 + i) % EFFECTS.length];
    const rarity = RARITY_CYCLE[i % RARITY_CYCLE.length];
    return {
      id: `${world.id}-card-${i + 1}`,
      name: `${world.name.replace(/^Il |^La |^L'|^Le /i, "")} — Talismano ${i + 1}`,
      worldId: world.id,
      rarity,
      emoji: world.emoji,
      effect,
    } satisfies CardDef;
  });
});

export function pickRandomCards(count: number): CardDef[] {
  const result: CardDef[] = [];
  for (let i = 0; i < count; i++) {
    const roll = Math.random();
    // leggera pesatura verso le rarità basse
    const pool = CARD_CATALOG.filter((c) => {
      if (roll < 0.55) return c.rarity === "comune";
      if (roll < 0.85) return c.rarity === "rara";
      if (roll < 0.97) return c.rarity === "epica";
      return c.rarity === "leggendaria";
    });
    const source = pool.length > 0 ? pool : CARD_CATALOG;
    result.push(source[Math.floor(Math.random() * source.length)]);
  }
  return result;
}
