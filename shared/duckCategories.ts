import type { DuckCategoryDef } from "./types.js";

// Metadati delle categorie di ACCHIAPPA LA PAPERA: SOLO id/nome/emoji,
// nessuna domanda né risposta. È l'unica parte del mondo "ghiacciaia"
// condivisa col client: le domande vere e proprie (server/data/duck.ts)
// restano server-side, altrimenti si spoilererebbero le risposte corrette.
export const DUCK_CATEGORIES: DuckCategoryDef[] = [
  { id: "animali-curriculum", name: "Animali con un curriculum", emoji: "🐾" },
  { id: "errori-nobel", name: "Errori da Premio Nobel", emoji: "🧪" },
  { id: "mondo-strano", name: "Il mondo è più strano di quanto pensi", emoji: "🧭" },
  { id: "corpo-umano", name: "Il corpo umano è una macchina assurda", emoji: "🫀" },
  { id: "successo-davvero", name: "Ma è successo davvero?", emoji: "😳" },
  { id: "animali-furbi", name: "Animali più furbi di noi", emoji: "🐬" },
  { id: "invenzioni-assurde", name: "Invenzioni nate da un'idea assurda", emoji: "💡" },
  { id: "mondo-contrario", name: "Il mondo al contrario", emoji: "🙃" },
  { id: "cervello-inganna", name: "Il cervello ci inganna", emoji: "🌀" },
  { id: "storie-strane", name: "Storie così strane da essere vere", emoji: "📜" },
  { id: "nomi-inventati", name: "Nomi che sembrano inventati", emoji: "🏷️" },
  { id: "spazio-testa", name: "Lo spazio è fuori di testa", emoji: "🪐" },
  { id: "cibi-bugie", name: "Cibi che raccontano bugie", emoji: "🍽️" },
  { id: "guinness-inutili", name: "Guinness quasi inutili", emoji: "🏆" },
  { id: "lingue-impossibili", name: "Lingue impossibili", emoji: "🗣️" },
  { id: "record-natura", name: "Record della natura", emoji: "🌿" },
  { id: "chi-inventato", name: "Chi l'ha inventato?", emoji: "🔧" },
  { id: "piu-antico", name: "Più antico di quanto pensi", emoji: "⏳" },
  { id: "stranezze-numeri", name: "Stranezze nei numeri", emoji: "🔢" },
  { id: "luoghi-incredibili", name: "Luoghi incredibili", emoji: "🗺️" },
];
