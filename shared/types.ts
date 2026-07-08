// Tipi condivisi tra client (src/) e server (server/).
// Qualsiasi modifica qui impatta sia il frontend che il backend.

export type WorldId = string;
export type MinigameType = "quiz"; // in futuro: "memory" | "reaction" | "guess" | ...

export interface WorldDef {
  id: WorldId;
  name: string;
  emoji: string;
  tagline: string;
  colorFrom: string; // usati dal client per lo sfondo/gradiente della card mondo
  colorTo: string;
}

export interface QuizQuestion {
  id: string;
  category: string;
  question: string;
  options: string[];
  timeLimitSec: number;
  // correctIndex NON viene mai inviato al client prima della risposta
}

export type CardEffectType =
  | "extraTime" // aggiunge secondi al timer della domanda corrente
  | "removeWrongOption" // elimina una risposta sbagliata
  | "doubleCoins" // raddoppia le monete guadagnate dal prossimo minigioco vinto
  | "secondChance" // se sbagli, ti dà comunque met\u00e0 monete invece di zero
  | "skipQuestion"; // salta la domanda corrente e ne pesca subito un'altra

export interface CardEffectDef {
  type: CardEffectType;
  value?: number;
  label: string; // descrizione leggibile, es. "+10 secondi al timer"
}

export type CardRarity = "comune" | "rara" | "epica" | "leggendaria";

export interface CardDef {
  id: string;
  name: string;
  worldId: WorldId; // mondo/tema di appartenenza (influenza grafica e drop rate)
  rarity: CardRarity;
  emoji: string;
  effect: CardEffectDef;
}

export interface PackDef {
  id: string;
  name: string;
  cost: number;
  cardCount: number;
  description: string;
}

export interface OwnedCard {
  instanceId: string;
  cardId: string;
  used: boolean; // effetto già attivato: conta ancora nella collezione ma non è più riutilizzabile
}

export interface BoardPosition {
  nodeId: string; // nodo corrente (se onNode) oppure nodo di partenza dell'attraversamento
  onNode: boolean;
  edgeId?: string; // ponte su cui ci si trova, se non su un nodo
  progress?: number; // caselle percorse sul ponte (1..length-1)
}

export interface PlayerSummary {
  id: string;
  name: string;
  coins: number;
  isHost: boolean;
  cardCount: number; // quante carte possiede in totale (visibile agli altri, non quali)
}

export interface MyState extends PlayerSummary {
  collection: OwnedCard[]; // ogni copia posseduta, con il suo stato used/non used
  activeEffects: CardEffectType[]; // effetti attivati e in attesa di essere consumati
  pendingRoll: number | null; // numero uscito, in attesa che tu confermi lo spostamento
}

export interface GameStateSnapshot {
  code: string;
  worlds: WorldDef[];
  packs: PackDef[];
  cardCatalog: CardDef[];
  players: PlayerSummary[];
  me: MyState;
  board: { edges: BoardEdgeLike[] };
  turnOrder: string[];
  currentTurnPlayerId: string | null;
  positions: Record<string, BoardPosition>;
}

// Duplico qui solo la "forma" dell'arco (senza dipendere da shared/board.ts)
// per evitare un giro di import circolare tra i due file di tipi/dati.
export interface BoardEdgeLike {
  id: string;
  a: string;
  b: string;
  length: number;
}

export interface JoinResult {
  ok: boolean;
  error?: string;
  code?: string;
}

export interface WheelSpinPayload {
  worldId: WorldId;
  resultType: MinigameType;
  durationMs: number;
}

export interface QuizQuestionPayload {
  question: QuizQuestion;
  activeEffects: CardEffectType[];
  eliminatedOptionIndex?: number; // opzione già eliminata dall'effetto "removeWrongOption"
}

export interface QuizResultPayload {
  correct: boolean;
  correctIndex: number;
  coinsAwarded: number;
}

export interface PackOpenedPayload {
  packId: string;
  cards: CardDef[];
}

// Eventi client -> server
export interface ClientToServerEvents {
  "party:create": (
    payload: { name: string },
    cb: (res: JoinResult) => void
  ) => void;
  "party:join": (
    payload: { code: string; name: string },
    cb: (res: JoinResult) => void
  ) => void;
  "board:roll": () => void;
  "board:confirmMove": (payload: { direction?: string }) => void;
  "quiz:answer": (payload: {
    questionId: string;
    answerIndex: number | null;
  }) => void;
  "card:use": (payload: { cardId: string }) => void;
  "shop:buyPack": (payload: { packId: string }) => void;
}

// Eventi server -> client
export interface ServerToClientEvents {
  "state:update": (state: GameStateSnapshot) => void;
  "board:diceRolled": (payload: { playerId: string; value: number }) => void;
  "wheel:spin": (payload: WheelSpinPayload) => void;
  "quiz:question": (payload: QuizQuestionPayload) => void;
  "quiz:result": (payload: QuizResultPayload) => void;
  "shop:packOpened": (payload: PackOpenedPayload) => void;
  "error:message": (payload: { message: string }) => void;
}
