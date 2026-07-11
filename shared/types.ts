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
  | "secondChance" // se sbagli, ti da comunque meta monete invece di zero
  | "skipQuestion" // salta la domanda corrente e ne pesca subito un'altra
  | "passiveFreeChest" // passivo: dopo ogni gioco a cui partecipi, ricevi lo status "baule gratis"
  | "stealAllFromTwo" // ruba tutte le monete a 2 giocatori scelti
  | "swapZeroTripleWin" // scambia posizione con un giocatore a scelta, gli azzera le monete, triplica la tua prossima vincita
  | "chooseNextCategory" // scegli la categoria del tuo prossimo gioco
  | "passiveDoubleImprevistoCoins" // passivo: raddoppia le monete guadagnate/rubate dagli imprevisti
  | "forceSkipTurn" // fai saltare il prossimo turno a un giocatore a scelta
  | "gainThreeShields" // guadagna 3 scudi
  | "moveAllToCittadella" // sposta tutti gli avversari alla Cittadella
  | "teleportSelfToCittadella" // teletrasportati alla Cittadella
  | "steal200Coins" // ruba 200 monete a un avversario a scelta
  | "swapPositionChosen" // scambiati di posizione con un giocatore a scelta
  | "gainFreeChest" // guadagna subito lo status baule gratis
  | "discardTwoRandomFromChosen" // fai scartare 2 figurine casuali a un giocatore a scelta
  | "gainDoubleWin" // guadagna lo status vincita raddoppiata
  | "advanceThreeTiles"; // avanza di tre caselle

export interface CardEffectDef {
  type: CardEffectType;
  value?: number;
  label: string; // descrizione leggibile, es. "+10 secondi al timer"
  isQuickEffect: boolean; // se true: usabile in qualsiasi momento, anche nel turno altrui
  isPassive?: boolean; // se true: sempre attivo finche possiedi la carta, non va "usata"
}

export type CardRarity = "comune" | "rara" | "epica" | "leggendaria";

export interface CardDef {
  id: string;
  name: string;
  worldId: WorldId; // mondo/tema di appartenenza (influenza grafica e drop rate)
  rarity: CardRarity;
  emoji: string;
  image?: string; // percorso di un'illustrazione vera, se presente (altrimenti si usa emoji)
  description: string; // testo narrativo mostrato sulla carta, sopra l'effetto
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

export type PawnToken = "hat" | "car" | "dog" | "boot" | "ship" | "wheelbarrow";

export type StatusType =
  | "skipTurn"
  | "freePack"
  | "freeChest"
  | "doubleWin"
  | "halveWin"
  | "tripleWin"
  | "shield";

export interface PlayerStatus {
  id: string;
  type: StatusType;
  label: string;
  emoji: string;
  description?: string;
}

export interface PlayerSummary {
  id: string;
  name: string;
  coins: number;
  isHost: boolean;
  connected: boolean;
  token: PawnToken | null;
  activeEffects: CardEffectType[]; // effetti carta già armati, pronti da usare
  statuses: PlayerStatus[]; // impalcatura generica per i futuri "status" di gioco
  cardCount: number; // quante carte possiede in totale (visibile agli altri, non quali)
}

export interface MyState extends PlayerSummary {
  collection: OwnedCard[]; // ogni copia posseduta, con il suo stato used/non used
  pendingRoll: number | null; // numero uscito, in attesa che tu confermi lo spostamento
  pendingShop: boolean; // sei atterrato sulla Cittadella e stai visitando il mercante
  cardsUsedThisTurn: string[]; // id delle carte già attivate in questo turno (una per nome/id)
}

export interface GameStateSnapshot {
  code: string;
  phase: "lobby" | "playing";
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
  surprises: number[];
}

export interface JoinResult {
  ok: boolean;
  error?: string;
  code?: string;
}

export interface WheelSpinPayload {
  playerId: string;
  worldId: WorldId;
  resultType: MinigameType;
  durationMs: number;
}

export interface QuizQuestionPayload {
  playerId: string;
  question: QuizQuestion;
  activeEffects: CardEffectType[];
  eliminatedOptionIndex?: number; // opzione già eliminata dall'effetto "removeWrongOption"
}

export interface QuizResultPayload {
  playerId: string;
  correct: boolean;
  correctIndex: number;
  coinsAwarded: number;
}

export interface PackOpenedPayload {
  packId: string;
  cards: { card: CardDef; capped: boolean }[]; // capped = limite di 5 copie già raggiunto, non aggiunta
}

export type SurpriseEffectCode =
  | "moveForward"
  | "moveBackward"
  | "skipNextTurn"
  | "rollAgain"
  | "loseCoins"
  | "gainCoins"
  | "stealCoins"
  | "loseAllCoins"
  | "discardChosenCard"
  | "discardRandomCard"
  | "freePack"
  | "swapChosen"
  | "swapRandom"
  | "nothing"
  | "returnToCittadella"
  | "doubleNextWin"
  | "halveNextWin"
  | "gainShield";

export interface SurpriseCardDef {
  id: string;
  text: string; // il testo narrativo della carta
  effectLabel: string; // l'etichetta dell'effetto, mostrata sulla carta (es. "AVANZA DI DUE CASELLE")
  effectCode: SurpriseEffectCode;
  amount?: number;
}

export interface SurpriseDrawnPayload {
  playerId: string;
  text: string;
  effectLabel: string;
}

export type ChoiceKind = "player" | "card" | "category";

export interface ChoiceOption {
  id: string;
  label: string;
}

export interface ChooseTargetPayload {
  kind: ChoiceKind;
  prompt: string;
  options: ChoiceOption[];
}

// Eventi client -> server
export interface ClientToServerEvents {
  "party:create": (
    payload: { name: string; clientId: string },
    cb: (res: JoinResult) => void
  ) => void;
  "party:join": (
    payload: { code: string; name: string; clientId: string },
    cb: (res: JoinResult) => void
  ) => void;
  "party:start": () => void;
  "party:kick": (payload: { playerId: string }) => void;
  "party:setCoins": (payload: { playerId: string; amount: number }) => void;
  "party:chooseToken": (payload: { token: PawnToken }) => void;
  "board:roll": () => void;
  "board:confirmMove": (payload: { direction?: string }) => void;
  "quiz:answer": (payload: {
    questionId: string;
    answerIndex: number | null;
  }) => void;
  "card:use": (payload: { cardId: string }) => void;
  "shop:buyPack": (payload: { packId: string }) => void;
  "shop:leave": () => void;
  "board:beginMinigame": () => void;
  "board:beginQuiz": () => void;
  "board:closeSurprise": () => void;
  "board:submitChoice": (payload: { optionId: string }) => void;
  "board:useShieldResponse": (payload: { use: boolean }) => void;
}

// Eventi server -> client
export interface ServerToClientEvents {
  "state:update": (state: GameStateSnapshot) => void;
  "board:diceRolled": (payload: { playerId: string; value: number }) => void;
  "board:surpriseDrawn": (payload: SurpriseDrawnPayload) => void;
  "board:chooseTarget": (payload: ChooseTargetPayload) => void;
  "board:useShieldPrompt": (payload: { message: string }) => void;
  "board:shieldUsed": (payload: { playerId: string }) => void;
  "world:welcome": (payload: { playerId: string; worldId: string }) => void;
  "wheel:spin": (payload: WheelSpinPayload) => void;
  "wheel:result": (payload: { playerId: string; worldId: string; resultType: MinigameType }) => void;
  "quiz:question": (payload: QuizQuestionPayload) => void;
  "quiz:result": (payload: QuizResultPayload) => void;
  "shop:packOpened": (payload: PackOpenedPayload) => void;
  "error:message": (payload: { message: string }) => void;
  "party:kicked": () => void;
}
