import type { Server } from "socket.io";
import type {
  BoardPosition,
  CardDef,
  CardEffectType,
  CardRarity,
  CaroAmicoDomandaDef,
  CaroAmicoPersonaDef,
  ClientToServerEvents,
  GameEndedPayload,
  GameStateSnapshot,
  OwnedCard,
  PawnToken,
  PlayerStatus,
  ServerToClientEvents,
  ParticolareCategoryId,
  BuzzQuestionPayload,
  SfidaGinoCategoryId,
  SfidaGinoPrompt,
  SfidaGinoQuestionPayload,
  StatusType,
  SurpriseCardDef,
  Top5CategoryDef,
  Top5Def,
} from "../../shared/types.js";
import { WORLDS, CITTADELLA_ID } from "../data/worlds.js";
import { CARD_CATALOG, MAX_CARD_COPIES, pickRandomCards } from "../data/cards.js";
import { PACKS } from "../data/packs.js";
import {
  pickRandomQuestion,
  pickRandomQuestionByCategory,
  QUESTION_CATEGORIES,
  QuizQuestionInternal,
} from "../data/questions.js";
import { drawRandomSurprise } from "../data/surprises.js";
import { pickRandomCategory, pickRandomTop5InCategory, isTop5WorldExhausted } from "../data/top5.js";
import { CARO_AMICO_PERSONE } from "../../shared/caroAmicoPersone.js";
import { pickRandomPersonaExcluding, pickRandomDomanda, isCaroAmicoWorldExhausted } from "../data/caroAmico.js";
import { pickRandomTctQuestions, isTctWorldExhausted, TctQuestionInternal } from "../data/tct.js";
import { pickRandomOchoCategory, pickRandomOchoGameInCategory, shuffleOchoGame, isOchoWorldExhausted } from "../data/ocho.js";
import {
  pickRandomDuckCategory,
  getDuckQuestions,
  shuffleDuckQuestions,
  shuffleDuckPrizes,
  isDuckWorldExhausted,
  DuckQuestionInternal,
} from "../data/duck.js";
import {
  pickRandomParticolareCategory,
  pickRandomParticolareItems,
  isParticolareWorldExhausted,
} from "../data/particolare.js";
import { pickRandomBuzzCategory, pickRandomBuzzItem, isBuzzWorldExhausted } from "../data/buzz.js";
import {
  pickRandomSfidaGinoCategory,
  pickRandomSfidaGinoFlags,
  pickRandomSfidaGinoCapitals,
  isSfidaGinoWorldExhausted,
} from "../data/sfidaGino.js";
import { BOARD_EDGES, edgeById, neighborsOf, availableNeighborsOf, absoluteTileIndex } from "../../shared/board.js";
import { writeSave, deleteSave } from "./saveStore.js";

type IOServer = Server<ClientToServerEvents, ServerToClientEvents>;

interface PendingChoice {
  kind:
    | "stealCoins"
    | "swapPosition"
    | "discardCard"
    | "stealAllFromTwo"
    | "swapZeroTripleWin"
    | "chooseCategory"
    | "forceSkipTurn"
    | "discardFromChosen"
    | "advanceThreeDirection"
    | "moveBackwardChosen";
  amount?: number;
  targets?: string[]; // bersagli già scelti, per le scelte a più passaggi
}

interface PendingShieldContext {
  message: string;
  resolve: (blocked: boolean) => void;
}

// Stato del round di TCT (mondo "abisso") in corso, se c'è: NON è legato a
// un singolo giocatore come pendingTop5/pendingCaroAmico, perché è un
// evento di partita che coinvolge contemporaneamente più giocatori.
interface PendingTct {
  triggeredByPlayerId: string; // chi ha fatto scattare l'evento atterrando sul mondo
  participantIds: string[]; // giocatori con >=100 monete al momento dell'iscrizione
  potTotal: number;
  questions: TctQuestionInternal[]; // le domande pescate per questo round (di solito 4)
  currentQuestionIndex: number; // -1 prima che inizi la prima domanda
  currentAnswers: Map<string, { index: number; atMs: number }>; // risposte alla domanda corrente
  questionStartedAt: number; // Date.now() di quando è partita la domanda corrente
  timer: ReturnType<typeof setTimeout> | null;
  totalPoints: Map<string, number>; // punteggio cumulato per giocatore
}

// Stato di un round di OCHO ALLA BOMBA (mondo "deserto") in corso per un
// giocatore: a differenza di Top5/CaroAmico, qui è il giocatore stesso (non
// l'host) a selezionare le celle, quindi non serve nessuna versione "solo
// host" nascosta: la bomba resta segreta a tutti finché non viene rivelata
// da un clic (o dall'auto-reveal quando resta scoperta solo lei).
interface PendingOchoCell {
  text: string;
  revealed: boolean;
  isBomb: boolean; // significativo solo se revealed è true
}

interface PendingOcho {
  gameId: string; // per capire, dopo l'animazione, se è ancora lo stesso gioco pescato
  categoryId: string;
  categoryName: string;
  categoryEmoji: string;
  prompt: string;
  cells: PendingOchoCell[]; // esattamente 9, ordine già rimescolato
  bombIndex: number; // indice della bomba DENTRO cells (post-rimescolamento)
  safeRevealedCount: number;
  ended: boolean; // true quando non si può più selezionare (bomba trovata, o restava solo lei)
}

// Stato di un round di ACCHIAPPA LA PAPERA (mondo "ghiacciaia") in corso per
// un giocatore. A differenza di TUTTI gli altri minigiochi dedicati, qui
// l'host non interviene mai: sia l'esito del quiz sia l'assegnazione delle
// monete della griglia premi sono calcolati e applicati in automatico dal
// server (vedi answerDuck/selectDuckCell più sotto).
interface PendingDuckCell {
  prize: number;
  revealed: boolean;
  chosen: boolean;
}

interface PendingDuck {
  categoryId: string;
  categoryName: string;
  categoryEmoji: string;
  questions: DuckQuestionInternal[]; // esattamente 4, già rimescolate (opzioni comprese)
  questionIndex: number; // -1 prima che parta la prima domanda
  correctCount: number;
  wrongCount: number;
  awaitingAnswer: boolean; // true finché non risponde alla domanda corrente
  grid: PendingDuckCell[] | null; // valorizzata solo dopo essersi qualificato (3 corrette su 4)
  ended: boolean; // true a griglia rivelata (scelta fatta), oppure a quiz fallito
}

// Stato di un round di GRANDIOSO QUIZ PARTICOLARE (mondo "foresta") in corso.
// Gioca solo il giocatore di turno, che risponde A VOCE: come in CaroAmico/
// Ocho, è l'host a gestire i controlli (prossima domanda / svela risposta /
// assegna monete). Un solo premio finale (0/50/100) per l'intero round di 2
// domande, non uno a domanda.
interface PendingParticolareItem {
  id: string;
  answer: string;
  media:
    | { kind: "image"; detailUrl: string; fullUrl: string }
    | { kind: "youtube"; videoId: string };
}

interface PendingParticolare {
  categoryId: ParticolareCategoryId;
  categoryName: string;
  categoryEmoji: string;
  items: PendingParticolareItem[]; // esattamente 2
  questionIndex: number; // 0 oppure 1
  revealed: boolean; // true dopo che l'host ha svelato la risposta della domanda corrente
}

// Stato di IL GRANDIOSO BUZZ (mondo "cieli") in corso: a differenza di
// GRANDIOSO QUIZ PARTICOLARE gioca TUTTA la sala insieme, non solo il
// giocatore di turno, quindi questo stato vive a livello di SESSIONE (non su
// un singolo InternalPlayer). Il giocatore che ha fatto atterrare la pedina
// su "cieli" (triggeringPlayerId) resta comunque quello a cui, alla fine, si
// chiude pendingWorldId e si fa avanzare il turno: gli altri partecipano solo
// premendo il buzzer. Una sola domanda per round, che vale fissa 100 monete.
interface PendingBuzz {
  triggeringPlayerId: string;
  categoryId: ParticolareCategoryId;
  categoryName: string;
  categoryEmoji: string;
  item: PendingParticolareItem;
  started: boolean; // true quando l'host ha avviato la domanda vera dopo la schermata di categoria
  revealed: boolean;
  buzzOrder: string[]; // playerId in ordine di pressione del buzzer
}

interface PendingSfidaGinoRound {
  itemId: string; // per l'esclusione, non ripetere lo stesso stato nella stessa partita
  prompt: SfidaGinoPrompt;
  answer: string;
}

// Stato di un round di SFIDA GINO (mondo "rovine") in corso. Gioca solo il
// giocatore di turno, a voce, come in Grandioso Quiz Particolare: una ruota
// estrae una fra 2 categorie (Indovina la Capitale / Indovina la Bandiera),
// poi si gioca AL MEGLIO DI 3 domande all'interno di quella stessa categoria
// (stesso pattern di questionIndex/revealed di Particolare, ma con 3 item
// invece di 2). Premio fisso e binario: 2000 monete oppure 0, deciso
// dall'host solo alla fine, in base a quante ne ha indovinate a voce.
interface PendingSfidaGino {
  categoryId: SfidaGinoCategoryId;
  categoryName: string;
  categoryEmoji: string;
  rounds: PendingSfidaGinoRound[]; // esattamente 3
  questionIndex: number; // 0, 1 oppure 2
  revealed: boolean; // true dopo che l'host ha svelato la risposta della domanda corrente
}

interface InternalPlayer {
  id: string;
  socketId: string;
  clientId: string;
  connected: boolean;
  token: PawnToken | null;
  name: string;
  isHost: boolean;
  // Solo l'host può attivarla (vedi GameSession.setSpectator), solo nella
  // lobby: niente pedina, esclus* dall'ordine dei turni, dalla partita vera
  // e propria e dalla classifica finale. Gestisce il gioco senza giocarci.
  isSpectator: boolean;
  coins: number;
  boardPosition: BoardPosition;
  pendingRoll: number | null;
  pendingShop: boolean;
  collection: OwnedCard[];
  activeEffects: CardEffectType[];
  statuses: PlayerStatus[];
  pendingQuestion: QuizQuestionInternal | null;
  pendingWorldId: string | null; // mondo in cui si trova mentre risolve un minigioco
  awaitingWheelStart: boolean; // sulla schermata di benvenuto, in attesa che clicchi "Ok iniziamo"
  awaitingQuizStart: boolean; // sulla schermata di risultato ruota, in attesa che clicchi "Ok iniziamo"
  pendingSurprise: SurpriseCardDef | null; // imprevisto pescato ma non ancora applicato
  pendingChoice: PendingChoice | null; // in attesa che scelga un bersaglio (giocatore/carta)
  cardsUsedThisTurn: Set<string>; // cardId già attivati in questo turno (una copia per nome a turno)
  bonusRolls: number; // tiri extra garantiti in questo turno (es. da una figurina)
  pendingTop5: {
    def: Top5Def;
    category: Top5CategoryDef;
    revealed: boolean[];
    heartsBroken: number;
  } | null;
  awaitingTop5Start: boolean; // sulla schermata di conferma categoria, in attesa che clicchi "Ok iniziamo"
  forcedNextCategory: string | null; // categoria scelta per il prossimo quiz (Nuvola)
  pendingShieldContext: PendingShieldContext | null; // in attesa che decida se usare uno scudo
  caroAmicoSelfId: string | null; // quale persona rappresenta questo giocatore nel mondo "officina": la ruota non la estrarrà mai per lui
  awaitingCaroAmicoSelfChoice: boolean; // sul menu "chi sei tu?" prima della ruota di CARO AMICO TI SCRIVO
  pendingCaroAmico: {
    domanda: CaroAmicoDomandaDef;
    persona: CaroAmicoPersonaDef;
    revealed: boolean;
  } | null;
  awaitingCaroAmicoStart: boolean; // sulla schermata di conferma persona pescata, in attesa che clicchi "Ok iniziamo"
  pendingOcho: PendingOcho | null;
  awaitingOchoStart: boolean; // sulla schermata di conferma categoria, in attesa che clicchi "Ok iniziamo"
  pendingDuck: PendingDuck | null;
  awaitingDuckStart: boolean; // sulla schermata di conferma categoria, in attesa che clicchi "Ok iniziamo"
  pendingParticolare: PendingParticolare | null;
  awaitingParticolareStart: boolean; // sulla schermata di conferma categoria, in attesa che il giocatore di turno clicchi "Ok iniziamo"
  pendingSfidaGino: PendingSfidaGino | null;
  awaitingSfidaGinoStart: boolean; // sulla schermata di conferma categoria, in attesa che il giocatore di turno clicchi "Ok iniziamo"
}

// Formato salvato su disco da GameSession.saveGame (vedi anche
// GameSession.serialize/deserialize più sotto). Contiene solo progressi
// "permanenti": monete, figurine, posizione sul tabellone, mondi esauriti,
// turni. Qualsiasi minigioco/scelta in corso NON viene mai salvato: prima di
// scrivere su disco, saveGame riporta tutti i giocatori a uno stato
// "neutro", pronti per il turno successivo (vedi commento su saveGame).
interface SerializedPlayer {
  id: string;
  clientId: string;
  token: PawnToken | null;
  name: string;
  isHost: boolean;
  isSpectator: boolean;
  coins: number;
  boardPosition: BoardPosition;
  collection: OwnedCard[];
  activeEffects: CardEffectType[];
  statuses: PlayerStatus[];
  caroAmicoSelfId: string | null;
  forcedNextCategory: string | null;
  bonusRolls: number;
  cardsUsedThisTurn: string[];
}

export interface SerializedGameSession {
  code: string;
  turnOrder: string[];
  currentTurnIndex: number;
  phase: "lobby" | "playing" | "finalRound" | "ended";
  players: SerializedPlayer[];
  playedTop5Ids: string[];
  playedTctQuestionIds: string[];
  playedOchoIds: string[];
  playedDuckCategoryIds: string[];
  playedParticolareItemIds: string[];
  playedBuzzItemIds: string[];
  playedSfidaGinoFlagIds: string[];
  playedSfidaGinoCapitalIds: string[];
  playedCaroAmicoDomandaIds: string[];
  deactivatedWorldIds: string[];
  finalRoundPlayerIds: string[];
  finalRoundDoneIds: string[];
  finalRoundIndex: number;
  lastGameEndedPayload: GameEndedPayload | null;
}

const BASE_REWARD = 20;
const TOP5_REWARD = 100;
const CARO_AMICO_REWARD = 80;
const WRONG_REWARD = 0;
const TCT_ENTRY_FEE = 100;
const TCT_QUESTION_COUNT = 4;
const TCT_TIME_LIMIT_SEC = 10;
const TCT_REVEAL_DELAY_MS = 3500;
const TCT_INTRO_DELAY_MS = 2200;
const OCHO_VALID_REWARDS = [0, 50, 100];
const PARTICOLARE_VALID_REWARDS = [0, 50, 100];
const BUZZ_REWARD = 100; // premio fisso: una sola domanda, un solo vincitore (o nessuno)
const SFIDA_GINO_REWARD = 2000; // premio fisso e binario: 2000 o 0, deciso dall'host
const FINAL_ROUND_BONUS_COINS = 1000; // bonus per il giro finale, quando tutti i mondi sono esauriti

let playerIdCounter = 0;
function nextPlayerId() {
  playerIdCounter += 1;
  return `p${playerIdCounter}-${Date.now().toString(36)}`;
}

let cardInstanceCounter = 0;
function nextCardInstanceId() {
  cardInstanceCounter += 1;
  return `c${cardInstanceCounter}-${Date.now().toString(36)}`;
}

let statusIdCounter = 0;
function nextStatusId() {
  statusIdCounter += 1;
  return `st${statusIdCounter}-${Date.now().toString(36)}`;
}

export class GameSession {
  readonly code: string;
  private players = new Map<string, InternalPlayer>();
  private turnOrder: string[] = [];
  private currentTurnIndex = 0;
  private phase: "lobby" | "playing" | "finalRound" | "ended" = "lobby";
  // Id delle top5 già giocate in questa partita: una volta pescata, una top5
  // non deve più poter ricapitare finché la partita è in corso (vedi
  // beginTop5 più sotto, e pickRandomCategory/pickRandomTop5InCategory in
  // server/data/top5.ts che la usano per escludere le top5 già viste).
  private playedTop5Ids = new Set<string>();
  // Round di TCT in corso (se c'è) e id delle domande TCT già uscite in
  // questa partita, per lo stesso motivo di playedTop5Ids: non far mai
  // ripetere la stessa domanda finché la partita è in corso.
  private pendingTct: PendingTct | null = null;
  private playedTctQuestionIds = new Set<string>();
  // Id dei giochi di OCHO ALLA BOMBA già usciti in questa partita, stesso
  // motivo di playedTop5Ids/playedTctQuestionIds.
  private playedOchoIds = new Set<string>();
  // Id delle categorie di ACCHIAPPA LA PAPERA già uscite in questa partita,
  // stesso motivo di playedOchoIds.
  private playedDuckCategoryIds = new Set<string>();
  private playedParticolareItemIds = new Set<string>();
  private playedBuzzItemIds = new Set<string>();
  private pendingBuzz: PendingBuzz | null = null;
  private playedSfidaGinoFlagIds = new Set<string>();
  private playedSfidaGinoCapitalIds = new Set<string>();
  private playedCaroAmicoDomandaIds = new Set<string>();
  // Mondi le cui domande sono TUTTE finite (ogni categoria esaurita): il
  // mondo e i suoi 3 ponti (1 raggio + 2 anelli) restano disattivati per il
  // resto della partita. Vedi deactivateWorld più sotto.
  private deactivatedWorldIds = new Set<string>();
  // Giro finale (fase "finalRound"): quando TUTTI gli 8 mondi sono
  // disattivati, si torna alla Cittadella con un bonus di monete e ogni
  // giocatore ha un solo turno di shopping, in questo ordine; chi lo ha già
  // fatto è qui dentro. Vedi startFinalRound/finishGame più sotto.
  private finalRoundPlayerIds: string[] = [];
  private finalRoundDoneIds = new Set<string>();
  private finalRoundIndex = 0;
  // Ultima classifica finale calcolata (fase "ended"): rimandata a chi si
  // ricollega dopo la fine della partita, vedi resendPendingScreens.
  private lastGameEndedPayload: GameEndedPayload | null = null;

  constructor(code: string) {
    this.code = code;
  }

  get isEmpty() {
    return this.players.size === 0 || [...this.players.values()].every((p) => !p.connected);
  }

  addPlayer(socketId: string, name: string, clientId: string): InternalPlayer {
    // se questo browser era già un giocatore di questa partita (stesso clientId),
    // lo riagganciamo al nuovo socket senza perdere i suoi progressi
    const existing = [...this.players.values()].find((p) => p.clientId === clientId);
    if (existing) {
      existing.socketId = socketId;
      existing.connected = true;
      return existing;
    }

    const isHost = this.players.size === 0;
    const player: InternalPlayer = {
      id: nextPlayerId(),
      socketId,
      clientId,
      connected: true,
      token: null,
      name: name.trim().slice(0, 20) || "Giocatore",
      isHost,
      isSpectator: false,
      coins: 0,
      boardPosition: { nodeId: CITTADELLA_ID, onNode: true },
      pendingRoll: null,
      pendingShop: false,
      collection: [],
      activeEffects: [],
      statuses: [],
      pendingQuestion: null,
      pendingWorldId: null,
      awaitingWheelStart: false,
      awaitingQuizStart: false,
      pendingSurprise: null,
      pendingChoice: null,
      pendingShieldContext: null,
      cardsUsedThisTurn: new Set(),
      bonusRolls: 0,
      pendingTop5: null,
      awaitingTop5Start: false,
      forcedNextCategory: null,
      caroAmicoSelfId: null,
      awaitingCaroAmicoSelfChoice: false,
      pendingCaroAmico: null,
      awaitingCaroAmicoStart: false,
      pendingOcho: null,
      awaitingOchoStart: false,
      pendingDuck: null,
      awaitingDuckStart: false,
      pendingParticolare: null,
      awaitingParticolareStart: false,
      pendingSfidaGino: null,
      awaitingSfidaGinoStart: false,
    };
    this.players.set(player.id, player);
    this.turnOrder.push(player.id); // l'ordine dei turni si fissa all'ingresso e non cambia
    return player;
  }

  // Chiamato quando un socket si disconnette: NON rimuove il giocatore dalla
  // partita (i suoi progressi restano), lo segna solo come offline finché
  // non rientra con lo stesso codice.
  markDisconnected(playerId: string) {
    const player = this.players.get(playerId);
    if (player) player.connected = false;
  }

  // Se chi rientra era sulla schermata di benvenuto o su quella di risultato
  // della ruota, gliele rimanda così può continuare da dove aveva lasciato.
  resendPendingScreens(playerId: string, io: IOServer) {
    const player = this.players.get(playerId);
    if (!player) return;

    // Partita già conclusa (tutti i mondi esauriti + giro finale finito): chi
    // si ricollega deve rivedere subito la classifica finale, non le
    // schermate del gioco che nel frattempo non esistono più.
    if (this.phase === "ended" && this.lastGameEndedPayload) {
      io.to(player.socketId).emit("game:ended", this.lastGameEndedPayload);
      return;
    }

    if (player.awaitingWheelStart && player.pendingWorldId) {
      io.to(player.socketId).emit("world:welcome", {
        playerId: player.id,
        worldId: player.pendingWorldId,
      });
    } else if (player.awaitingQuizStart && player.pendingWorldId) {
      io.to(player.socketId).emit("wheel:result", {
        playerId: player.id,
        worldId: player.pendingWorldId,
        resultType: "quiz",
      });
    } else if (player.pendingSurprise) {
      io.to(player.socketId).emit("board:surpriseDrawn", {
        playerId: player.id,
        text: player.pendingSurprise.text,
        effectLabel: player.pendingSurprise.effectLabel,
      });
    } else if (player.pendingChoice) {
      this.emitChoiceOptions(player, io);
    } else if (player.pendingShieldContext) {
      io.to(player.socketId).emit("board:useShieldPrompt", {
        message: player.pendingShieldContext.message,
      });
    }

    // Se una top5 è in corso (di chiunque), rimanda anche quella a chi
    // rientra: schermata di conferma categoria, o vista di gioco (completa
    // se è l'host, altrimenti nascosta).
    const top5Player = [...this.players.values()].find((p) => p.pendingTop5);
    if (top5Player?.awaitingTop5Start) {
      const { category } = top5Player.pendingTop5!;
      io.to(player.socketId).emit("top5:categoryDrawn", {
        playerId: top5Player.id,
        categoryId: category.id,
        categoryName: category.name,
        categoryEmoji: category.emoji,
      });
    } else if (top5Player?.pendingTop5) {
      const { def, revealed, heartsBroken } = top5Player.pendingTop5;
      const slots = def.answers.map((answer, i) => ({
        rank: i + 1,
        answer: revealed[i] ? answer : null,
      }));
      io.to(player.socketId).emit("top5:state", {
        playerId: top5Player.id,
        title: def.title,
        slots,
        heartsBroken,
        source: def.source,
        fullAnswers: player.isHost ? def.answers : undefined,
      });
    }

    // Stessa cosa per "Caro amico ti scrivo" (mondo "officina"): menu di
    // scelta persona, schermata di conferma persona pescata, o vista di
    // gioco (completa se è l'host, altrimenti nascosta).
    const caroAmicoSelfPlayer = [...this.players.values()].find(
      (p) => p.id === player.id && p.awaitingCaroAmicoSelfChoice
    );
    if (caroAmicoSelfPlayer) {
      io.to(player.socketId).emit("caroamico:selfChoicePrompt", {
        playerId: player.id,
        personas: CARO_AMICO_PERSONE,
        currentSelfId: player.caroAmicoSelfId,
      });
    }
    const caroAmicoPlayer = [...this.players.values()].find((p) => p.pendingCaroAmico);
    if (caroAmicoPlayer?.awaitingCaroAmicoStart) {
      const { persona } = caroAmicoPlayer.pendingCaroAmico!;
      io.to(player.socketId).emit("caroamico:personaDrawn", {
        playerId: caroAmicoPlayer.id,
        personaId: persona.id,
        personaName: persona.name,
        personaEmoji: persona.emoji,
      });
    } else if (caroAmicoPlayer?.pendingCaroAmico) {
      const { domanda, persona, revealed } = caroAmicoPlayer.pendingCaroAmico;
      const correctAnswer = domanda.answers[persona.id];
      io.to(player.socketId).emit("caroamico:state", {
        playerId: caroAmicoPlayer.id,
        personaId: persona.id,
        personaName: persona.name,
        personaEmoji: persona.emoji,
        question: domanda.question,
        revealed,
        answer: revealed ? correctAnswer : null,
        fullAnswer: player.isHost ? correctAnswer : undefined,
      });
    }

    // Stessa cosa per OCHO ALLA BOMBA (mondo "deserto"): schermata di
    // conferma categoria, o griglia di gioco (uguale per tutti, host
    // compreso: non c'è nulla da nascondere selettivamente, la bomba resta
    // segreta finché non viene rivelata da un clic).
    const ochoPlayer = [...this.players.values()].find((p) => p.pendingOcho);
    if (ochoPlayer?.awaitingOchoStart) {
      const { categoryId, categoryName, categoryEmoji } = ochoPlayer.pendingOcho!;
      io.to(player.socketId).emit("ocho:categoryDrawn", {
        playerId: ochoPlayer.id,
        categoryId,
        categoryName,
        categoryEmoji,
      });
    } else if (ochoPlayer?.pendingOcho) {
      io.to(player.socketId).emit("ocho:state", this.buildOchoStatePayload(ochoPlayer));
    }

    // Stessa cosa per ACCHIAPPA LA PAPERA (mondo "ghiacciaia"): schermata di
    // conferma categoria, griglia premi già aperta, oppure domanda del quiz
    // attualmente in corso (l'eventuale lampeggio verde/rosso della risposta
    // appena data non viene rimandato: è un dettaglio transitorio, stesso
    // trattamento riservato a top5/caroamico/tct su riconnessione).
    const duckPlayer = [...this.players.values()].find((p) => p.pendingDuck);
    if (duckPlayer?.awaitingDuckStart) {
      const { categoryId, categoryName, categoryEmoji } = duckPlayer.pendingDuck!;
      io.to(player.socketId).emit("duck:categoryDrawn", {
        playerId: duckPlayer.id,
        categoryId,
        categoryName,
        categoryEmoji,
      });
    } else if (duckPlayer?.pendingDuck?.grid) {
      io.to(player.socketId).emit("duck:gridState", this.buildDuckGridPayload(duckPlayer));
    } else if (duckPlayer?.pendingDuck && duckPlayer.pendingDuck.questionIndex >= 0) {
      const duck = duckPlayer.pendingDuck;
      const q = duck.questions[duck.questionIndex];
      io.to(player.socketId).emit("duck:question", {
        playerId: duckPlayer.id,
        categoryName: duck.categoryName,
        categoryEmoji: duck.categoryEmoji,
        questionIndex: duck.questionIndex,
        totalQuestions: duck.questions.length,
        question: { question: q.question, options: q.options },
        correctSoFar: duck.correctCount,
        wrongSoFar: duck.wrongCount,
      });
    }

    // Stessa cosa per GRANDIOSO QUIZ PARTICOLARE (mondo "foresta"): schermata
    // di conferma categoria, oppure la domanda corrente (con risposta
    // rivelata o meno a seconda di dove si era arrivati).
    const particolarePlayer = [...this.players.values()].find((p) => p.pendingParticolare);
    if (particolarePlayer?.awaitingParticolareStart) {
      const { categoryId, categoryName, categoryEmoji } = particolarePlayer.pendingParticolare!;
      io.to(player.socketId).emit("particolare:categoryDrawn", {
        playerId: particolarePlayer.id,
        categoryId,
        categoryName,
        categoryEmoji,
      });
    } else if (particolarePlayer?.pendingParticolare) {
      io.to(player.socketId).emit(
        "particolare:question",
        this.buildParticolareQuestionPayload(particolarePlayer)
      );
    }

    // Stessa cosa per IL GRANDIOSO BUZZ (mondo "cieli"): a differenza degli
    // altri minigiochi lo stato vive a livello di sessione (this.pendingBuzz),
    // non su un singolo giocatore, perché gioca tutta la sala insieme.
    if (this.pendingBuzz && !this.pendingBuzz.started) {
      io.to(player.socketId).emit("buzz:categoryDrawn", {
        categoryId: this.pendingBuzz.categoryId,
        categoryName: this.pendingBuzz.categoryName,
        categoryEmoji: this.pendingBuzz.categoryEmoji,
      });
    } else if (this.pendingBuzz?.started) {
      io.to(player.socketId).emit("buzz:question", this.buildBuzzQuestionPayload());
    }

    // Stessa cosa per SFIDA GINO (mondo "rovine"): schermata di conferma
    // categoria, oppure la domanda corrente (con risposta rivelata o meno).
    const sfidaGinoPlayer = [...this.players.values()].find((p) => p.pendingSfidaGino);
    if (sfidaGinoPlayer?.awaitingSfidaGinoStart) {
      const { categoryId, categoryName, categoryEmoji } = sfidaGinoPlayer.pendingSfidaGino!;
      io.to(player.socketId).emit("sfidaGino:categoryDrawn", {
        playerId: sfidaGinoPlayer.id,
        categoryId,
        categoryName,
        categoryEmoji,
      });
    } else if (sfidaGinoPlayer?.pendingSfidaGino) {
      io.to(player.socketId).emit(
        "sfidaGino:question",
        this.buildSfidaGinoQuestionPayload(sfidaGinoPlayer)
      );
    }

    // Se un round di TCT (mondo "abisso") è in corso, rimanda la domanda
    // attualmente aperta a chi rientra (approssimando il tempo rimasto:
    // non è perfettamente sincronizzato, ma il timer vero resta lato
    // server ed è quello che conta davvero).
    if (this.pendingTct && this.pendingTct.currentQuestionIndex >= 0) {
      const tct = this.pendingTct;
      const q = tct.questions[tct.currentQuestionIndex];
      if (q) {
        io.to(player.socketId).emit("tct:question", {
          questionIndex: tct.currentQuestionIndex,
          totalQuestions: tct.questions.length,
          question: { question: q.question, options: q.options },
          timeLimitSec: TCT_TIME_LIMIT_SEC,
          participantIds: tct.participantIds,
        });
      }
    }
  }

  // Se chi rientra aveva una domanda del quiz ancora aperta al momento della
  // disconnessione, gliela rimanda così può continuare a rispondere.
  resendPendingQuestion(playerId: string, io: IOServer) {
    const player = this.players.get(playerId);
    if (!player || !player.pendingQuestion) return;
    const q = player.pendingQuestion;
    io.to(player.socketId).emit("quiz:question", {
      playerId: player.id,
      question: {
        id: q.id,
        category: q.category,
        question: q.question,
        options: q.options,
        timeLimitSec: q.timeLimitSec,
      },
      activeEffects: player.activeEffects,
    });
  }

  findBySocket(socketId: string): InternalPlayer | undefined {
    for (const p of this.players.values()) {
      if (p.socketId === socketId) return p;
    }
    return undefined;
  }

  removePlayer(playerId: string) {
    this.players.delete(playerId);
    const idx = this.turnOrder.indexOf(playerId);
    if (idx !== -1) {
      this.turnOrder.splice(idx, 1);
      if (this.turnOrder.length > 0) {
        this.currentTurnIndex = this.currentTurnIndex % this.turnOrder.length;
      } else {
        this.currentTurnIndex = 0;
      }
    }
    // promuovi un nuovo host se serve
    if (![...this.players.values()].some((p) => p.isHost)) {
      const next = this.players.values().next().value;
      if (next) next.isHost = true;
    }
  }

  private currentTurnPlayerId(): string | null {
    if (this.phase === "finalRound") {
      // Il giro finale ha un proprio ordine (solo i giocatori connessi
      // all'inizio del giro, vedi startFinalRound) e un proprio indice
      // (finalRoundIndex), indipendente da turnOrder/currentTurnIndex: così
      // un eventuale giocatore disconnesso non blocca mai il giro finale.
      if (this.finalRoundPlayerIds.length === 0) return null;
      return this.finalRoundPlayerIds[this.finalRoundIndex % this.finalRoundPlayerIds.length];
    }
    if (this.turnOrder.length === 0) return null;
    return this.turnOrder[this.currentTurnIndex % this.turnOrder.length];
  }

  private advanceTurn() {
    if (this.turnOrder.length === 0) return;
    this.currentTurnIndex = (this.currentTurnIndex + 1) % this.turnOrder.length;
  }

  // Avanza il turno e, se il nuovo giocatore di turno ha lo stato "salta
  // prossimo turno", lo consuma e passa oltre di nuovo (a catena, se per
  // assurdo ne avesse più di uno).
  private advanceTurnAndHandleSkips(io: IOServer) {
    const outgoing = this.players.get(this.currentTurnPlayerId() ?? "");
    if (outgoing) outgoing.bonusRolls = 0;

    this.advanceTurn();
    let guard = 0;
    while (guard <= this.turnOrder.length) {
      const currentId = this.currentTurnPlayerId();
      if (!currentId) break;
      const current = this.players.get(currentId);
      if (!current) break;
      const idx = current.statuses.findIndex((s) => s.type === "skipTurn");
      if (idx === -1) break;
      current.statuses.splice(idx, 1);
      this.advanceTurn();
      guard++;
    }
    const newCurrent = this.players.get(this.currentTurnPlayerId() ?? "");
    if (newCurrent) newCurrent.cardsUsedThisTurn = new Set();
  }

  private addStatus(
    player: InternalPlayer,
    type: StatusType,
    label: string,
    emoji: string,
    description?: string
  ) {
    player.statuses.push({ id: nextStatusId(), type, label, emoji, description });
  }

  // Controlla se il giocatore possiede (in collezione) una figurina con un
  // determinato effetto passivo. Essendo le passive limitate a 1 copia, non
  // serve contare quante ne ha: basta sapere se ce l'ha o no.
  private hasPassiveEffect(player: InternalPlayer, type: CardEffectType): boolean {
    return player.collection.some((owned) => {
      const def = CARD_CATALOG.find((c) => c.id === owned.cardId);
      return !!def?.effect?.isPassive && def.effect.type === type;
    });
  }

  // Controlla la collezione del giocatore per figurine con effetto passivo
  // (sempre attive finché possedute, non vanno "usate") e le applica. Ogni
  // copia posseduta conta separatamente.
  private applyPassiveCardEffects(player: InternalPlayer) {
    for (const owned of player.collection) {
      const def = CARD_CATALOG.find((c) => c.id === owned.cardId);
      if (!def?.effect?.isPassive) continue;

      if (def.effect.type === "passiveFreeChest") {
        this.addStatus(
          player,
          "freeChest",
          "Baule gratis",
          "🎁",
          "Il prossimo Baule del Mercante comprato alla Cittadella non costa nulla."
        );
      }
      // altri effetti passivi futuri si aggiungono qui
    }
  }

  getSnapshot(forPlayerId: string): GameStateSnapshot | null {
    const me = this.players.get(forPlayerId);
    if (!me) return null;

    // gli spettatori non hanno una pedina sul tabellone: niente posizione da
    // mandare al client, così non compare nessun segnalino per loro
    const positions: Record<string, BoardPosition> = {};
    for (const p of this.players.values()) {
      if (!p.isSpectator) positions[p.id] = p.boardPosition;
    }

    return {
      code: this.code,
      phase: this.phase,
      worlds: WORLDS,
      packs: PACKS,
      cardCatalog: CARD_CATALOG,
      board: { edges: BOARD_EDGES },
      turnOrder: this.turnOrder,
      currentTurnPlayerId: this.currentTurnPlayerId(),
      positions,
      deactivatedWorldIds: [...this.deactivatedWorldIds],
      players: [...this.players.values()].map((p) => ({
        id: p.id,
        name: p.name,
        coins: p.coins,
        isHost: p.isHost,
        isSpectator: p.isSpectator,
        connected: p.connected,
        token: p.token,
        activeEffects: p.activeEffects,
        statuses: p.statuses,
        cardCount: p.collection.length,
      })),
      me: {
        id: me.id,
        name: me.name,
        coins: me.coins,
        isHost: me.isHost,
        isSpectator: me.isSpectator,
        connected: me.connected,
        token: me.token,
        activeEffects: me.activeEffects,
        statuses: me.statuses,
        cardCount: me.collection.length,
        collection: me.collection,
        pendingRoll: me.pendingRoll,
        pendingShop: me.pendingShop,
        cardsUsedThisTurn: [...me.cardsUsedThisTurn],
      },
    };
  }

  broadcastState(io: IOServer) {
    for (const p of this.players.values()) {
      const snap = this.getSnapshot(p.id);
      if (snap) io.to(p.socketId).emit("state:update", snap);
    }
  }

  startGame(playerId: string, io: IOServer) {
    const player = this.players.get(playerId);
    if (!player) return;
    if (!player.isHost) {
      io.to(player.socketId).emit("error:message", {
        message: "Solo l'host può avviare la partita.",
      });
      return;
    }
    if (this.phase === "playing") return;
    const activePlayers = [...this.players.values()].filter((p) => !p.isSpectator);
    if (activePlayers.length === 0) {
      io.to(player.socketId).emit("error:message", {
        message: "Serve almeno un giocatore (oltre agli eventuali spettatori) per iniziare.",
      });
      return;
    }
    if (activePlayers.some((p) => p.token === null)) {
      io.to(player.socketId).emit("error:message", {
        message: "Tutti i giocatori devono scegliere una pedina prima di iniziare.",
      });
      return;
    }

    // mescola casualmente l'ordine dei turni (Fisher-Yates); this.turnOrder
    // esclude già gli spettatori (vedi setSpectator)
    for (let i = this.turnOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.turnOrder[i], this.turnOrder[j]] = [this.turnOrder[j], this.turnOrder[i]];
    }
    this.currentTurnIndex = 0;
    this.phase = "playing";
    this.broadcastState(io);
  }

  chooseToken(playerId: string, token: PawnToken, io: IOServer) {
    const player = this.players.get(playerId);
    if (!player) return;
    if (this.phase !== "lobby") {
      io.to(player.socketId).emit("error:message", {
        message: "Non puoi cambiare pedina a partita iniziata.",
      });
      return;
    }
    if (player.isSpectator) {
      io.to(player.socketId).emit("error:message", {
        message: "Sei in modalità spettatore: non puoi scegliere una pedina.",
      });
      return;
    }
    const takenByOther = [...this.players.values()].some(
      (p) => p.id !== playerId && p.token === token
    );
    if (takenByOther) {
      io.to(player.socketId).emit("error:message", {
        message: "Questa pedina è già stata scelta da un altro giocatore.",
      });
      return;
    }
    player.token = token;
    this.broadcastState(io);
  }

  // Solo l'host, solo nella lobby: passa tra "giocatore" e "spettatore".
  // Da spettatore l'host può comunque gestire la partita (espellere,
  // impostare monete, salvare) ma non ha una pedina, non entra nell'ordine
  // dei turni e non partecipa alla partita vera e propria.
  setSpectator(playerId: string, spectator: boolean, io: IOServer) {
    const player = this.players.get(playerId);
    if (!player) return;
    if (!player.isHost) {
      io.to(player.socketId).emit("error:message", {
        message: "Solo l'host può scegliere di fare da spettatore.",
      });
      return;
    }
    if (this.phase !== "lobby") {
      io.to(player.socketId).emit("error:message", {
        message: "Non puoi cambiare modalità a partita iniziata.",
      });
      return;
    }

    player.isSpectator = spectator;
    if (spectator) {
      player.token = null;
      this.turnOrder = this.turnOrder.filter((id) => id !== playerId);
    } else if (!this.turnOrder.includes(playerId)) {
      this.turnOrder.push(playerId);
    }
    this.broadcastState(io);
  }

  // Espelle un giocatore dalla partita. Ritorna il socketId dell'espulso
  // (serve al chiamante per ripulire la mappa socket->giocatore) oppure
  // undefined se l'operazione non è stata eseguita.
  kickPlayer(hostId: string, targetId: string, io: IOServer): string | undefined {
    const host = this.players.get(hostId);
    if (!host) return undefined;
    if (!host.isHost) {
      io.to(host.socketId).emit("error:message", {
        message: "Solo l'host può espellere un giocatore.",
      });
      return undefined;
    }
    if (targetId === hostId) {
      io.to(host.socketId).emit("error:message", {
        message: "Non puoi espellere te stesso.",
      });
      return undefined;
    }
    const target = this.players.get(targetId);
    if (!target) return undefined;

    const targetSocketId = target.socketId;
    io.to(targetSocketId).emit("party:kicked");
    this.removePlayer(targetId);
    this.broadcastState(io);
    return targetSocketId;
  }

  setPlayerCoins(hostId: string, targetId: string, amount: number, io: IOServer) {
    const host = this.players.get(hostId);
    if (!host) return;
    if (!host.isHost) {
      io.to(host.socketId).emit("error:message", {
        message: "Solo l'host può modificare le monete.",
      });
      return;
    }
    const target = this.players.get(targetId);
    if (!target) return;

    target.coins = Math.max(0, Math.floor(amount));
    this.broadcastState(io);
  }

  rollDice(playerId: string, io: IOServer) {
    const player = this.players.get(playerId);
    if (!player) return;

    if (this.phase !== "playing") {
      io.to(player.socketId).emit("error:message", {
        message: "La partita non è ancora iniziata.",
      });
      return;
    }
    if (this.currentTurnPlayerId() !== playerId) {
      io.to(player.socketId).emit("error:message", {
        message: "Non è il tuo turno.",
      });
      return;
    }
    if (player.pendingQuestion) {
      io.to(player.socketId).emit("error:message", {
        message: "Devi prima concludere la prova in corso.",
      });
      return;
    }
    if (player.pendingRoll !== null) {
      io.to(player.socketId).emit("error:message", {
        message: "Conferma prima lo spostamento del tiro precedente.",
      });
      return;
    }

    const roll = 1 + Math.floor(Math.random() * 6);
    player.pendingRoll = roll;
    io.emit("board:diceRolled", { playerId, value: roll });
    this.broadcastState(io);
  }

  confirmMove(playerId: string, direction: string | undefined, io: IOServer) {
    const player = this.players.get(playerId);
    if (!player) return;

    if (this.currentTurnPlayerId() !== playerId) {
      io.to(player.socketId).emit("error:message", {
        message: "Non è il tuo turno.",
      });
      return;
    }
    if (player.pendingRoll === null) {
      io.to(player.socketId).emit("error:message", {
        message: "Devi prima tirare il dado.",
      });
      return;
    }

    const roll = player.pendingRoll;
    player.pendingRoll = null;
    this.movePlayer(player, roll, direction, io);
  }

  private movePlayer(
    player: InternalPlayer,
    roll: number,
    direction: string | undefined,
    io: IOServer
  ) {
    const pos = player.boardPosition;

    if (pos.onNode) {
      const neighbors = availableNeighborsOf(pos.nodeId, this.deactivatedWorldIds);
      const chosen =
        neighbors.find((n) => n.neighborId === direction) ?? neighbors[0];
      if (!chosen) return; // nodo isolato (o tutti i vicini disattivati), non dovrebbe succedere
      const edge = edgeById(chosen.edgeId);
      if (!edge) return;
      if (roll > edge.length) {
        player.boardPosition = { nodeId: chosen.neighborId, onNode: true };
      } else {
        player.boardPosition = {
          nodeId: pos.nodeId,
          onNode: false,
          edgeId: edge.id,
          progress: roll,
        };
      }
    } else {
      const edge = edgeById(pos.edgeId!);
      if (!edge) return;
      const destinationNodeId = edge.a === pos.nodeId ? edge.b : edge.a;
      const newProgress = (pos.progress ?? 0) + roll;
      if (newProgress > edge.length) {
        player.boardPosition = { nodeId: destinationNodeId, onNode: true };
      } else {
        player.boardPosition = {
          nodeId: pos.nodeId,
          onNode: false,
          edgeId: edge.id,
          progress: newProgress,
        };
      }
    }

    const landedNodeId = player.boardPosition.onNode
      ? player.boardPosition.nodeId
      : null;

    if (landedNodeId) {
      this.resolveArrival(player, landedNodeId, io);
    } else {
      this.checkSurpriseTileOrAdvance(player, io);
    }

    this.broadcastState(io);
  }

  // Fa avanzare il turno SOLO se il giocatore indicato è davvero quello di
  // turno in questo momento. Serve perché alcuni spostamenti (es. figurine a
  // effetto rapido usate fuori dal proprio turno) possono innescare questa
  // stessa logica di risoluzione senza che sia davvero il turno di nessuno
  // in particolare: in quel caso non tocchiamo affatto l'ordine dei turni.
  private maybeAdvanceTurn(player: InternalPlayer, io: IOServer) {
    if (this.currentTurnPlayerId() !== player.id) return;
    if (player.bonusRolls > 0) {
      player.bonusRolls -= 1;
      // il turno resta suo: può tirare di nuovo
      return;
    }
    this.advanceTurnAndHandleSkips(io);
  }

  // Controlla se la posizione attuale del giocatore (a metà ponte) è una
  // casella imprevisto: se sì pesca una carta e mostra la schermata,
  // altrimenti fa avanzare il turno normalmente. Usato sia dopo un tiro di
  // dado normale sia dopo uno spostamento causato da un altro imprevisto,
  // così gli imprevisti possono incatenarsi.
  private checkSurpriseTileOrAdvance(player: InternalPlayer, io: IOServer) {
    const pos = player.boardPosition;
    if (pos.onNode || !pos.edgeId || pos.progress === undefined) {
      this.maybeAdvanceTurn(player, io);
      return;
    }
    const edge = edgeById(pos.edgeId);
    const tileIndex = edge ? absoluteTileIndex(edge, pos.nodeId, pos.progress) : -1;
    const isSurprise = !!edge?.surprises.includes(tileIndex);

    if (isSurprise) {
      const card = drawRandomSurprise();
      player.pendingSurprise = card;
      io.emit("board:surpriseDrawn", {
        playerId: player.id,
        text: card.text,
        effectLabel: card.effectLabel,
      });
      // il turno finisce solo quando chiuderà la schermata (closeSurprise)
    } else {
      this.maybeAdvanceTurn(player, io);
    }
  }

  // Gestisce l'arrivo su un nodo (Cittadella o mondo), sia per il movimento
  // normale col dado sia per gli spostamenti causati da un imprevisto.
  private resolveArrival(player: InternalPlayer, nodeId: string, io: IOServer) {
    if (nodeId === CITTADELLA_ID) {
      player.pendingShop = true;
      // il turno finisce quando lascerà la Cittadella (leaveShop)
    } else {
      this.arriveAtWorld(player, nodeId, io);
      // il turno finisce quando la domanda verrà risolta (submitAnswer)
    }
  }

  // Sposta il giocatore avanti/indietro (steps negativo = indietro) lungo il
  // ponte su cui si trova attualmente. Se supera un'estremità, arriva al nodo
  // corrispondente (Cittadella o mondo). Ritorna true se è arrivato a un nodo.
  private nodeLabel(nodeId: string): string {
    if (nodeId === CITTADELLA_ID) return "🏰 Cittadella";
    const w = WORLDS.find((w) => w.id === nodeId);
    return w ? `${w.emoji} ${w.name}` : nodeId;
  }

  // Come moveAlongCurrentEdge, ma parte da un nodo (non da metà ponte):
  // usato quando una carta ti fa avanzare mentre sei fermo su un nodo e hai
  // già scelto (o c'è un solo ponte possibile) la direzione da prendere.
  // Riposiziona un giocatore lungo il ponte su cui si trova, SENZA alcun
  // effetto collaterale (niente controllo caselle imprevisto, niente arrivo
  // su un nodo che apre mercato/mondo, niente avanzamento turno). Usato per
  // spostamenti "leggeri" imposti da un altro giocatore, o per un uso di una
  // figurina rapida fuori dal proprio turno: in quei casi non è sicuro (né
  // ha senso) innescare tutta la risoluzione completa del movimento.
  private simpleReposition(player: InternalPlayer, steps: number) {
    const pos = player.boardPosition;
    if (pos.onNode || !pos.edgeId) return;
    const edge = edgeById(pos.edgeId);
    if (!edge) return;
    const newProgress = (pos.progress ?? 0) + steps;
    if (newProgress > edge.length) {
      player.boardPosition = { nodeId: edge.a === pos.nodeId ? edge.b : edge.a, onNode: true };
    } else if (newProgress < 1) {
      player.boardPosition = { nodeId: pos.nodeId, onNode: true };
    } else {
      player.boardPosition = { nodeId: pos.nodeId, onNode: false, edgeId: edge.id, progress: newProgress };
    }
  }

  // Dispatcher condiviso per le figurine che ti fanno avanzare di N caselle
  // (es. Il Focolare +1, I Pirati +2, TheMadMarco +3). Gestisce sia il caso
  // "sei fermo su un nodo con un bivio" (chiede la direzione) sia "sei a
  // metà ponte" (avanza direttamente, con eventuale imprevisto a catena).
  private dispatchSelfAdvance(player: InternalPlayer, steps: number, io: IOServer) {
    const pos = player.boardPosition;
    if (pos.onNode) {
      const neighbors = availableNeighborsOf(pos.nodeId, this.deactivatedWorldIds);
      if (neighbors.length === 0) {
        this.broadcastState(io);
        return;
      }
      if (neighbors.length > 1) {
        player.pendingChoice = { kind: "advanceThreeDirection", amount: steps };
        this.emitChoiceOptions(player, io);
        this.broadcastState(io);
        return;
      }
      this.resolveDirectionalAdvance(
        player,
        pos.nodeId,
        neighbors[0].edgeId,
        neighbors[0].neighborId,
        steps,
        io
      );
    } else {
      const arrived = this.moveAlongCurrentEdge(player, steps, io);
      if (!arrived) this.checkSurpriseTileOrAdvance(player, io);
    }
    this.broadcastState(io);
  }

  private resolveDirectionalAdvance(
    player: InternalPlayer,
    originNodeId: string,
    edgeId: string,
    neighborId: string,
    steps: number,
    io: IOServer
  ) {
    const edge = edgeById(edgeId);
    if (!edge) {
      this.broadcastState(io);
      return;
    }
    const newProgress = Math.min(steps, edge.length);
    if (newProgress >= edge.length) {
      player.boardPosition = { nodeId: neighborId, onNode: true };
      this.resolveArrival(player, neighborId, io);
    } else {
      player.boardPosition = {
        nodeId: originNodeId,
        onNode: false,
        edgeId: edge.id,
        progress: newProgress,
      };
      this.checkSurpriseTileOrAdvance(player, io);
    }
  }

  private moveAlongCurrentEdge(player: InternalPlayer, steps: number, io: IOServer): boolean {
    const pos = player.boardPosition;
    if (pos.onNode || !pos.edgeId) return false;
    const edge = edgeById(pos.edgeId);
    if (!edge) return false;

    const newProgress = (pos.progress ?? 1) + steps;

    if (newProgress > edge.length) {
      const destinationNodeId = edge.a === pos.nodeId ? edge.b : edge.a;
      player.boardPosition = { nodeId: destinationNodeId, onNode: true };
      this.resolveArrival(player, destinationNodeId, io);
      return true;
    }
    if (newProgress < 1) {
      player.boardPosition = { nodeId: pos.nodeId, onNode: true };
      this.resolveArrival(player, pos.nodeId, io);
      return true;
    }
    player.boardPosition = {
      nodeId: pos.nodeId,
      onNode: false,
      edgeId: edge.id,
      progress: newProgress,
    };
    return false;
  }

  private swapPositions(a: InternalPlayer, b: InternalPlayer) {
    const tmp = a.boardPosition;
    a.boardPosition = b.boardPosition;
    b.boardPosition = tmp;
  }

  // Chiude la schermata dell'imprevisto: prima chiede a chi l'ha pescata se
  // vuole usare uno scudo per bloccarlo del tutto (vale per QUALSIASI
  // effetto, anche quelli autoinflitti), solo poi applica davvero l'effetto.
  closeSurprise(playerId: string, io: IOServer) {
    const player = this.players.get(playerId);
    if (!player || !player.pendingSurprise) return;

    const card = player.pendingSurprise;
    player.pendingSurprise = null;

    this.maybeShield(
      player,
      `Stai per subire l'effetto "${card.effectLabel}". Vuoi bloccarlo con uno scudo?`,
      io,
      (blocked) => {
        if (blocked) {
          this.maybeAdvanceTurn(player, io);
          this.broadcastState(io);
          return;
        }
        this.executeSurpriseEffect(player, card, io);
      }
    );
  }

  private executeSurpriseEffect(player: InternalPlayer, card: SurpriseCardDef, io: IOServer) {
    switch (card.effectCode) {
      case "moveForward": {
        const arrived = this.moveAlongCurrentEdge(player, card.amount ?? 1, io);
        if (!arrived) this.checkSurpriseTileOrAdvance(player, io);
        break;
      }
      case "moveBackward": {
        const arrived = this.moveAlongCurrentEdge(player, -(card.amount ?? 1), io);
        if (!arrived) this.checkSurpriseTileOrAdvance(player, io);
        break;
      }
      case "skipNextTurn":
        this.addStatus(
          player,
          "skipTurn",
          "Salta prossimo turno",
          "⏭️",
          "All'inizio del tuo prossimo turno lo salterai automaticamente."
        );
        this.advanceTurnAndHandleSkips(io);
        break;
      case "rollAgain":
        // nessun avanzamento: può tirare di nuovo subito, il turno resta suo
        break;
      case "loseCoins":
        player.coins = Math.max(0, player.coins - (card.amount ?? 0));
        this.advanceTurnAndHandleSkips(io);
        break;
      case "gainCoins": {
        const amount = this.hasPassiveEffect(player, "passiveDoubleImprevistoCoins")
          ? (card.amount ?? 0) * 2
          : card.amount ?? 0;
        player.coins += amount;
        this.advanceTurnAndHandleSkips(io);
        break;
      }
      case "stealCoins": {
        const others = [...this.players.values()].filter((p) => p.id !== player.id && p.connected);
        if (others.length === 0) {
          this.advanceTurnAndHandleSkips(io);
          break;
        }
        const amount = this.hasPassiveEffect(player, "passiveDoubleImprevistoCoins")
          ? (card.amount ?? 0) * 2
          : card.amount ?? 0;
        player.pendingChoice = { kind: "stealCoins", amount };
        this.emitChoiceOptions(player, io);
        this.broadcastState(io);
        return;
      }
      case "loseAllCoins":
        player.coins = 0;
        this.advanceTurnAndHandleSkips(io);
        break;
      case "discardChosenCard": {
        if (player.collection.length === 0) {
          this.advanceTurnAndHandleSkips(io);
          break;
        }
        player.pendingChoice = { kind: "discardCard" };
        this.emitChoiceOptions(player, io);
        this.broadcastState(io);
        return;
      }
      case "discardRandomCard": {
        if (player.collection.length > 0) {
          const idx = Math.floor(Math.random() * player.collection.length);
          player.collection.splice(idx, 1);
        }
        this.advanceTurnAndHandleSkips(io);
        break;
      }
      case "freePack":
        this.addStatus(
          player,
          "freePack",
          "Pacchetto gratis",
          "🎁",
          "Il prossimo pacchetto base comprato alla Cittadella non costa nulla."
        );
        this.advanceTurnAndHandleSkips(io);
        break;
      case "swapChosen": {
        const others = [...this.players.values()].filter((p) => p.id !== player.id && p.connected);
        if (others.length === 0) {
          this.advanceTurnAndHandleSkips(io);
          break;
        }
        player.pendingChoice = { kind: "swapPosition" };
        this.emitChoiceOptions(player, io);
        this.broadcastState(io);
        return;
      }
      case "swapRandom": {
        const others = [...this.players.values()].filter((p) => p.id !== player.id && p.connected);
        if (others.length > 0) {
          const target = others[Math.floor(Math.random() * others.length)];
          this.swapWithShieldCheck(player, target, io);
        }
        this.advanceTurnAndHandleSkips(io);
        break;
      }
      case "nothing":
        this.advanceTurnAndHandleSkips(io);
        break;
      case "returnToCittadella":
        player.boardPosition = { nodeId: CITTADELLA_ID, onNode: true };
        player.pendingShop = true;
        // il turno finisce quando lascerà la Cittadella (leaveShop)
        break;
      case "doubleNextWin":
        this.addStatus(
          player,
          "doubleWin",
          "Vincita raddoppiata",
          "✨",
          "Il prossimo gioco vinto in un mondo pagherà il doppio delle monete."
        );
        this.advanceTurnAndHandleSkips(io);
        break;
      case "halveNextWin":
        this.addStatus(
          player,
          "halveWin",
          "Vincita dimezzata",
          "📉",
          "Il prossimo gioco vinto in un mondo pagherà la metà delle monete."
        );
        this.advanceTurnAndHandleSkips(io);
        break;
      case "gainShield":
        this.addStatus(
          player,
          "shield",
          "Scudo",
          "🛡️",
          "Puoi annullare un effetto subito in futuro. Si consuma dopo l'uso."
        );
        this.advanceTurnAndHandleSkips(io);
        break;
    }

    this.broadcastState(io);
  }

  private emitChoiceOptions(player: InternalPlayer, io: IOServer) {
    const choice = player.pendingChoice;
    if (!choice) return;

    if (
      choice.kind === "stealCoins" ||
      choice.kind === "swapPosition" ||
      choice.kind === "stealAllFromTwo" ||
      choice.kind === "swapZeroTripleWin" ||
      choice.kind === "forceSkipTurn" ||
      choice.kind === "discardFromChosen" ||
      choice.kind === "moveBackwardChosen"
    ) {
      const alreadyChosen = choice.targets ?? [];
      const options = [...this.players.values()]
        .filter((p) => p.id !== player.id && p.connected && !alreadyChosen.includes(p.id))
        .map((p) => ({ id: p.id, label: p.name }));

      let prompt = "Scegli con chi scambiare posizione";
      if (choice.kind === "stealCoins") prompt = `Scegli a chi rubare ${choice.amount} monete`;
      else if (choice.kind === "stealAllFromTwo") {
        prompt =
          alreadyChosen.length === 0
            ? "Scegli il 1° giocatore a cui rubare tutte le monete"
            : "Scegli il 2° giocatore a cui rubare tutte le monete";
      } else if (choice.kind === "swapZeroTripleWin") {
        prompt = "Scegli con chi scambiare posizione e a cui azzerare le monete";
      } else if (choice.kind === "forceSkipTurn") {
        prompt = "Scegli chi salterà il prossimo turno";
      } else if (choice.kind === "discardFromChosen") {
        prompt = "Scegli a chi far scartare 2 figurine casuali";
      } else if (choice.kind === "moveBackwardChosen") {
        prompt = "Scegli chi farai indietreggiare di una casella";
      }

      io.to(player.socketId).emit("board:chooseTarget", { kind: "player", prompt, options });
    } else if (choice.kind === "advanceThreeDirection") {
      const neighbors = availableNeighborsOf(player.boardPosition.nodeId, this.deactivatedWorldIds);
      const options = neighbors.map((n) => ({ id: n.neighborId, label: this.nodeLabel(n.neighborId) }));
      io.to(player.socketId).emit("board:chooseTarget", {
        kind: "player",
        prompt: "Scegli in quale direzione avanzare di 3 caselle",
        options,
      });
    } else if (choice.kind === "discardCard") {
      const options = player.collection.map((c) => {
        const def = CARD_CATALOG.find((cd) => cd.id === c.cardId);
        return { id: c.instanceId, label: def?.name ?? "Carta sconosciuta" };
      });
      io.to(player.socketId).emit("board:chooseTarget", {
        kind: "card",
        prompt: "Scegli quale figurina scartare",
        options,
      });
    } else if (choice.kind === "chooseCategory") {
      const options = QUESTION_CATEGORIES.map((cat) => ({ id: cat, label: cat }));
      io.to(player.socketId).emit("board:chooseTarget", {
        kind: "category",
        prompt: "Scegli la categoria del tuo prossimo gioco",
        options,
      });
    }
  }

  submitChoice(playerId: string, optionId: string, io: IOServer) {
    const player = this.players.get(playerId);
    if (!player || !player.pendingChoice) return;

    const choice = player.pendingChoice;

    if (choice.kind === "stealAllFromTwo") {
      const targets = [...(choice.targets ?? []), optionId];
      const othersCount = [...this.players.values()].filter(
        (p) => p.id !== player.id && p.connected
      ).length;

      if (targets.length < 2 && targets.length < othersCount) {
        // serve ancora un secondo bersaglio
        player.pendingChoice = { kind: "stealAllFromTwo", targets };
        this.emitChoiceOptions(player, io);
        this.broadcastState(io);
        return;
      }

      player.pendingChoice = null;
      for (const targetId of targets) {
        const target = this.players.get(targetId);
        if (target) this.stealAllWithShieldCheck(player, target, io);
      }
      this.broadcastState(io);
      return;
    }

    if (choice.kind === "swapZeroTripleWin") {
      player.pendingChoice = null;
      const target = this.players.get(optionId);
      if (target) {
        // il beneficio per chi usa la carta è garantito, a prescindere dallo scudo del bersaglio
        this.addStatus(
          player,
          "tripleWin",
          "Vincita triplicata",
          "🔺",
          "Il prossimo gioco vinto in un mondo pagherà il triplo delle monete."
        );
        this.maybeShield(
          target,
          `${player.name} vuole scambiarsi di posizione con te e azzerarti le monete! Vuoi bloccarlo con uno scudo?`,
          io,
          (blocked) => {
            if (!blocked) {
              this.swapPositions(player, target);
              target.coins = 0;
            }
            this.broadcastState(io);
          }
        );
      }
      this.broadcastState(io);
      return;
    }

    if (choice.kind === "forceSkipTurn") {
      player.pendingChoice = null;
      const target = this.players.get(optionId);
      if (target) {
        this.maybeShield(
          target,
          `${player.name} vuole farti saltare il prossimo turno! Vuoi bloccarlo con uno scudo?`,
          io,
          (blocked) => {
            if (!blocked) {
              this.addStatus(
                target,
                "skipTurn",
                "Salta prossimo turno",
                "⏭️",
                "All'inizio del tuo prossimo turno lo salterai automaticamente."
              );
            }
            this.broadcastState(io);
          }
        );
      }
      this.broadcastState(io);
      return;
    }

    if (choice.kind === "chooseCategory") {
      player.pendingChoice = null;
      player.forcedNextCategory = optionId;
      this.broadcastState(io);
      return;
    }

    if (choice.kind === "discardFromChosen") {
      player.pendingChoice = null;
      const target = this.players.get(optionId);
      if (target) {
        this.maybeShield(
          target,
          `${player.name} vuole farti scartare 2 figurine a caso! Vuoi bloccarlo con uno scudo?`,
          io,
          (blocked) => {
            if (!blocked) {
              for (let i = 0; i < 2; i++) {
                if (target.collection.length === 0) break;
                const idx = Math.floor(Math.random() * target.collection.length);
                target.collection.splice(idx, 1);
              }
            }
            this.broadcastState(io);
          }
        );
      }
      this.broadcastState(io);
      return;
    }

    if (choice.kind === "advanceThreeDirection") {
      player.pendingChoice = null;
      const originNodeId = player.boardPosition.nodeId;
      const neighbors = availableNeighborsOf(originNodeId, this.deactivatedWorldIds);
      const chosen = neighbors.find((n) => n.neighborId === optionId);
      if (chosen) {
        this.resolveDirectionalAdvance(
          player,
          originNodeId,
          chosen.edgeId,
          chosen.neighborId,
          choice.amount ?? 3,
          io
        );
      }
      this.broadcastState(io);
      return;
    }

    player.pendingChoice = null;

    if (choice.kind === "stealCoins") {
      const target = this.players.get(optionId);
      if (target) this.stealWithShieldCheck(player, target, choice.amount ?? 0, io);
    } else if (choice.kind === "swapPosition") {
      const target = this.players.get(optionId);
      if (target) this.swapWithShieldCheck(player, target, io);
    } else if (choice.kind === "discardCard") {
      const idx = player.collection.findIndex((c) => c.instanceId === optionId);
      if (idx !== -1) player.collection.splice(idx, 1);
    } else if (choice.kind === "moveBackwardChosen") {
      const target = this.players.get(optionId);
      if (target) {
        this.maybeShield(
          target,
          `${player.name} vuole farti indietreggiare di una casella! Vuoi bloccarlo con uno scudo?`,
          io,
          (blocked) => {
            if (!blocked) this.simpleReposition(target, -1);
            this.broadcastState(io);
          }
        );
      }
    }

    this.maybeAdvanceTurn(player, io);
    this.broadcastState(io);
  }

  // Come stealWithShieldCheck, ma ruba TUTTE le monete del bersaglio.
  private stealAllWithShieldCheck(source: InternalPlayer, target: InternalPlayer, io: IOServer) {
    const amount = target.coins;
    this.maybeShield(
      target,
      `${source.name} sta cercando di rubarti TUTTE le tue monete (${amount})! Vuoi bloccarlo con uno scudo?`,
      io,
      (blocked) => {
        if (!blocked) {
          target.coins = 0;
          source.coins += amount;
        }
        this.broadcastState(io);
      }
    );
  }

  // Se il bersaglio ha uno scudo attivo, gli chiede se vuole usarlo prima di
  // applicare davvero il furto; altrimenti lo applica subito.
  private stealWithShieldCheck(
    source: InternalPlayer,
    target: InternalPlayer,
    amount: number,
    io: IOServer
  ) {
    this.maybeShield(
      target,
      `${source.name} sta cercando di rubarti ${amount} monete! Vuoi bloccarlo con uno scudo?`,
      io,
      (blocked) => {
        if (!blocked) {
          const actual = Math.min(target.coins, amount);
          target.coins -= actual;
          source.coins += actual;
        }
        this.broadcastState(io);
      }
    );
  }

  // Stessa idea per lo scambio di posizione: il bersaglio può bloccarlo con
  // uno scudo prima che avvenga davvero.
  private swapWithShieldCheck(player: InternalPlayer, target: InternalPlayer, io: IOServer) {
    this.maybeShield(
      target,
      `${player.name} vuole scambiarsi di posizione con te! Vuoi bloccarlo con uno scudo?`,
      io,
      (blocked) => {
        if (!blocked) this.swapPositions(player, target);
        this.broadcastState(io);
      }
    );
  }

  // Helper generico: se il giocatore ha uno scudo attivo, gli chiede se vuole
  // usarlo (consumandone uno) per annullare l'effetto in arrivo; altrimenti
  // procede subito. onResolve riceve true se l'effetto è stato bloccato.
  private maybeShield(
    player: InternalPlayer,
    message: string,
    io: IOServer,
    onResolve: (blocked: boolean) => void
  ) {
    const hasShield = player.statuses.some((s) => s.type === "shield");
    if (!hasShield) {
      onResolve(false);
      return;
    }
    player.pendingShieldContext = { message, resolve: onResolve };
    io.to(player.socketId).emit("board:useShieldPrompt", { message });
  }

  respondShield(playerId: string, useShield: boolean, io: IOServer) {
    const player = this.players.get(playerId);
    if (!player || !player.pendingShieldContext) return;
    const ctx = player.pendingShieldContext;
    player.pendingShieldContext = null;

    if (useShield) {
      const idx = player.statuses.findIndex((s) => s.type === "shield");
      if (idx !== -1) player.statuses.splice(idx, 1);
      io.emit("board:shieldUsed", { playerId: player.id });
    }
    ctx.resolve(useShield);
  }

  leaveShop(playerId: string, io: IOServer) {
    const player = this.players.get(playerId);
    if (!player) return;
    if (this.currentTurnPlayerId() !== playerId) {
      io.to(player.socketId).emit("error:message", {
        message: "Non è il tuo turno.",
      });
      return;
    }
    if (!player.pendingShop) return;
    player.pendingShop = false;

    if (this.phase === "finalRound") {
      // Giro finale: un solo turno di shopping a testa, nell'ordine dei
      // turni già stabilito. Quando tutti quelli connessi a inizio giro
      // l'hanno fatto, si chiude la partita e si decreta il vincitore.
      this.finalRoundDoneIds.add(playerId);
      if (this.finalRoundDoneIds.size >= this.finalRoundPlayerIds.length) {
        this.finishGame(io);
      } else {
        this.finalRoundIndex += 1;
        const next = this.players.get(this.currentTurnPlayerId() ?? "");
        if (next) next.pendingShop = true;
        this.broadcastState(io);
      }
      return;
    }

    this.advanceTurnAndHandleSkips(io);
    this.broadcastState(io);
  }

  private arriveAtWorld(player: InternalPlayer, worldId: string, io: IOServer) {
    player.pendingWorldId = worldId;
    player.awaitingWheelStart = true;
    io.emit("world:welcome", { playerId: player.id, worldId });
  }

  // Disattiva un mondo per il resto della partita: succede quando TUTTE le
  // sue categorie hanno esaurito le domande fresche (i vari isXWorldExhausted
  // nei rispettivi server/data/*.ts, controllati a fine di ogni resolveX). Il
  // mondo e i suoi 3 ponti (1 raggio verso la Cittadella + 2 anelli verso i
  // mondi vicini) diventano impraticabili per il resto della partita: chi ci
  // si trova sopra (nodo o ponte) in quel momento torna alla Cittadella.
  private deactivateWorld(worldId: string, io: IOServer) {
    if (this.deactivatedWorldIds.has(worldId)) return;
    this.deactivatedWorldIds.add(worldId);

    const bridgeEdgeIds = new Set(neighborsOf(worldId).map((n) => n.edgeId));
    for (const p of this.players.values()) {
      const pos = p.boardPosition;
      const onDeactivatedNode = pos.onNode && pos.nodeId === worldId;
      const onDeactivatedBridge = !pos.onNode && !!pos.edgeId && bridgeEdgeIds.has(pos.edgeId);
      if (onDeactivatedNode || onDeactivatedBridge) {
        p.boardPosition = { nodeId: CITTADELLA_ID, onNode: true };
      }
    }

    const world = WORLDS.find((w) => w.id === worldId);
    const worldLabel = world ? `${world.emoji} ${world.name}` : worldId;
    io.emit("error:message", {
      message: `Le domande di ${worldLabel} sono finite: il mondo e i suoi ponti sono stati disattivati per il resto della partita.`,
    });

    this.broadcastState(io);

    // Se anche l'ULTIMO mondo si è appena disattivato, non c'è più nessun
    // mondo raggiungibile: si passa al giro finale.
    if (this.deactivatedWorldIds.size >= WORLDS.length && this.phase === "playing") {
      this.startFinalRound(io);
    }
  }

  // Tutti i mondi hanno esaurito le domande: si torna alla Cittadella con un
  // bonus di monete, e ogni giocatore ha un solo turno finale per comprare
  // pacchetti (nell'ordine dei turni già stabilito). Alla fine dell'ultimo
  // turno si decreta il vincitore (vedi finishGame).
  private startFinalRound(io: IOServer) {
    this.phase = "finalRound";

    for (const p of this.players.values()) {
      if (p.isSpectator) continue; // non partecipa alla partita, niente da resettare
      // tutti tornano alla Cittadella (chi era su un mondo appena
      // disattivato ci è già stato riportato sopra; qui copriamo comunque
      // ogni caso residuo) e si azzera qualsiasi minigioco/scelta pendente:
      // non c'è più nulla da risolvere, si passa dritti allo shopping finale.
      p.boardPosition = { nodeId: CITTADELLA_ID, onNode: true };
      p.coins += FINAL_ROUND_BONUS_COINS;
      p.pendingRoll = null;
      p.pendingWorldId = null;
      p.awaitingWheelStart = false;
      p.awaitingQuizStart = false;
      p.pendingQuestion = null;
      p.pendingShop = false;
    }

    this.finalRoundPlayerIds = [...this.turnOrder].filter((id) => {
      const p = this.players.get(id);
      return !!p && p.connected;
    });
    this.finalRoundDoneIds = new Set();
    this.finalRoundIndex = 0;

    io.emit("error:message", {
      message: `Tutti i mondi sono stati esauriti! Si torna alla Cittadella con ${FINAL_ROUND_BONUS_COINS} monete bonus per l'ultimo giro di shopping, un turno a testa.`,
    });

    if (this.finalRoundPlayerIds.length === 0) {
      // nessun giocatore connesso: non dovrebbe succedere, ma per sicurezza
      // chiudiamo comunque la partita invece di restare bloccati.
      this.finishGame(io);
      return;
    }

    const first = this.players.get(this.finalRoundPlayerIds[0]);
    if (first) first.pendingShop = true;

    this.broadcastState(io);
  }

  // Chiude il giro finale (o l'intera partita, se non ci sono giocatori
  // connessi): calcola la classifica finale e decreta il vincitore.
  // Criteri, in ordine: (1) più carte DIVERSE possedute, (2) a parità, più
  // copie totali possedute, (3) a ulteriore parità, più monete rimaste.
  //
  // "forcedWinnerId" si usa solo per la vittoria anticipata da collezione
  // completa (vedi checkCollectionComplete): in quel caso non si applica
  // nessun parimerito, il vincitore è quel giocatore e basta.
  private finishGame(
    io: IOServer,
    reason: GameEndedPayload["reason"] = "worldsExhausted",
    forcedWinnerId?: string
  ) {
    this.phase = "ended";
    // partita finita: non c'è più nulla da riprendere, eventuali salvataggi
    // precedenti per questo codice stanza non servono più
    deleteSave(this.code);

    // per la vittoria da collezione completa contiamo solo le 25 figurine
    // "normali" (vedi commento su totalCardCount più sotto): altrimenti chi
    // possiede anche la segreta mostrerebbe un rapporto tipo "26/25".
    const normalCardIds =
      reason === "collectionComplete"
        ? new Set(CARD_CATALOG.filter((c) => c.rarity !== "segreta").map((c) => c.id))
        : null;

    const standings = [...this.players.values()]
      .filter((p) => !p.isSpectator) // chi ha gestito la partita da spettatore non entra in classifica
      .map((p) => {
        const ownedIds = p.collection.map((c) => c.cardId);
        const relevantIds = normalCardIds ? ownedIds.filter((id) => normalCardIds.has(id)) : ownedIds;
        const distinctCards = new Set(relevantIds).size;
        return {
          playerId: p.id,
          distinctCards,
          totalCards: p.collection.length,
          coins: p.coins,
        };
      });

    standings.sort((a, b) => {
      if (b.distinctCards !== a.distinctCards) return b.distinctCards - a.distinctCards;
      if (b.totalCards !== a.totalCards) return b.totalCards - a.totalCards;
      return b.coins - a.coins;
    });

    let winnerIds: string[];
    if (forcedWinnerId) {
      winnerIds = [forcedWinnerId];
    } else {
      const top = standings[0];
      winnerIds = top
        ? standings
            .filter(
              (s) =>
                s.distinctCards === top.distinctCards &&
                s.totalCards === top.totalCards &&
                s.coins === top.coins
            )
            .map((s) => s.playerId)
        : [];
    }

    // per la vittoria da collezione completa il traguardo è "tutte le 25
    // normali" (la segreta è un bonus, non richiesto): mostriamo quindi 25
    // come totale invece di 26, altrimenti il vincitore sembrerebbe non
    // aver completato nulla se non possiede anche la segreta.
    const totalCardCount =
      reason === "collectionComplete"
        ? CARD_CATALOG.filter((c) => c.rarity !== "segreta").length
        : CARD_CATALOG.length;

    const payload: GameEndedPayload = {
      standings,
      winnerIds,
      totalCardCount,
      reason,
    };
    this.lastGameEndedPayload = payload;
    io.emit("game:ended", payload);
    this.broadcastState(io);
  }

  // Controlla se il giocatore ha appena completato l'intera collezione delle
  // 25 figurine "normali" (la 26esima, segreta, non è richiesta: è un pezzo
  // raro/bonus, non un requisito). Se sì, la partita finisce all'istante con
  // quel giocatore come unico vincitore, senza aspettare l'esaurimento di
  // tutti i mondi né il giro finale. Va chiamata subito dopo ogni punto in
  // cui una figurina entra nella collezione di un giocatore.
  private checkCollectionComplete(player: InternalPlayer, io: IOServer) {
    if (this.phase !== "playing") return;
    const requiredIds = CARD_CATALOG.filter((c) => c.rarity !== "segreta").map((c) => c.id);
    const ownedIds = new Set(player.collection.map((c) => c.cardId));
    if (!requiredIds.every((id) => ownedIds.has(id))) return;

    io.emit("error:message", {
      message: `${player.name} ha completato l'intera collezione di figurine! La partita finisce qui.`,
    });
    this.finishGame(io, "collectionComplete", player.id);
  }

  beginMinigame(playerId: string, io: IOServer) {
    const player = this.players.get(playerId);
    if (!player) return;
    if (this.currentTurnPlayerId() !== playerId) {
      io.to(player.socketId).emit("error:message", { message: "Non è il tuo turno." });
      return;
    }
    if (!player.awaitingWheelStart) return;
    player.awaitingWheelStart = false;

    const worldId = player.pendingWorldId!;

    // Il mondo "vulcano" ha una meccanica dedicata (Top 5), arbitrata a voce
    // dall'host: salta del tutto la ruota/quiz generici.
    if (worldId === "vulcano") {
      this.beginTop5(player, io);
      return;
    }

    // Anche il mondo "officina" (CARO AMICO TI SCRIVO) ha una meccanica
    // dedicata: prima chiede al giocatore chi è lui tra le persone della
    // ruota, poi estrae una persona diversa da lui e una domanda.
    if (worldId === "officina") {
      this.beginCaroAmico(player, io);
      return;
    }

    // Anche il mondo "abisso" (TCT) ha una meccanica dedicata: un quiz a
    // tempo tutti-contro-tutti a cui partecipano automaticamente tutti i
    // giocatori con almeno 100 monete (non solo chi è di turno).
    if (worldId === "abisso") {
      this.beginTct(player, io);
      return;
    }

    // Anche il mondo "deserto" (OCHO ALLA BOMBA) ha una meccanica dedicata:
    // si estrae prima una categoria dalla ruota (come in Top5), poi un
    // gioco a caso al suo interno; stavolta però è il giocatore stesso a
    // selezionare le risposte, evitando la bomba.
    if (worldId === "deserto") {
      this.beginOcho(player, io);
      return;
    }

    // Anche il mondo "ghiacciaia" (ACCHIAPPA LA PAPERA) ha una meccanica
    // dedicata: si estrae prima una categoria dalla ruota (come in Top5),
    // poi il giocatore stesso risponde da solo, senza host, a un quiz di
    // massimo 4 domande.
    if (worldId === "ghiacciaia") {
      this.beginDuck(player, io);
      return;
    }

    // Il mondo "foresta" (GRANDIOSO QUIZ PARTICOLARE) ha una meccanica
    // dedicata: gioca solo il giocatore di turno, che risponde A VOCE.
    // Come in CaroAmico/Ocho, è l'host a gestire i controlli.
    if (worldId === "foresta") {
      this.beginParticolare(player, io);
      return;
    }

    // Il mondo "cieli" (IL GRANDIOSO BUZZ) ha una meccanica dedicata: gioca
    // TUTTA la sala insieme (non solo il giocatore di turno), prenotandosi
    // la risposta con un buzzer; una sola domanda, che vale fissa 100 monete.
    if (worldId === "cieli") {
      this.beginBuzz(player, io);
      return;
    }

    // Il mondo "rovine" (SFIDA GINO) ha una meccanica dedicata: gioca solo
    // il giocatore di turno, a voce, come in Grandioso Quiz Particolare, ma
    // con premio fisso e binario (2000 o 0 monete).
    if (worldId === "rovine") {
      this.beginSfidaGino(player, io);
      return;
    }

    // Per tutti gli altri mondi l'unico tipo di minigioco è il quiz.
    const resultType = "quiz" as const;
    const durationMs = 2600;

    io.emit("wheel:spin", {
      playerId: player.id,
      worldId,
      resultType,
      durationMs,
    });

    setTimeout(() => {
      if (player.pendingWorldId !== worldId) return;
      player.awaitingQuizStart = true;
      io.emit("wheel:result", { playerId: player.id, worldId, resultType });
    }, durationMs);
  }

  // Avvia il minigioco Top 5: pesca una categoria e una top5 (escludendo
  // quelle già giocate in questa partita), mostra l'animazione della ruota
  // verticale, poi rivela lo stato (nascosto per i giocatori, completo per
  // l'host) a tutti. La top5 pescata viene subito segnata come "giocata" in
  // playedTop5Ids, così non potrà ripresentarsi finché dura la partita.
  private beginTop5(player: InternalPlayer, io: IOServer) {
    const category = pickRandomCategory(this.playedTop5Ids);
    if (!category) {
      // Non dovrebbe succedere (il movimento impedisce di atterrare su un
      // mondo già disattivato), ma per sicurezza gestiamo comunque il caso.
      this.deactivateWorld("vulcano", io);
      player.pendingWorldId = null;
      this.maybeAdvanceTurn(player, io);
      this.broadcastState(io);
      return;
    }
    const def = pickRandomTop5InCategory(category.id, this.playedTop5Ids)!;
    this.playedTop5Ids.add(def.id);
    player.pendingTop5 = {
      def,
      category,
      revealed: [false, false, false, false, false],
      heartsBroken: 0,
    };
    const durationMs = 2600;

    io.emit("top5:spin", { playerId: player.id, durationMs });

    setTimeout(() => {
      if (!player.pendingTop5 || player.pendingTop5.def.id !== def.id) return;
      player.awaitingTop5Start = true;
      io.emit("top5:categoryDrawn", {
        playerId: player.id,
        categoryId: category.id,
        categoryName: category.name,
        categoryEmoji: category.emoji,
      });
    }, durationMs);
  }

  // Conferma la categoria e apre davvero la griglia di gioco (con le
  // risposte nascoste/rivelate e i controlli host).
  beginTop5Game(playerId: string, io: IOServer) {
    const player = this.players.get(playerId);
    if (!player) return;
    if (this.currentTurnPlayerId() !== playerId) {
      io.to(player.socketId).emit("error:message", { message: "Non è il tuo turno." });
      return;
    }
    if (!player.awaitingTop5Start) return;
    player.awaitingTop5Start = false;
    this.broadcastTop5State(player, io);
  }

  // Manda lo stato della top5 a tutti (risposte nascoste finché non
  // rivelate) e, in aggiunta, la versione completa solo all'host.
  private broadcastTop5State(player: InternalPlayer, io: IOServer) {
    if (!player.pendingTop5) return;
    const { def, revealed, heartsBroken } = player.pendingTop5;
    const slots = def.answers.map((answer, i) => ({
      rank: i + 1,
      answer: revealed[i] ? answer : null,
    }));

    io.emit("top5:state", {
      playerId: player.id,
      title: def.title,
      slots,
      heartsBroken,
      source: def.source,
    });

    const host = [...this.players.values()].find((p) => p.isHost);
    if (host) {
      io.to(host.socketId).emit("top5:state", {
        playerId: player.id,
        title: def.title,
        slots,
        heartsBroken,
        source: def.source,
        fullAnswers: def.answers,
      });
    }
  }

  // Solo l'host può rivelare una posizione della classifica (dopo che il
  // giocatore di turno ha detto la risposta giusta a voce).
  revealTop5Rank(hostId: string, rank: number, io: IOServer) {
    const host = this.players.get(hostId);
    if (!host?.isHost) return;
    const target = [...this.players.values()].find((p) => p.pendingTop5);
    if (!target?.pendingTop5) return;
    const idx = rank - 1;
    if (idx < 0 || idx >= target.pendingTop5.revealed.length) return;
    target.pendingTop5.revealed[idx] = true;
    this.broadcastTop5State(target, io);
  }

  // Solo l'host può "spezzare" un cuore (risposta sbagliata data a voce).
  breakTop5Heart(hostId: string, io: IOServer) {
    const host = this.players.get(hostId);
    if (!host?.isHost) return;
    const target = [...this.players.values()].find((p) => p.pendingTop5);
    if (!target?.pendingTop5) return;
    target.pendingTop5.heartsBroken = Math.min(3, target.pendingTop5.heartsBroken + 1);
    this.broadcastTop5State(target, io);
  }

  // Solo l'host decreta l'esito: vittoria assegna le monete (con gli stessi
  // status/passivi del quiz normale), sconfitta no.
  resolveTop5(hostId: string, won: boolean, io: IOServer) {
    const host = this.players.get(hostId);
    if (!host?.isHost) return;
    const target = [...this.players.values()].find((p) => p.pendingTop5);
    if (!target?.pendingTop5) return;

    target.pendingTop5 = null;

    // figurine con effetto passivo: si applicano da sole alla fine di ogni gioco
    this.applyPassiveCardEffects(target);

    let coinsAwarded = won ? TOP5_REWARD : 0;

    const doubleIdx = target.statuses.findIndex((s) => s.type === "doubleWin");
    if (doubleIdx !== -1) {
      coinsAwarded *= 2;
      target.statuses.splice(doubleIdx, 1);
    }
    const tripleIdx = target.statuses.findIndex((s) => s.type === "tripleWin");
    if (tripleIdx !== -1) {
      coinsAwarded *= 3;
      target.statuses.splice(tripleIdx, 1);
    }
    const halveIdx = target.statuses.findIndex((s) => s.type === "halveWin");
    if (halveIdx !== -1) {
      coinsAwarded = Math.floor(coinsAwarded / 2);
      target.statuses.splice(halveIdx, 1);
    }

    target.coins += coinsAwarded;
    target.pendingWorldId = null;

    io.emit("top5:ended", { playerId: target.id, won, coinsAwarded });
    this.maybeAdvanceTurn(target, io);
    if (isTop5WorldExhausted(this.playedTop5Ids)) {
      this.deactivateWorld("vulcano", io);
    }
    this.broadcastState(io);
  }

  // Avvia il minigioco "Caro amico ti scrivo" (mondo "officina"): prima di
  // tutto chiede al giocatore quale persona tra quelle della ruota è lui
  // stesso, così la ruota non lo mette mai a rispondere a una domanda di cui
  // già conosce la risposta.
  private beginCaroAmico(player: InternalPlayer, io: IOServer) {
    player.awaitingCaroAmicoSelfChoice = true;
    io.emit("caroamico:selfChoicePrompt", {
      playerId: player.id,
      personas: CARO_AMICO_PERSONE,
      currentSelfId: player.caroAmicoSelfId,
    });
  }

  // Il giocatore conferma quale persona è lui stesso (o nessuna, se non è
  // tra quelle elencate): la scelta resta memorizzata per le prossime volte
  // che capiterà su questo mondo, poi si passa alla ruota vera e propria.
  chooseCaroAmicoSelf(playerId: string, personaId: string | null, io: IOServer) {
    const player = this.players.get(playerId);
    if (!player) return;
    if (this.currentTurnPlayerId() !== playerId) {
      io.to(player.socketId).emit("error:message", { message: "Non è il tuo turno." });
      return;
    }
    if (!player.awaitingCaroAmicoSelfChoice) return;
    player.awaitingCaroAmicoSelfChoice = false;
    player.caroAmicoSelfId = personaId;
    this.drawCaroAmicoRound(player, io);
  }

  // Pesca una persona (mai quella scelta come "sé stesso") e una domanda a
  // caso, mostra l'animazione della ruota, poi rivela la persona pescata a
  // tutti.
  private drawCaroAmicoRound(player: InternalPlayer, io: IOServer) {
    const domanda = pickRandomDomanda(this.playedCaroAmicoDomandaIds);
    if (!domanda) {
      this.deactivateWorld("officina", io);
      player.pendingWorldId = null;
      this.maybeAdvanceTurn(player, io);
      this.broadcastState(io);
      return;
    }
    this.playedCaroAmicoDomandaIds.add(domanda.id);
    const persona = pickRandomPersonaExcluding(player.caroAmicoSelfId);
    player.pendingCaroAmico = { domanda, persona, revealed: false };
    const durationMs = 2600;

    io.emit("caroamico:spin", { playerId: player.id, durationMs });

    setTimeout(() => {
      if (!player.pendingCaroAmico || player.pendingCaroAmico.persona.id !== persona.id) return;
      player.awaitingCaroAmicoStart = true;
      io.emit("caroamico:personaDrawn", {
        playerId: player.id,
        personaId: persona.id,
        personaName: persona.name,
        personaEmoji: persona.emoji,
      });
    }, durationMs);
  }

  // Conferma la persona pescata e apre davvero la schermata con la domanda
  // (risposta nascosta finché l'host non la rivela).
  beginCaroAmicoGame(playerId: string, io: IOServer) {
    const player = this.players.get(playerId);
    if (!player) return;
    if (this.currentTurnPlayerId() !== playerId) {
      io.to(player.socketId).emit("error:message", { message: "Non è il tuo turno." });
      return;
    }
    if (!player.awaitingCaroAmicoStart) return;
    player.awaitingCaroAmicoStart = false;
    this.broadcastCaroAmicoState(player, io);
  }

  // Manda lo stato della domanda a tutti (risposta nascosta finché non
  // rivelata) e, in aggiunta, la versione completa solo all'host.
  private broadcastCaroAmicoState(player: InternalPlayer, io: IOServer) {
    if (!player.pendingCaroAmico) return;
    const { domanda, persona, revealed } = player.pendingCaroAmico;
    const correctAnswer = domanda.answers[persona.id];

    io.emit("caroamico:state", {
      playerId: player.id,
      personaId: persona.id,
      personaName: persona.name,
      personaEmoji: persona.emoji,
      question: domanda.question,
      revealed,
      answer: revealed ? correctAnswer : null,
    });

    const host = [...this.players.values()].find((p) => p.isHost);
    if (host) {
      io.to(host.socketId).emit("caroamico:state", {
        playerId: player.id,
        personaId: persona.id,
        personaName: persona.name,
        personaEmoji: persona.emoji,
        question: domanda.question,
        revealed,
        answer: revealed ? correctAnswer : null,
        fullAnswer: correctAnswer,
      });
    }
  }

  // Solo l'host può rivelare la risposta corretta (dopo che il giocatore di
  // turno l'ha detta a voce).
  revealCaroAmicoAnswer(hostId: string, io: IOServer) {
    const host = this.players.get(hostId);
    if (!host?.isHost) return;
    const target = [...this.players.values()].find((p) => p.pendingCaroAmico);
    if (!target?.pendingCaroAmico) return;
    target.pendingCaroAmico.revealed = true;
    this.broadcastCaroAmicoState(target, io);
  }

  // Solo l'host decreta l'esito: vittoria assegna le monete (con gli stessi
  // status/passivi degli altri minigiochi), sconfitta no.
  resolveCaroAmico(hostId: string, won: boolean, io: IOServer) {
    const host = this.players.get(hostId);
    if (!host?.isHost) return;
    const target = [...this.players.values()].find((p) => p.pendingCaroAmico);
    if (!target?.pendingCaroAmico) return;

    target.pendingCaroAmico = null;

    // figurine con effetto passivo: si applicano da sole alla fine di ogni gioco
    this.applyPassiveCardEffects(target);

    let coinsAwarded = won ? CARO_AMICO_REWARD : 0;

    const doubleIdx = target.statuses.findIndex((s) => s.type === "doubleWin");
    if (doubleIdx !== -1) {
      coinsAwarded *= 2;
      target.statuses.splice(doubleIdx, 1);
    }
    const tripleIdx = target.statuses.findIndex((s) => s.type === "tripleWin");
    if (tripleIdx !== -1) {
      coinsAwarded *= 3;
      target.statuses.splice(tripleIdx, 1);
    }
    const halveIdx = target.statuses.findIndex((s) => s.type === "halveWin");
    if (halveIdx !== -1) {
      coinsAwarded = Math.floor(coinsAwarded / 2);
      target.statuses.splice(halveIdx, 1);
    }

    target.coins += coinsAwarded;
    target.pendingWorldId = null;

    io.emit("caroamico:ended", { playerId: target.id, won, coinsAwarded });
    this.maybeAdvanceTurn(target, io);
    if (isCaroAmicoWorldExhausted(this.playedCaroAmicoDomandaIds)) {
      this.deactivateWorld("officina", io);
    }
    this.broadcastState(io);
  }
  // Avvia il minigioco OCHO ALLA BOMBA (mondo "deserto"): pesca una
  // categoria e un gioco al suo interno (escludendo quelli già giocati in
  // questa partita), rimescola l'ordine delle 9 risposte (altrimenti la
  // bomba sarebbe sempre nella stessa posizione del file sorgente) e mostra
  // l'animazione della ruota verticale, poi rivela la categoria a tutti.
  private beginOcho(player: InternalPlayer, io: IOServer) {
    const category = pickRandomOchoCategory(this.playedOchoIds);
    if (!category) {
      this.deactivateWorld("deserto", io);
      player.pendingWorldId = null;
      this.maybeAdvanceTurn(player, io);
      this.broadcastState(io);
      return;
    }
    const rawGame = pickRandomOchoGameInCategory(category.id, this.playedOchoIds)!;
    this.playedOchoIds.add(rawGame.id);

    const { answers, bombIndex } = shuffleOchoGame(rawGame);
    player.pendingOcho = {
      gameId: rawGame.id,
      categoryId: category.id,
      categoryName: category.name,
      categoryEmoji: category.emoji,
      prompt: rawGame.prompt,
      cells: answers.map((text) => ({ text, revealed: false, isBomb: false })),
      bombIndex,
      safeRevealedCount: 0,
      ended: false,
    };
    const durationMs = 2600;

    io.emit("ocho:spin", { playerId: player.id, durationMs });

    setTimeout(() => {
      if (!player.pendingOcho || player.pendingOcho.gameId !== rawGame.id) return;
      player.awaitingOchoStart = true;
      io.emit("ocho:categoryDrawn", {
        playerId: player.id,
        categoryId: category.id,
        categoryName: category.name,
        categoryEmoji: category.emoji,
      });
    }, durationMs);
  }

  // Conferma la categoria e apre davvero la griglia di gioco.
  beginOchoGame(playerId: string, io: IOServer) {
    const player = this.players.get(playerId);
    if (!player) return;
    if (this.currentTurnPlayerId() !== playerId) {
      io.to(player.socketId).emit("error:message", { message: "Non è il tuo turno." });
      return;
    }
    if (!player.awaitingOchoStart) return;
    player.awaitingOchoStart = false;
    this.broadcastOchoState(player, io);
  }

  // Costruisce il payload pubblico dello stato di OCHO: a differenza di
  // Top5/CaroAmico non serve una versione "solo host", perché non c'è nulla
  // da nascondere selettivamente (la bomba è segreta per tutti allo stesso
  // modo finché non viene rivelata).
  private buildOchoStatePayload(player: InternalPlayer) {
    const ocho = player.pendingOcho!;
    return {
      playerId: player.id,
      categoryName: ocho.categoryName,
      categoryEmoji: ocho.categoryEmoji,
      prompt: ocho.prompt,
      cells: ocho.cells.map((c) => ({
        text: c.text,
        revealed: c.revealed,
        isBomb: c.revealed ? c.isBomb : false,
      })),
      ended: ocho.ended,
    };
  }

  private broadcastOchoState(player: InternalPlayer, io: IOServer) {
    if (!player.pendingOcho) return;
    io.emit("ocho:state", this.buildOchoStatePayload(player));
  }

  // Il giocatore stesso (non l'host) seleziona una cella, cercando di
  // evitare la bomba. Il gioco si blocca (ended = true) se la trova, oppure
  // se resta scoperta solo lei: in quel caso la releviamo comunque, per
  // chiarezza, invece di lasciarla nascosta senza motivo.
  selectOchoCell(playerId: string, index: number, io: IOServer) {
    const player = this.players.get(playerId);
    if (!player || !player.pendingOcho) return;
    const ocho = player.pendingOcho;
    if (ocho.ended) return;
    if (index < 0 || index >= ocho.cells.length) return;

    const cell = ocho.cells[index];
    if (cell.revealed) return;

    cell.revealed = true;

    if (index === ocho.bombIndex) {
      cell.isBomb = true;
      ocho.ended = true;
    } else {
      cell.isBomb = false;
      ocho.safeRevealedCount += 1;
      if (ocho.safeRevealedCount >= ocho.cells.length - 1) {
        // restava solo la bomba: niente altro da scegliere, la sveliamo e ci fermiamo qui
        const bombCell = ocho.cells[ocho.bombIndex];
        bombCell.revealed = true;
        bombCell.isBomb = true;
        ocho.ended = true;
      }
    }

    this.broadcastOchoState(player, io);
  }

  // Solo l'host, e solo a selezione conclusa, decreta quante monete
  // assegnare (0, 50 o 100): stessi moltiplicatori di stato degli altri
  // minigiochi (vincita doppia/tripla/dimezzata).
  resolveOcho(hostId: string, coinsAwarded: number, io: IOServer) {
    const host = this.players.get(hostId);
    if (!host?.isHost) return;
    const target = [...this.players.values()].find((p) => p.pendingOcho);
    if (!target?.pendingOcho) return;
    if (!target.pendingOcho.ended) return;
    if (!OCHO_VALID_REWARDS.includes(coinsAwarded)) return;

    target.pendingOcho = null;

    // figurine con effetto passivo: si applicano da sole alla fine di ogni gioco
    this.applyPassiveCardEffects(target);

    let finalCoins = coinsAwarded;

    const doubleIdx = target.statuses.findIndex((s) => s.type === "doubleWin");
    if (doubleIdx !== -1) {
      finalCoins *= 2;
      target.statuses.splice(doubleIdx, 1);
    }
    const tripleIdx = target.statuses.findIndex((s) => s.type === "tripleWin");
    if (tripleIdx !== -1) {
      finalCoins *= 3;
      target.statuses.splice(tripleIdx, 1);
    }
    const halveIdx = target.statuses.findIndex((s) => s.type === "halveWin");
    if (halveIdx !== -1) {
      finalCoins = Math.floor(finalCoins / 2);
      target.statuses.splice(halveIdx, 1);
    }

    target.coins += finalCoins;
    target.pendingWorldId = null;

    io.emit("ocho:ended", { playerId: target.id, coinsAwarded: finalCoins });
    this.maybeAdvanceTurn(target, io);
    if (isOchoWorldExhausted(this.playedOchoIds)) {
      this.deactivateWorld("deserto", io);
    }
    this.broadcastState(io);
  }

  // Avvia il minigioco ACCHIAPPA LA PAPERA (mondo "ghiacciaia"): pesca una
  // categoria (escludendo quelle già giocate in questa partita) e rimescola
  // le opzioni delle sue 4 domande, poi mostra l'animazione della ruota
  // verticale e rivela la categoria a tutti.
  private beginDuck(player: InternalPlayer, io: IOServer) {
    const category = pickRandomDuckCategory(this.playedDuckCategoryIds);
    if (!category) {
      this.deactivateWorld("ghiacciaia", io);
      player.pendingWorldId = null;
      this.maybeAdvanceTurn(player, io);
      this.broadcastState(io);
      return;
    }
    this.playedDuckCategoryIds.add(category.id);
    const rawQuestions = getDuckQuestions(category.id);
    const questions = shuffleDuckQuestions(rawQuestions);

    player.pendingDuck = {
      categoryId: category.id,
      categoryName: category.name,
      categoryEmoji: category.emoji,
      questions,
      questionIndex: -1,
      correctCount: 0,
      wrongCount: 0,
      awaitingAnswer: false,
      grid: null,
      ended: false,
    };
    const durationMs = 2600;

    io.emit("duck:spin", { playerId: player.id, durationMs });

    setTimeout(() => {
      if (!player.pendingDuck || player.pendingDuck.categoryId !== category.id) return;
      player.awaitingDuckStart = true;
      io.emit("duck:categoryDrawn", {
        playerId: player.id,
        categoryId: category.id,
        categoryName: category.name,
        categoryEmoji: category.emoji,
      });
    }, durationMs);
  }

  // Conferma la categoria e fa partire la prima domanda del quiz.
  beginDuckGame(playerId: string, io: IOServer) {
    const player = this.players.get(playerId);
    if (!player) return;
    if (this.currentTurnPlayerId() !== playerId) {
      io.to(player.socketId).emit("error:message", { message: "Non è il tuo turno." });
      return;
    }
    if (!player.awaitingDuckStart || !player.pendingDuck) return;
    player.awaitingDuckStart = false;
    this.advanceDuckQuestion(player, io);
  }

  // Manda al giocatore la prossima domanda del quiz (quella dopo
  // questionIndex), aggiornando l'indice e riaprendo l'attesa di risposta.
  private advanceDuckQuestion(player: InternalPlayer, io: IOServer) {
    const duck = player.pendingDuck;
    if (!duck) return;
    duck.questionIndex += 1;
    duck.awaitingAnswer = true;
    const q = duck.questions[duck.questionIndex];
    io.emit("duck:question", {
      playerId: player.id,
      categoryName: duck.categoryName,
      categoryEmoji: duck.categoryEmoji,
      questionIndex: duck.questionIndex,
      totalQuestions: duck.questions.length,
      question: { question: q.question, options: q.options },
      correctSoFar: duck.correctCount,
      wrongSoFar: duck.wrongCount,
    });
  }

  // Registra la risposta alla domanda corrente. Il quiz si ferma SUBITO
  // appena l'esito è matematicamente deciso: 3 corrette (qualificato, passa
  // alla griglia premi) oppure 2 errori prima di arrivare a 3 corrette
  // (fallito, prova persa, niente griglia) — così come confermato dall'utente,
  // senza aspettare la quarta domanda se non serve più.
  answerDuck(playerId: string, questionIndex: number, answerIndex: number | null, io: IOServer) {
    const player = this.players.get(playerId);
    if (!player || !player.pendingDuck) return;
    const duck = player.pendingDuck;
    if (!duck.awaitingAnswer || duck.questionIndex !== questionIndex) return;
    duck.awaitingAnswer = false;

    const q = duck.questions[duck.questionIndex];
    const correct = answerIndex !== null && answerIndex === q.correctIndex;
    if (correct) duck.correctCount += 1;
    else duck.wrongCount += 1;

    const qualified = duck.correctCount >= 3;
    const failed = !qualified && duck.wrongCount >= 2;

    io.emit("duck:answerResult", {
      playerId: player.id,
      questionIndex: duck.questionIndex,
      correct,
      correctIndex: q.correctIndex,
      correctSoFar: duck.correctCount,
      wrongSoFar: duck.wrongCount,
      qualified,
      failed,
    });

    // Diamo un attimo di tempo per vedere il colore verde/rosso della
    // risposta prima di passare oltre (stesso ritmo dell'attesa usata da
    // OCHO ALLA BOMBA tra un'azione e l'altra).
    const REVEAL_DELAY_MS = 1800;
    setTimeout(() => {
      if (player.pendingDuck !== duck) return; // il giocatore potrebbe aver lasciato il mondo nel frattempo
      if (qualified) {
        this.beginDuckGrid(player, io);
      } else if (failed) {
        this.finishDuckWithoutGrid(player, io);
      } else if (duck.questionIndex + 1 < duck.questions.length) {
        this.advanceDuckQuestion(player, io);
      } else {
        // sicurezza: esaurite le 4 domande senza 3 corrette né 2 errori
        // (non dovrebbe capitare matematicamente, ma non blocchiamo il gioco)
        this.finishDuckWithoutGrid(player, io);
      }
    }, REVEAL_DELAY_MS);
  }

  // Il quiz è stato superato: prepara la griglia premi (9 caselle, valori
  // rimescolati a ogni accesso) e la manda a tutti, ancora tutta coperta.
  private beginDuckGrid(player: InternalPlayer, io: IOServer) {
    const duck = player.pendingDuck;
    if (!duck) return;
    const prizes = shuffleDuckPrizes();
    duck.grid = prizes.map((prize) => ({ prize, revealed: false, chosen: false }));
    this.broadcastDuckGrid(player, io);
  }

  private buildDuckGridPayload(player: InternalPlayer) {
    const duck = player.pendingDuck!;
    return {
      playerId: player.id,
      categoryName: duck.categoryName,
      categoryEmoji: duck.categoryEmoji,
      cells: duck.grid!.map((c) => ({
        revealed: c.revealed,
        prize: c.revealed ? c.prize : null,
        chosen: c.chosen,
      })),
    };
  }

  private broadcastDuckGrid(player: InternalPlayer, io: IOServer) {
    if (!player.pendingDuck?.grid) return;
    io.emit("duck:gridState", this.buildDuckGridPayload(player));
  }

  // Il giocatore stesso (nessun host coinvolto) sceglie UNA delle 9 caselle:
  // si svelano SUBITO tutte le posizioni dei premi, ma solo quello della
  // cella scelta viene poi assegnato in monete (dopo una breve pausa per
  // lasciar vedere il reveal completo).
  selectDuckCell(playerId: string, index: number, io: IOServer) {
    const player = this.players.get(playerId);
    if (!player?.pendingDuck?.grid) return;
    const duck = player.pendingDuck;
    if (duck.ended) return;
    if (index < 0 || index >= duck.grid!.length) return;
    if (duck.grid!.some((c) => c.revealed)) return; // scelta già fatta

    duck.grid!.forEach((c) => {
      c.revealed = true;
    });
    duck.grid![index].chosen = true;
    duck.ended = true;
    const chosenPrize = duck.grid![index].prize;

    this.broadcastDuckGrid(player, io);

    const REVEAL_DELAY_MS = 3000;
    setTimeout(() => {
      this.finalizeDuck(player, chosenPrize, io);
    }, REVEAL_DELAY_MS);
  }

  // Quiz fallito prima della griglia: nessun premio, prova persa.
  private finishDuckWithoutGrid(player: InternalPlayer, io: IOServer) {
    this.finalizeDuck(player, 0, io);
  }

  // Applica i moltiplicatori di stato (vincita doppia/tripla/dimezzata) e le
  // figurine passive, assegna le monete, avanza il turno e notifica tutti:
  // stessa logica di resolveOcho più sopra, semplicemente innescata in
  // automatico dal server invece che da una conferma dell'host.
  private finalizeDuck(player: InternalPlayer, baseCoins: number, io: IOServer) {
    if (!player.pendingDuck) return;
    player.pendingDuck = null;

    this.applyPassiveCardEffects(player);

    let finalCoins = baseCoins;

    const doubleIdx = player.statuses.findIndex((s) => s.type === "doubleWin");
    if (doubleIdx !== -1) {
      finalCoins *= 2;
      player.statuses.splice(doubleIdx, 1);
    }
    const tripleIdx = player.statuses.findIndex((s) => s.type === "tripleWin");
    if (tripleIdx !== -1) {
      finalCoins *= 3;
      player.statuses.splice(tripleIdx, 1);
    }
    const halveIdx = player.statuses.findIndex((s) => s.type === "halveWin");
    if (halveIdx !== -1) {
      finalCoins = Math.floor(finalCoins / 2);
      player.statuses.splice(halveIdx, 1);
    }

    player.coins += finalCoins;
    player.pendingWorldId = null;

    io.emit("duck:ended", { playerId: player.id, coinsAwarded: finalCoins });
    this.maybeAdvanceTurn(player, io);
    if (isDuckWorldExhausted(this.playedDuckCategoryIds)) {
      this.deactivateWorld("ghiacciaia", io);
    }
    this.broadcastState(io);
  }

  // Avvia GRANDIOSO QUIZ PARTICOLARE (mondo "foresta"): pesca una categoria
  // a caso fra le 5 (Animali/Serie TV/Film/Musica/Videogiochi), solo tra
  // quelle che hanno ancora almeno 2 item freschi, e pesca 2 item distinti
  // al suo interno, mai ripetuti nella stessa partita.
  private beginParticolare(player: InternalPlayer, io: IOServer) {
    const category = pickRandomParticolareCategory(2, this.playedParticolareItemIds);
    if (!category) {
      this.deactivateWorld("foresta", io);
      player.pendingWorldId = null;
      this.maybeAdvanceTurn(player, io);
      this.broadcastState(io);
      return;
    }
    const rawItems = pickRandomParticolareItems(category.id, 2, this.playedParticolareItemIds)!;
    for (const item of rawItems) this.playedParticolareItemIds.add(item.id);

    const items: PendingParticolareItem[] = rawItems.map((item) => {
      if ("videoId" in item) {
        return { id: item.id, answer: item.answer, media: { kind: "youtube", videoId: item.videoId } };
      }
      return {
        id: item.id,
        answer: item.answer,
        media: { kind: "image", detailUrl: item.detailUrl, fullUrl: item.fullUrl },
      };
    });

    player.pendingParticolare = {
      categoryId: category.id,
      categoryName: category.name,
      categoryEmoji: category.emoji,
      items,
      questionIndex: 0,
      revealed: false,
    };

    const durationMs = 2600;
    io.emit("particolare:spin", { playerId: player.id, durationMs });

    setTimeout(() => {
      if (!player.pendingParticolare || player.pendingParticolare.categoryId !== category.id) return;
      player.awaitingParticolareStart = true;
      io.emit("particolare:categoryDrawn", {
        playerId: player.id,
        categoryId: category.id,
        categoryName: category.name,
        categoryEmoji: category.emoji,
      });
    }, durationMs);
  }

  // Conferma la categoria e mostra la prima delle 2 domande.
  beginParticolareGame(playerId: string, io: IOServer) {
    const player = this.players.get(playerId);
    if (!player) return;
    if (this.currentTurnPlayerId() !== playerId) {
      io.to(player.socketId).emit("error:message", { message: "Non è il tuo turno." });
      return;
    }
    if (!player.awaitingParticolareStart || !player.pendingParticolare) return;
    player.awaitingParticolareStart = false;
    this.broadcastParticolareQuestion(player, io);
  }

  // Costruisce il payload della domanda corrente: per le categorie a
  // immagine, mostra sempre detailUrl (e fullUrl solo se rivelata); per le
  // categorie YouTube, il videoId è SEMPRE incluso per tutti i client (serve
  // l'audio ovunque), è il client stesso a nascondere il player visivamente
  // se non è l'host, per non spoilerare la risposta.
  private buildParticolareQuestionPayload(player: InternalPlayer) {
    const p = player.pendingParticolare!;
    const item = p.items[p.questionIndex];
    const media =
      item.media.kind === "image"
        ? { kind: "image" as const, detailUrl: item.media.detailUrl, fullUrl: p.revealed ? item.media.fullUrl : undefined }
        : { kind: "youtube" as const, videoId: item.media.videoId };

    return {
      playerId: player.id,
      categoryId: p.categoryId,
      categoryName: p.categoryName,
      categoryEmoji: p.categoryEmoji,
      questionIndex: p.questionIndex,
      totalQuestions: p.items.length,
      media,
      revealed: p.revealed,
      answer: p.revealed ? item.answer : null,
    };
  }

  // Manda lo stato della domanda corrente a TUTTI i client con lo stesso
  // payload (incluso il videoId per le categorie YouTube: l'audio deve
  // riprodursi sul dispositivo di ognuno). È il CLIENT a decidere, in base
  // al proprio isHost, se mostrare il player video oppure tenerlo presente
  // ma nascosto visivamente (solo l'host deve poter leggere titolo/anteprima
  // del video, per non spoilerare la risposta agli altri).
  private broadcastParticolareQuestion(player: InternalPlayer, io: IOServer) {
    if (!player.pendingParticolare) return;
    io.emit("particolare:question", this.buildParticolareQuestionPayload(player));
  }

  // Solo l'host può passare alla domanda successiva (dopo che il giocatore
  // di turno ha risposto a voce alla prima).
  nextParticolareQuestion(hostId: string, io: IOServer) {
    const host = this.players.get(hostId);
    if (!host?.isHost) return;
    const target = [...this.players.values()].find((p) => p.pendingParticolare);
    if (!target?.pendingParticolare) return;
    const p = target.pendingParticolare;
    if (p.questionIndex >= p.items.length - 1) return;
    p.questionIndex += 1;
    p.revealed = false;
    this.broadcastParticolareQuestion(target, io);
  }

  // Solo l'host può svelare la risposta corretta della domanda corrente
  // (dopo che il giocatore di turno l'ha detta a voce). Per le categorie a
  // immagine, questo mostra anche la foto intera oltre al dettaglio.
  revealParticolareAnswer(hostId: string, io: IOServer) {
    const host = this.players.get(hostId);
    if (!host?.isHost) return;
    const target = [...this.players.values()].find((p) => p.pendingParticolare);
    if (!target?.pendingParticolare) return;
    target.pendingParticolare.revealed = true;
    this.broadcastParticolareQuestion(target, io);
  }

  // L'host preme play/pausa/riavvolgi sul suo player YouTube: viene
  // ribroadcastato a tutti così che il player (nascosto visivamente, ma
  // presente e in ascolto) di ogni client resti sincronizzato e l'audio
  // parta/si fermi/riparta da capo su OGNI dispositivo, non solo su quello
  // dell'host.
  particolareMediaControl(hostId: string, action: "play" | "pause" | "rewind", io: IOServer) {
    const host = this.players.get(hostId);
    if (!host?.isHost) return;
    if (!host.pendingParticolare && ![...this.players.values()].some((p) => p.pendingParticolare)) return;
    io.emit("particolare:mediaControl", { action });
  }

  // Solo l'host decreta il premio finale per l'intero minigioco (0, 50 o
  // 100 monete): stessi moltiplicatori di stato degli altri minigiochi.
  resolveParticolare(hostId: string, coinsAwarded: number, io: IOServer) {
    const host = this.players.get(hostId);
    if (!host?.isHost) return;
    const target = [...this.players.values()].find((p) => p.pendingParticolare);
    if (!target?.pendingParticolare) return;
    if (!PARTICOLARE_VALID_REWARDS.includes(coinsAwarded)) return;

    target.pendingParticolare = null;

    this.applyPassiveCardEffects(target);

    let finalCoins = coinsAwarded;

    const doubleIdx = target.statuses.findIndex((s) => s.type === "doubleWin");
    if (doubleIdx !== -1) {
      finalCoins *= 2;
      target.statuses.splice(doubleIdx, 1);
    }
    const tripleIdx = target.statuses.findIndex((s) => s.type === "tripleWin");
    if (tripleIdx !== -1) {
      finalCoins *= 3;
      target.statuses.splice(tripleIdx, 1);
    }
    const halveIdx = target.statuses.findIndex((s) => s.type === "halveWin");
    if (halveIdx !== -1) {
      finalCoins = Math.floor(finalCoins / 2);
      target.statuses.splice(halveIdx, 1);
    }

    target.coins += finalCoins;
    target.pendingWorldId = null;

    io.emit("particolare:ended", { playerId: target.id, coinsAwarded: finalCoins });
    this.maybeAdvanceTurn(target, io);
    if (isParticolareWorldExhausted(2, this.playedParticolareItemIds)) {
      this.deactivateWorld("foresta", io);
    }
    this.broadcastState(io);
  }

  // Avvia IL GRANDIOSO BUZZ (mondo "cieli"): pesca una categoria a caso fra
  // le 5 (stesse di Grandioso Quiz Particolare, ma pool ed esclusione
  // separati) e UNA sola domanda al suo interno (mai ripetuta nella
  // stessa partita, pool dedicato e distinto da quello di Particolare).
  // A differenza degli altri minigiochi lo stato non vive sull'InternalPlayer
  // che ha fatto scattare il round, ma sulla sessione: giocano tutti.
  private beginBuzz(player: InternalPlayer, io: IOServer) {
    const category = pickRandomBuzzCategory(this.playedBuzzItemIds);
    if (!category) {
      this.deactivateWorld("cieli", io);
      player.pendingWorldId = null;
      this.maybeAdvanceTurn(player, io);
      this.broadcastState(io);
      return;
    }
    const rawItem = pickRandomBuzzItem(category.id, this.playedBuzzItemIds)!;
    this.playedBuzzItemIds.add(rawItem.id);

    const item: PendingParticolareItem =
      "videoId" in rawItem
        ? { id: rawItem.id, answer: rawItem.answer, media: { kind: "youtube", videoId: rawItem.videoId } }
        : {
            id: rawItem.id,
            answer: rawItem.answer,
            media: { kind: "image", detailUrl: rawItem.detailUrl, fullUrl: rawItem.fullUrl },
          };

    this.pendingBuzz = {
      triggeringPlayerId: player.id,
      categoryId: category.id,
      categoryName: category.name,
      categoryEmoji: category.emoji,
      item,
      started: false,
      revealed: false,
      buzzOrder: [],
    };

    const durationMs = 2600;
    io.emit("buzz:spin", { durationMs });

    setTimeout(() => {
      if (
        !this.pendingBuzz ||
        this.pendingBuzz.categoryId !== category.id ||
        this.pendingBuzz.triggeringPlayerId !== player.id
      ) {
        return;
      }
      io.emit("buzz:categoryDrawn", {
        categoryId: category.id,
        categoryName: category.name,
        categoryEmoji: category.emoji,
      });
    }, durationMs);
  }

  // Solo l'host avvia la domanda vera dopo la schermata di categoria: qui
  // non è il giocatore di turno a dover confermare (come in Particolare),
  // perché il round coinvolge tutta la sala.
  beginBuzzGame(hostId: string, io: IOServer) {
    const host = this.players.get(hostId);
    if (!host?.isHost) return;
    if (!this.pendingBuzz || this.pendingBuzz.started) return;
    this.pendingBuzz.started = true;
    this.broadcastBuzzQuestion(io);
  }

  // Costruisce il payload della domanda corrente: stessa logica di
  // Particolare (detailUrl sempre, fullUrl solo se rivelata; videoId sempre
  // incluso, nascosto visivamente lato client se non si è l'host), più
  // l'elenco ordinato di chi ha buzzato finora.
  private buildBuzzQuestionPayload(): BuzzQuestionPayload {
    const b = this.pendingBuzz!;
    const media =
      b.item.media.kind === "image"
        ? { kind: "image" as const, detailUrl: b.item.media.detailUrl, fullUrl: b.revealed ? b.item.media.fullUrl : undefined }
        : { kind: "youtube" as const, videoId: b.item.media.videoId };

    return {
      categoryId: b.categoryId,
      categoryName: b.categoryName,
      categoryEmoji: b.categoryEmoji,
      media,
      revealed: b.revealed,
      answer: b.revealed ? b.item.answer : null,
      buzzOrder: b.buzzOrder,
    };
  }

  private broadcastBuzzQuestion(io: IOServer) {
    if (!this.pendingBuzz) return;
    io.emit("buzz:question", this.buildBuzzQuestionPayload());
  }

  // Qualsiasi giocatore (host incluso, dato che partecipa anche lui alla
  // partita) può prenotarsi: si aggiunge in coda solo se non ha già buzzato
  // in questo round e solo mentre la domanda è attiva e non ancora svelata.
  pressBuzz(playerId: string, io: IOServer) {
    const player = this.players.get(playerId);
    if (!player) return;
    if (!this.pendingBuzz || !this.pendingBuzz.started || this.pendingBuzz.revealed) return;
    if (this.pendingBuzz.buzzOrder.includes(playerId)) return;
    this.pendingBuzz.buzzOrder.push(playerId);
    this.broadcastBuzzQuestion(io);
  }

  // Solo l'host può azzerare la coda dei buzz (es. se chi ha risposto per
  // primo ha sbagliato a voce e si vuole riaprire la prenotazione a tutti,
  // compreso chi aveva già buzzato).
  resetBuzz(hostId: string, io: IOServer) {
    const host = this.players.get(hostId);
    if (!host?.isHost) return;
    if (!this.pendingBuzz) return;
    this.pendingBuzz.buzzOrder = [];
    this.broadcastBuzzQuestion(io);
  }

  // Solo l'host può svelare la risposta corretta (dopo che qualcuno ha
  // risposto a voce). Per le categorie a immagine mostra anche la foto
  // intera oltre al dettaglio.
  revealBuzzAnswer(hostId: string, io: IOServer) {
    const host = this.players.get(hostId);
    if (!host?.isHost) return;
    if (!this.pendingBuzz) return;
    this.pendingBuzz.revealed = true;
    this.broadcastBuzzQuestion(io);
  }

  // Stesso pattern di Particolare per le categorie YouTube: l'host preme
  // play/pausa/riavvolgi sul proprio player, ribroadcastato a tutti così che
  // il player nascosto (ma presente) di ogni client resti sincronizzato.
  buzzMediaControl(hostId: string, action: "play" | "pause" | "rewind", io: IOServer) {
    const host = this.players.get(hostId);
    if (!host?.isHost) return;
    if (!this.pendingBuzz) return;
    io.emit("buzz:mediaControl", { action });
  }

  // Solo l'host decreta chi ha risposto correttamente per primo (o nessuno):
  // il premio è fisso a 100 monete (moltiplicato/dimezzato dagli status del
  // VINCITORE, non del giocatore di turno). Il giocatore che aveva fatto
  // scattare il round chiude comunque il proprio turno normalmente.
  resolveBuzz(hostId: string, winnerId: string | null, io: IOServer) {
    const host = this.players.get(hostId);
    if (!host?.isHost) return;
    if (!this.pendingBuzz) return;
    const triggeringPlayer = this.players.get(this.pendingBuzz.triggeringPlayerId);
    if (!triggeringPlayer) return;

    let finalCoins = 0;
    if (winnerId) {
      const winner = this.players.get(winnerId);
      if (winner) {
        finalCoins = BUZZ_REWARD;
        const doubleIdx = winner.statuses.findIndex((s) => s.type === "doubleWin");
        if (doubleIdx !== -1) {
          finalCoins *= 2;
          winner.statuses.splice(doubleIdx, 1);
        }
        const tripleIdx = winner.statuses.findIndex((s) => s.type === "tripleWin");
        if (tripleIdx !== -1) {
          finalCoins *= 3;
          winner.statuses.splice(tripleIdx, 1);
        }
        const halveIdx = winner.statuses.findIndex((s) => s.type === "halveWin");
        if (halveIdx !== -1) {
          finalCoins = Math.floor(finalCoins / 2);
          winner.statuses.splice(halveIdx, 1);
        }
        winner.coins += finalCoins;
      }
    }

    this.pendingBuzz = null;
    this.applyPassiveCardEffects(triggeringPlayer);
    triggeringPlayer.pendingWorldId = null;

    io.emit("buzz:ended", { winnerId, coinsAwarded: finalCoins });
    this.maybeAdvanceTurn(triggeringPlayer, io);
    if (isBuzzWorldExhausted(this.playedBuzzItemIds)) {
      this.deactivateWorld("cieli", io);
    }
    this.broadcastState(io);
  }

  // Avvia SFIDA GINO (mondo "rovine"): pesca una fra le 2 categorie
  // (Indovina la Capitale / Indovina la Bandiera), solo tra quelle che hanno
  // ancora abbastanza elementi freschi, e si gioca AL MEGLIO DI 3 domande
  // all'interno di quella stessa categoria, mai ripetute nella stessa
  // partita.
  private beginSfidaGino(player: InternalPlayer, io: IOServer) {
    const ROUND_COUNT = 3;
    const category = pickRandomSfidaGinoCategory(
      ROUND_COUNT,
      this.playedSfidaGinoFlagIds,
      this.playedSfidaGinoCapitalIds
    );
    if (!category) {
      this.deactivateWorld("rovine", io);
      player.pendingWorldId = null;
      this.maybeAdvanceTurn(player, io);
      this.broadcastState(io);
      return;
    }

    let rounds: PendingSfidaGinoRound[];

    if (category.id === "capitali") {
      const capitals = pickRandomSfidaGinoCapitals(ROUND_COUNT, this.playedSfidaGinoCapitalIds);
      for (const c of capitals) this.playedSfidaGinoCapitalIds.add(c.id);
      rounds = capitals.map((c) => ({
        itemId: c.id,
        prompt: { kind: "text", text: c.question },
        answer: c.answer,
      }));
    } else {
      const flags = pickRandomSfidaGinoFlags(ROUND_COUNT, this.playedSfidaGinoFlagIds);
      for (const f of flags) this.playedSfidaGinoFlagIds.add(f.id);
      rounds = flags.map((f) => ({
        itemId: f.id,
        prompt: { kind: "image", imageUrl: f.imageUrl },
        answer: f.answer,
      }));
    }

    const pending: PendingSfidaGino = {
      categoryId: category.id,
      categoryName: category.name,
      categoryEmoji: category.emoji,
      rounds,
      questionIndex: 0,
      revealed: false,
    };
    player.pendingSfidaGino = pending;

    const durationMs = 2600;
    io.emit("sfidaGino:spin", { playerId: player.id, durationMs });

    setTimeout(() => {
      if (player.pendingSfidaGino !== pending) return;
      player.awaitingSfidaGinoStart = true;
      io.emit("sfidaGino:categoryDrawn", {
        playerId: player.id,
        categoryId: category.id,
        categoryName: category.name,
        categoryEmoji: category.emoji,
      });
    }, durationMs);
  }

  // Conferma la categoria e mostra la domanda.
  beginSfidaGinoGame(playerId: string, io: IOServer) {
    const player = this.players.get(playerId);
    if (!player) return;
    if (this.currentTurnPlayerId() !== playerId) {
      io.to(player.socketId).emit("error:message", { message: "Non è il tuo turno." });
      return;
    }
    if (!player.awaitingSfidaGinoStart || !player.pendingSfidaGino) return;
    player.awaitingSfidaGinoStart = false;
    this.broadcastSfidaGinoQuestion(player, io);
  }

  private buildSfidaGinoQuestionPayload(player: InternalPlayer): SfidaGinoQuestionPayload {
    const p = player.pendingSfidaGino!;
    const round = p.rounds[p.questionIndex];
    return {
      playerId: player.id,
      categoryId: p.categoryId,
      categoryName: p.categoryName,
      categoryEmoji: p.categoryEmoji,
      questionIndex: p.questionIndex,
      totalQuestions: p.rounds.length,
      prompt: round.prompt,
      revealed: p.revealed,
      answer: p.revealed ? round.answer : null,
    };
  }

  private broadcastSfidaGinoQuestion(player: InternalPlayer, io: IOServer) {
    if (!player.pendingSfidaGino) return;
    io.emit("sfidaGino:question", this.buildSfidaGinoQuestionPayload(player));
  }

  // Solo l'host può passare alla domanda successiva (dopo che il giocatore
  // di turno ha risposto a voce alla domanda corrente). Si gioca al meglio
  // di 3: si avanza fino alla terza, poi l'host assegna 2000 o 0 in base a
  // quante ne ha indovinate.
  nextSfidaGinoQuestion(hostId: string, io: IOServer) {
    const host = this.players.get(hostId);
    if (!host?.isHost) return;
    const target = [...this.players.values()].find((p) => p.pendingSfidaGino);
    if (!target?.pendingSfidaGino) return;
    const p = target.pendingSfidaGino;
    if (p.questionIndex >= p.rounds.length - 1) return;
    p.questionIndex += 1;
    p.revealed = false;
    this.broadcastSfidaGinoQuestion(target, io);
  }

  // Solo l'host può svelare la risposta corretta della domanda corrente
  // (dopo che il giocatore di turno ha risposto a voce).
  revealSfidaGinoAnswer(hostId: string, io: IOServer) {
    const host = this.players.get(hostId);
    if (!host?.isHost) return;
    const target = [...this.players.values()].find((p) => p.pendingSfidaGino);
    if (!target?.pendingSfidaGino) return;
    target.pendingSfidaGino.revealed = true;
    this.broadcastSfidaGinoQuestion(target, io);
  }

  // Solo l'host decreta il premio finale per l'intero minigioco (al meglio
  // di 3): 2000 monete o 0, binario (nessuna via di mezzo, a differenza di
  // Ocho/Particolare/Duck). Stessi moltiplicatori di stato degli altri
  // minigiochi.
  resolveSfidaGino(hostId: string, coinsAwarded: number, io: IOServer) {
    const host = this.players.get(hostId);
    if (!host?.isHost) return;
    const target = [...this.players.values()].find((p) => p.pendingSfidaGino);
    if (!target?.pendingSfidaGino) return;
    if (coinsAwarded !== 0 && coinsAwarded !== SFIDA_GINO_REWARD) return;

    target.pendingSfidaGino = null;

    this.applyPassiveCardEffects(target);

    let finalCoins = coinsAwarded;

    const doubleIdx = target.statuses.findIndex((s) => s.type === "doubleWin");
    if (doubleIdx !== -1) {
      finalCoins *= 2;
      target.statuses.splice(doubleIdx, 1);
    }
    const tripleIdx = target.statuses.findIndex((s) => s.type === "tripleWin");
    if (tripleIdx !== -1) {
      finalCoins *= 3;
      target.statuses.splice(tripleIdx, 1);
    }
    const halveIdx = target.statuses.findIndex((s) => s.type === "halveWin");
    if (halveIdx !== -1) {
      finalCoins = Math.floor(finalCoins / 2);
      target.statuses.splice(halveIdx, 1);
    }

    target.coins += finalCoins;
    target.pendingWorldId = null;

    io.emit("sfidaGino:ended", { playerId: target.id, coinsAwarded: finalCoins });
    this.maybeAdvanceTurn(target, io);
    if (isSfidaGinoWorldExhausted(3, this.playedSfidaGinoFlagIds, this.playedSfidaGinoCapitalIds)) {
      this.deactivateWorld("rovine", io);
    }
    this.broadcastState(io);
  }

  // Avvia il round di TCT (mondo "abisso"): tutti i giocatori connessi con
  // almeno 100 monete vengono iscritti automaticamente, pagano la quota
  // (che forma il montepremi) e si pescano le domande. La condizione per
  // giocare NON è "esistono almeno due giocatori qualsiasi qualificati": è
  // il giocatore di turno stesso che deve avere almeno 100 monete, E deve
  // esisterne almeno un altro (connesso, con almeno 100 monete) che gli
  // faccia da sfidante. Altrimenti il tuffo nell'abisso salta e il turno
  // prosegue normale.
  private beginTct(player: InternalPlayer, io: IOServer) {
    if (isTctWorldExhausted(TCT_QUESTION_COUNT, this.playedTctQuestionIds)) {
      // Non dovrebbe succedere (il movimento impedisce di atterrare su un
      // mondo già disattivato), ma per sicurezza controlliamo comunque PRIMA
      // di scalare la quota d'ingresso a nessuno.
      this.deactivateWorld("abisso", io);
      player.pendingWorldId = null;
      this.maybeAdvanceTurn(player, io);
      this.broadcastState(io);
      return;
    }
    const turnPlayerQualifies = player.coins >= TCT_ENTRY_FEE;
    const otherQualifyingCount = [...this.players.values()].filter(
      (p) => p.id !== player.id && p.connected && p.coins >= TCT_ENTRY_FEE
    ).length;

    if (!turnPlayerQualifies || otherQualifyingCount < 1) {
      io.emit("tct:skipped", {
        reason: !turnPlayerQualifies
          ? "Il giocatore di turno non ha almeno 100 monete: il tuffo nell'abisso salta."
          : "Serve almeno un altro giocatore con 100 monete: il tuffo nell'abisso salta.",
      });
      player.pendingWorldId = null;
      this.maybeAdvanceTurn(player, io);
      this.broadcastState(io);
      return;
    }

    const participants = [...this.players.values()].filter(
      (p) => p.connected && p.coins >= TCT_ENTRY_FEE
    );

    for (const p of participants) p.coins -= TCT_ENTRY_FEE;
    const potTotal = participants.length * TCT_ENTRY_FEE;

    const questions = pickRandomTctQuestions(TCT_QUESTION_COUNT, this.playedTctQuestionIds);
    for (const q of questions) this.playedTctQuestionIds.add(q.id);

    const totalPoints = new Map<string, number>();
    for (const p of participants) totalPoints.set(p.id, 0);

    this.pendingTct = {
      triggeredByPlayerId: player.id,
      participantIds: participants.map((p) => p.id),
      potTotal,
      questions,
      currentQuestionIndex: -1,
      currentAnswers: new Map(),
      questionStartedAt: 0,
      timer: null,
      totalPoints,
    };

    io.emit("tct:started", {
      participantIds: this.pendingTct.participantIds,
      potTotal,
      entryFee: TCT_ENTRY_FEE,
    });
    this.broadcastState(io); // mostra subito a tutti le monete scalate

    setTimeout(() => this.beginTctQuestion(io), TCT_INTRO_DELAY_MS);
  }

  // Apre la prossima domanda del round di TCT e fa partire il timer lato
  // server (autorevole: il countdown mostrato al client è solo estetico).
  private beginTctQuestion(io: IOServer) {
    const tct = this.pendingTct;
    if (!tct) return;

    tct.currentQuestionIndex += 1;
    tct.currentAnswers = new Map();
    tct.questionStartedAt = Date.now();

    const idx = tct.currentQuestionIndex;
    const q = tct.questions[idx];

    io.emit("tct:question", {
      questionIndex: idx,
      totalQuestions: tct.questions.length,
      question: { question: q.question, options: q.options },
      timeLimitSec: TCT_TIME_LIMIT_SEC,
      participantIds: tct.participantIds,
    });

    tct.timer = setTimeout(() => {
      this.resolveTctQuestion(io);
    }, TCT_TIME_LIMIT_SEC * 1000);
  }

  // Un partecipante risponde alla domanda corrente di TCT. La velocità di
  // risposta (in ms dall'apertura della domanda, calcolata lato server per
  // evitare problemi di sincronizzazione degli orologi) determina i punti.
  submitTctAnswer(playerId: string, answerIndex: number | null, io: IOServer) {
    const tct = this.pendingTct;
    if (!tct) return;
    if (!tct.participantIds.includes(playerId)) return;
    if (tct.currentQuestionIndex < 0) return;
    if (tct.currentAnswers.has(playerId)) return; // ha già risposto a questa domanda

    tct.currentAnswers.set(playerId, {
      index: answerIndex ?? -1,
      atMs: Date.now() - tct.questionStartedAt,
    });

    if (tct.currentAnswers.size >= tct.participantIds.length) {
      // hanno risposto tutti: non serve aspettare il timer
      if (tct.timer) clearTimeout(tct.timer);
      tct.timer = null;
      this.resolveTctQuestion(io);
    }
  }

  // Chiude la domanda corrente (per timeout o perché hanno risposto tutti),
  // assegna i punti (n punti al più veloce tra i corretti, n-1 al secondo,
  // ecc., dove n è il numero di partecipanti) e passa alla prossima
  // domanda, oppure chiude il round se era l'ultima.
  private resolveTctQuestion(io: IOServer) {
    const tct = this.pendingTct;
    if (!tct) return;
    if (tct.timer) {
      clearTimeout(tct.timer);
      tct.timer = null;
    }

    const idx = tct.currentQuestionIndex;
    const q = tct.questions[idx];
    const n = tct.participantIds.length;

    const correctAnswers = tct.participantIds
      .map((pid) => ({ pid, entry: tct.currentAnswers.get(pid) }))
      .filter((e) => e.entry && e.entry.index === q.correctIndex)
      .sort((a, b) => a.entry!.atMs - b.entry!.atMs);

    const results: { playerId: string; correct: boolean; pointsAwarded: number }[] = [];

    correctAnswers.forEach((e, i) => {
      const points = n - i;
      const prev = tct.totalPoints.get(e.pid) ?? 0;
      tct.totalPoints.set(e.pid, prev + points);
      results.push({ playerId: e.pid, correct: true, pointsAwarded: points });
    });

    for (const pid of tct.participantIds) {
      if (!correctAnswers.some((e) => e.pid === pid)) {
        results.push({ playerId: pid, correct: false, pointsAwarded: 0 });
      }
    }

    io.emit("tct:questionResult", {
      questionIndex: idx,
      correctIndex: q.correctIndex,
      correctAnswerText: q.options[q.correctIndex],
      results,
    });

    const isLastQuestion = idx >= tct.questions.length - 1;

    setTimeout(() => {
      if (!this.pendingTct) return;
      if (isLastQuestion) {
        this.finishTct(io);
      } else {
        this.beginTctQuestion(io);
      }
    }, TCT_REVEAL_DELAY_MS);
  }

  // Chiude il round di TCT: calcola la classifica finale, assegna il
  // montepremi (diviso equamente in caso di pareggio in cima) e fa
  // riprendere il turno di chi aveva fatto scattare l'evento.
  private finishTct(io: IOServer) {
    const tct = this.pendingTct;
    if (!tct) return;

    const standings = tct.participantIds
      .map((pid) => ({ playerId: pid, totalPoints: tct.totalPoints.get(pid) ?? 0 }))
      .sort((a, b) => b.totalPoints - a.totalPoints);

    const maxPoints = standings[0]?.totalPoints ?? 0;
    const winnerIds = standings.filter((s) => s.totalPoints === maxPoints).map((s) => s.playerId);
    const share = winnerIds.length > 0 ? Math.floor(tct.potTotal / winnerIds.length) : 0;

    const finalStandings = standings.map((s) => ({
      ...s,
      coinsWon: winnerIds.includes(s.playerId) ? share : 0,
    }));

    for (const winnerId of winnerIds) {
      const p = this.players.get(winnerId);
      if (p) p.coins += share;
    }

    io.emit("tct:ended", {
      standings: finalStandings,
      potTotal: tct.potTotal,
      winnerIds,
    });

    const trigger = this.players.get(tct.triggeredByPlayerId);
    this.pendingTct = null;

    if (trigger) {
      trigger.pendingWorldId = null;
      this.maybeAdvanceTurn(trigger, io);
    }
    if (isTctWorldExhausted(TCT_QUESTION_COUNT, this.playedTctQuestionIds)) {
      this.deactivateWorld("abisso", io);
    }
    this.broadcastState(io);
  }

  beginQuiz(playerId: string, io: IOServer) {
    const player = this.players.get(playerId);
    if (!player) return;
    if (this.currentTurnPlayerId() !== playerId) {
      io.to(player.socketId).emit("error:message", { message: "Non è il tuo turno." });
      return;
    }
    if (!player.awaitingQuizStart) return;
    player.awaitingQuizStart = false;
    this.sendNewQuestion(player, io);
  }

  private sendNewQuestion(player: InternalPlayer, io: IOServer) {
    const question = player.forcedNextCategory
      ? { ...pickRandomQuestionByCategory(player.forcedNextCategory) }
      : { ...pickRandomQuestion() };
    player.forcedNextCategory = null;
    let eliminatedOptionIndex: number | undefined;

    if (player.activeEffects.includes("extraTime")) {
      question.timeLimitSec += 10;
      player.activeEffects = player.activeEffects.filter(
        (e) => e !== "extraTime"
      );
    }

    if (player.activeEffects.includes("removeWrongOption")) {
      const wrongIndexes = question.options
        .map((_, i) => i)
        .filter((i) => i !== question.correctIndex);
      eliminatedOptionIndex =
        wrongIndexes[Math.floor(Math.random() * wrongIndexes.length)];
      player.activeEffects = player.activeEffects.filter(
        (e) => e !== "removeWrongOption"
      );
    }

    player.pendingQuestion = question;
    // Non includiamo mai correctIndex nel payload inviato al client.
    const publicQuestion = {
      id: question.id,
      category: question.category,
      question: question.question,
      options: question.options,
      timeLimitSec: question.timeLimitSec,
    };
    io.emit("quiz:question", {
      playerId: player.id,
      question: publicQuestion,
      activeEffects: player.activeEffects,
      eliminatedOptionIndex,
    });
    this.broadcastState(io);
  }

  submitAnswer(
    playerId: string,
    questionId: string,
    answerIndex: number | null,
    io: IOServer
  ) {
    const player = this.players.get(playerId);
    if (!player || !player.pendingQuestion) return;
    if (player.pendingQuestion.id !== questionId) return;

    const question = player.pendingQuestion;
    player.pendingQuestion = null;

    const skip = player.activeEffects.includes("skipQuestion");
    if (skip) {
      player.activeEffects = player.activeEffects.filter(
        (e) => e !== "skipQuestion"
      );
      this.sendNewQuestion(player, io);
      return;
    }

    const correct = answerIndex !== null && answerIndex === question.correctIndex;
    let coinsAwarded = correct ? BASE_REWARD : WRONG_REWARD;

    if (!correct && player.activeEffects.includes("secondChance")) {
      coinsAwarded = Math.round(BASE_REWARD / 2);
    }
    if (correct && player.activeEffects.includes("doubleCoins")) {
      coinsAwarded *= 2;
    }

    // consuma gli effetti legati all'esito della risposta (una tantum)
    player.activeEffects = player.activeEffects.filter(
      (e) => e !== "secondChance" && e !== "doubleCoins"
    );

    // status da imprevisto/carte che moltiplicano la vincita di questo gioco
    const doubleIdx = player.statuses.findIndex((s) => s.type === "doubleWin");
    if (doubleIdx !== -1) {
      coinsAwarded *= 2;
      player.statuses.splice(doubleIdx, 1);
    }    const tripleIdx = player.statuses.findIndex((s) => s.type === "tripleWin");
    if (tripleIdx !== -1) {
      coinsAwarded *= 3;
      player.statuses.splice(tripleIdx, 1);
    }
    const halveIdx = player.statuses.findIndex((s) => s.type === "halveWin");
    if (halveIdx !== -1) {
      coinsAwarded = Math.floor(coinsAwarded / 2);
      player.statuses.splice(halveIdx, 1);
    }

    // figurine con effetto passivo: si applicano da sole alla fine di ogni gioco
    this.applyPassiveCardEffects(player);

    player.coins += coinsAwarded;
    player.pendingWorldId = null;

    io.emit("quiz:result", {
      playerId: player.id,
      correct,
      correctIndex: question.correctIndex,
      coinsAwarded,
    });

    // la prova è conclusa: il turno passa al giocatore successivo
    this.advanceTurnAndHandleSkips(io);
    this.broadcastState(io);
  }

  private isReadyToRoll(player: InternalPlayer): boolean {
    return (
      player.pendingRoll === null &&
      !player.pendingShop &&
      !player.pendingQuestion &&
      !player.pendingSurprise &&
      !player.pendingChoice &&
      !player.pendingShieldContext &&
      !player.awaitingWheelStart &&
      !player.awaitingQuizStart
    );
  }

  // Se questa è l'unica copia posseduta della carta, la disattiva soltanto
  // (resta in collezione, non più usabile). Se ne possiedi altre, la scarta
  // del tutto: così non ti puoi mai ritrovare con tutte e 5 le copie
  // "spente" e bloccate, senza più poterne pescare di nuove dai pacchetti.
  private consumeCardInstance(player: InternalPlayer, instance: OwnedCard) {
    const totalCopies = player.collection.filter((c) => c.cardId === instance.cardId).length;
    if (totalCopies <= 1) {
      instance.used = true;
    } else {
      const idx = player.collection.indexOf(instance);
      if (idx !== -1) player.collection.splice(idx, 1);
    }
  }

  useCard(playerId: string, cardId: string, io: IOServer) {
    const player = this.players.get(playerId);
    if (!player) return;
    const instance = player.collection.find(
      (c) => c.cardId === cardId && !c.used
    );
    if (!instance) {
      io.to(player.socketId).emit("error:message", {
        message: "Non possiedi una copia disponibile di questa carta.",
      });
      return;
    }
    const cardDef = CARD_CATALOG.find((c) => c.id === cardId);
    if (!cardDef) return;

    if (!cardDef.effect) {
      io.to(player.socketId).emit("error:message", {
        message: "Questa figurina non ha nessun effetto da attivare: vale solo come pezzo da collezione.",
      });
      return;
    }

    if (cardDef.effect.isPassive) {
      io.to(player.socketId).emit("error:message", {
        message: "Questa figurina ha un effetto passivo: si applica da sola, non va attivata.",
      });
      return;
    }

    if (!cardDef.effect.isQuickEffect) {
      const isMyTurn = this.currentTurnPlayerId() === playerId;
      if (!isMyTurn || !this.isReadyToRoll(player)) {
        io.to(player.socketId).emit("error:message", {
          message:
            "Questa carta non ha effetto rapido: puoi usarla solo nel tuo turno, prima di tirare il dado.",
        });
        return;
      }
    } else if (player.pendingWorldId !== null) {
      io.to(player.socketId).emit("error:message", {
        message:
          "Non puoi usare una figurina a effetto rapido mentre sei impegnato in un gioco su un'isola.",
      });
      return;
    }

    if (player.cardsUsedThisTurn.has(cardId)) {
      io.to(player.socketId).emit("error:message", {
        message: "Hai già attivato questa figurina in questo turno.",
      });
      return;
    }

    // effetti "immediati" che non si armano per il prossimo quiz, ma agiscono
    // subito scegliendo uno o più bersagli
    if (cardDef.effect.type === "stealAllFromTwo") {
      this.consumeCardInstance(player, instance);
      player.cardsUsedThisTurn.add(cardId);

      const others = [...this.players.values()].filter(
        (p) => p.id !== player.id && p.connected
      );
      if (others.length === 0) {
        this.broadcastState(io);
        return;
      }
      const targets = others.map((p) => p.id);
      player.pendingChoice = { kind: "stealAllFromTwo", targets };
      this.emitChoiceOptions(player, io);
      this.broadcastState(io);
      return;
    }

    if (cardDef.effect.type === "swapZeroTripleWin") {
      const others = [...this.players.values()].filter(
        (p) => p.id !== player.id && p.connected
      );
      if (others.length === 0) return;
      this.consumeCardInstance(player, instance);
      player.cardsUsedThisTurn.add(cardId);
      player.pendingChoice = { kind: "swapZeroTripleWin" };
      this.emitChoiceOptions(player, io);
      this.broadcastState(io);
      return;
    }

    if (cardDef.effect.type === "chooseNextCategory") {
      this.consumeCardInstance(player, instance);
      player.cardsUsedThisTurn.add(cardId);
      player.pendingChoice = { kind: "chooseCategory" };
      this.emitChoiceOptions(player, io);
      this.broadcastState(io);
      return;
    }

    if (cardDef.effect.type === "forceSkipTurn") {
      const others = [...this.players.values()].filter(
        (p) => p.id !== player.id && p.connected
      );
      if (others.length === 0) return;
      this.consumeCardInstance(player, instance);
      player.cardsUsedThisTurn.add(cardId);
      player.pendingChoice = { kind: "forceSkipTurn" };
      this.emitChoiceOptions(player, io);
      this.broadcastState(io);
      return;
    }

    if (cardDef.effect.type === "steal200Coins" || cardDef.effect.type === "steal20Coins") {
      const others = [...this.players.values()].filter(
        (p) => p.id !== player.id && p.connected
      );
      if (others.length === 0) return;
      this.consumeCardInstance(player, instance);
      player.cardsUsedThisTurn.add(cardId);
      const amount = cardDef.effect.type === "steal200Coins" ? 200 : 20;
      player.pendingChoice = { kind: "stealCoins", amount };
      this.emitChoiceOptions(player, io);
      this.broadcastState(io);
      return;
    }

    if (cardDef.effect.type === "swapPositionChosen") {
      const others = [...this.players.values()].filter(
        (p) => p.id !== player.id && p.connected
      );
      if (others.length === 0) return;
      this.consumeCardInstance(player, instance);
      player.cardsUsedThisTurn.add(cardId);
      player.pendingChoice = { kind: "swapPosition" };
      this.emitChoiceOptions(player, io);
      this.broadcastState(io);
      return;
    }

    if (cardDef.effect.type === "discardTwoRandomFromChosen") {
      const others = [...this.players.values()].filter(
        (p) => p.id !== player.id && p.connected && p.collection.length > 0
      );
      if (others.length === 0) return;
      this.consumeCardInstance(player, instance);
      player.cardsUsedThisTurn.add(cardId);
      player.pendingChoice = { kind: "discardFromChosen" };
      this.emitChoiceOptions(player, io);
      this.broadcastState(io);
      return;
    }

    if (cardDef.effect.type === "moveChosenBackwardOne") {
      const others = [...this.players.values()].filter(
        (p) => p.id !== player.id && p.connected
      );
      if (others.length === 0) return;
      this.consumeCardInstance(player, instance);
      player.cardsUsedThisTurn.add(cardId);
      player.pendingChoice = { kind: "moveBackwardChosen" };
      this.emitChoiceOptions(player, io);
      this.broadcastState(io);
      return;
    }

    if (cardDef.effect.type === "advanceThreeTiles") {
      this.consumeCardInstance(player, instance);
      player.cardsUsedThisTurn.add(cardId);
      this.dispatchSelfAdvance(player, 3, io);
      return;
    }

    if (cardDef.effect.type === "advanceTwoTiles") {
      this.consumeCardInstance(player, instance);
      player.cardsUsedThisTurn.add(cardId);
      this.dispatchSelfAdvance(player, 2, io);
      return;
    }

    if (cardDef.effect.type === "advanceOneTile") {
      this.consumeCardInstance(player, instance);
      player.cardsUsedThisTurn.add(cardId);
      this.dispatchSelfAdvance(player, 1, io);
      return;
    }

    // effetti istantanei senza scelta di bersaglio: si applicano subito al
    // giocatore stesso
    if (cardDef.effect.type === "gain20Coins") {
      this.consumeCardInstance(player, instance);
      player.cardsUsedThisTurn.add(cardId);
      player.coins += 20;
      this.broadcastState(io);
      return;
    }

    if (cardDef.effect.type === "gainOneShield") {
      this.consumeCardInstance(player, instance);
      player.cardsUsedThisTurn.add(cardId);
      this.addStatus(player, "shield", "Scudo", "🛡️", "Blocca il prossimo effetto negativo subito.");
      this.broadcastState(io);
      return;
    }

    if (cardDef.effect.type === "gainThreeShields") {
      this.consumeCardInstance(player, instance);
      player.cardsUsedThisTurn.add(cardId);
      for (let i = 0; i < 3; i++) {
        this.addStatus(player, "shield", "Scudo", "🛡️", "Blocca il prossimo effetto negativo subito.");
      }
      this.broadcastState(io);
      return;
    }

    if (cardDef.effect.type === "gainDoubleWin") {
      this.consumeCardInstance(player, instance);
      player.cardsUsedThisTurn.add(cardId);
      this.addStatus(player, "doubleWin", "Vincita raddoppiata", "✨", "La prossima vincita di un minigioco sarà raddoppiata.");
      this.broadcastState(io);
      return;
    }

    if (cardDef.effect.type === "gainFreeChest") {
      this.consumeCardInstance(player, instance);
      player.cardsUsedThisTurn.add(cardId);
      this.addStatus(player, "freeChest", "Baule gratis", "🎁", "Il prossimo Baule del Mercante comprato alla Cittadella non costa nulla.");
      this.broadcastState(io);
      return;
    }

    if (cardDef.effect.type === "gainFreePack") {
      this.consumeCardInstance(player, instance);
      player.cardsUsedThisTurn.add(cardId);
      this.addStatus(player, "freePack", "Pacchetto gratis", "🎁", "Il prossimo pacchetto comprato alla Cittadella non costa nulla.");
      this.broadcastState(io);
      return;
    }

    if (cardDef.effect.type === "extraRollThisTurn") {
      this.consumeCardInstance(player, instance);
      player.cardsUsedThisTurn.add(cardId);
      player.bonusRolls += 1;
      this.broadcastState(io);
      return;
    }

    if (cardDef.effect.type === "moveAllToCittadella") {
      this.consumeCardInstance(player, instance);
      player.cardsUsedThisTurn.add(cardId);
      for (const p of this.players.values()) {
        if (p.id === player.id) continue;
        p.boardPosition = { nodeId: CITTADELLA_ID, onNode: true };
      }
      this.broadcastState(io);
      return;
    }

    if (cardDef.effect.type === "teleportSelfToCittadella") {
      this.consumeCardInstance(player, instance);
      player.cardsUsedThisTurn.add(cardId);
      player.boardPosition = { nodeId: CITTADELLA_ID, onNode: true };
      this.broadcastState(io);
      return;
    }

    if (cardDef.effect.type === "gainRandomCommonCard") {
      const commons = CARD_CATALOG.filter(
        (c) =>
          c.rarity === "comune" &&
          player.collection.filter((owned) => owned.cardId === c.id).length < MAX_CARD_COPIES
      );
      if (commons.length === 0) return;
      this.consumeCardInstance(player, instance);
      player.cardsUsedThisTurn.add(cardId);
      const picked = commons[Math.floor(Math.random() * commons.length)];
      player.collection.push({ instanceId: nextCardInstanceId(), cardId: picked.id, used: false });
      this.checkCollectionComplete(player, io);
      this.broadcastState(io);
      return;
    }

    // effetti "armati": non agiscono subito, restano pronti per il prossimo
    // quiz che affronterai (consumati lì, vedi submitAnswer/sendNewQuestion)
    if (
      cardDef.effect.type === "extraTime" ||
      cardDef.effect.type === "removeWrongOption" ||
      cardDef.effect.type === "doubleCoins" ||
      cardDef.effect.type === "secondChance" ||
      cardDef.effect.type === "skipQuestion"
    ) {
      this.consumeCardInstance(player, instance);
      player.cardsUsedThisTurn.add(cardId);
      player.activeEffects = [...player.activeEffects, cardDef.effect.type];
      this.broadcastState(io);
      return;
    }
  }

  // Pesca un pacchetto di carte alla Cittadella. Rispetta lo stato "baule
  // gratis"/"pacchetto gratis" (se posseduto, consuma quello status invece
  // di scalare le monete) e il limite di 5 copie per carta: oltre la quinta,
  // la carta viene comunque mostrata nell'apertura ma segnata "capped" e non
  // aggiunta alla collezione.
  buyPack(playerId: string, packId: string, io: IOServer) {
    const player = this.players.get(playerId);
    if (!player) return;
    const pack = PACKS.find((p) => p.id === packId);
    if (!pack) return;

    const freePackIdx = player.statuses.findIndex((s) => s.type === "freePack");
    const freeChestIdx = player.statuses.findIndex((s) => s.type === "freeChest");
    let isFree = false;
    if (freePackIdx !== -1) {
      player.statuses.splice(freePackIdx, 1);
      isFree = true;
    } else if (freeChestIdx !== -1 && packId === "pack-medio") {
      player.statuses.splice(freeChestIdx, 1);
      isFree = true;
    }

    if (!isFree) {
      if (player.coins < pack.cost) {
        io.to(player.socketId).emit("error:message", {
          message: "Non hai abbastanza monete per questo pacchetto.",
        });
        return;
      }
      player.coins -= pack.cost;
    }

    const RARITY_WEIGHTS: { rarity: CardRarity; weight: number }[] = [
      { rarity: "comune", weight: 60 },
      { rarity: "rara", weight: 30 },
      { rarity: "epica", weight: 7 },
      { rarity: "leggendaria", weight: 2 },
      { rarity: "segreta", weight: 1 },
    ];
    const totalWeight = RARITY_WEIGHTS.reduce((sum, r) => sum + r.weight, 0);

    const pulledCards: { card: CardDef; capped: boolean }[] = [];
    for (let i = 0; i < pack.cardCount; i++) {
      let roll = Math.random() * totalWeight;
      let chosenRarity: CardRarity = "comune";
      for (const r of RARITY_WEIGHTS) {
        if (roll < r.weight) {
          chosenRarity = r.rarity;
          break;
        }
        roll -= r.weight;
      }
      let pool = CARD_CATALOG.filter((c) => c.rarity === chosenRarity);
      if (pool.length === 0) pool = CARD_CATALOG;
      const card = pool[Math.floor(Math.random() * pool.length)];

      const owned = player.collection.filter((c) => c.cardId === card.id).length;
      const capped = owned >= MAX_CARD_COPIES;
      if (!capped) {
        player.collection.push({ instanceId: nextCardInstanceId(), cardId: card.id, used: false });
      }
      pulledCards.push({ card, capped });
    }

    io.to(player.socketId).emit("shop:packOpened", { packId, cards: pulledCards });
    this.checkCollectionComplete(player, io);
    this.broadcastState(io);
  }

  // Salva la partita su file (vedi server/game/saveStore.ts) così può essere
  // ripresa più avanti ricollegandosi con lo stesso codice stanza, anche
  // dopo un riavvio del server (vedi PartyManager.get, che ripesca da disco
  // se non trova nulla in memoria). Prima di scrivere, riporta OGNI
  // giocatore a uno stato "neutro" (torna alla mappa): qualsiasi minigioco,
  // domanda, imprevisto o scelta in corso viene annullato, ma nessun
  // progresso permanente (monete, figurine, posizione, mondi esauriti) va
  // perso. Scelta deliberata per tenere il salvataggio semplice e robusto,
  // invece di dover catturare fedelmente lo stato esatto di ogni possibile
  // minigioco a metà.
  saveGame(playerId: string, io: IOServer) {
    if (this.phase === "ended") return; // partita già conclusa: nulla da salvare

    const triggeringPlayer = this.players.get(playerId);
    if (!triggeringPlayer?.isHost) {
      if (triggeringPlayer) {
        io.to(triggeringPlayer.socketId).emit("error:message", {
          message: "Solo l'host può salvare la partita.",
        });
      }
      return;
    }

    // eventi di sessione (coinvolgono più giocatori insieme, non un singolo
    // InternalPlayer): TCT ha anche un timer reale da fermare, Buzz no.
    if (this.pendingTct?.timer) clearTimeout(this.pendingTct.timer);
    this.pendingTct = null;
    this.pendingBuzz = null;

    for (const p of this.players.values()) {
      p.pendingRoll = null;
      p.pendingShop = false;
      p.pendingQuestion = null;
      p.pendingWorldId = null;
      p.awaitingWheelStart = false;
      p.awaitingQuizStart = false;
      p.pendingSurprise = null;
      p.pendingChoice = null;
      p.pendingShieldContext = null;
      p.pendingTop5 = null;
      p.awaitingTop5Start = false;
      p.awaitingCaroAmicoSelfChoice = false;
      p.pendingCaroAmico = null;
      p.awaitingCaroAmicoStart = false;
      p.pendingOcho = null;
      p.awaitingOchoStart = false;
      p.pendingDuck = null;
      p.awaitingDuckStart = false;
      p.pendingParticolare = null;
      p.awaitingParticolareStart = false;
      p.pendingSfidaGino = null;
      p.awaitingSfidaGinoStart = false;
    }

    // il giro finale (fase "finalRound") non è un "minigioco a metà": è
    // semplicemente "di chi è il turno", quindi va preservato per intero.
    // L'unica cosa da sistemare è riaprire lo shop di chi ha il turno ora
    // (pendingShop è stato azzerato per tutti sopra, per sicurezza).
    if (this.phase === "finalRound" && this.finalRoundPlayerIds.length > 0) {
      const currentId =
        this.finalRoundPlayerIds[this.finalRoundIndex % this.finalRoundPlayerIds.length];
      const current = this.players.get(currentId);
      if (current) current.pendingShop = true;
    }

    writeSave(this.code, this.serialize());

    io.emit("error:message", {
      message: `💾 Partita salvata${
        triggeringPlayer ? ` da ${triggeringPlayer.name}` : ""
      }! Per riprenderla in futuro basta ricollegarsi con il codice ${this.code}.`,
    });
    this.broadcastState(io);
    // avvisa i client di ricaricare la pagina: qualsiasi schermata di
    // minigioco rimasta aperta localmente (stato React, non server) va
    // ripulita, così tutti ripartono puliti dalla mappa (vedi App.tsx)
    io.emit("game:saved");
  }

  serialize(): SerializedGameSession {
    return {
      code: this.code,
      turnOrder: [...this.turnOrder],
      currentTurnIndex: this.currentTurnIndex,
      phase: this.phase,
      players: [...this.players.values()].map((p) => ({
        id: p.id,
        clientId: p.clientId,
        token: p.token,
        name: p.name,
        isHost: p.isHost,
        isSpectator: p.isSpectator,
        coins: p.coins,
        boardPosition: p.boardPosition,
        collection: p.collection,
        activeEffects: p.activeEffects,
        statuses: p.statuses,
        caroAmicoSelfId: p.caroAmicoSelfId,
        forcedNextCategory: p.forcedNextCategory,
        bonusRolls: p.bonusRolls,
        cardsUsedThisTurn: [...p.cardsUsedThisTurn],
      })),
      playedTop5Ids: [...this.playedTop5Ids],
      playedTctQuestionIds: [...this.playedTctQuestionIds],
      playedOchoIds: [...this.playedOchoIds],
      playedDuckCategoryIds: [...this.playedDuckCategoryIds],
      playedParticolareItemIds: [...this.playedParticolareItemIds],
      playedBuzzItemIds: [...this.playedBuzzItemIds],
      playedSfidaGinoFlagIds: [...this.playedSfidaGinoFlagIds],
      playedSfidaGinoCapitalIds: [...this.playedSfidaGinoCapitalIds],
      playedCaroAmicoDomandaIds: [...this.playedCaroAmicoDomandaIds],
      deactivatedWorldIds: [...this.deactivatedWorldIds],
      finalRoundPlayerIds: [...this.finalRoundPlayerIds],
      finalRoundDoneIds: [...this.finalRoundDoneIds],
      finalRoundIndex: this.finalRoundIndex,
      lastGameEndedPayload: this.lastGameEndedPayload,
    };
  }

  // Ricostruisce una partita da un salvataggio (vedi saveGame più sopra).
  // Ogni giocatore rientra scollegato (connected: false, nessun socketId):
  // tornerà online da solo non appena qualcuno si ricollega con lo stesso
  // clientId (vedi addPlayer). Nessuno stato "a metà" da ripristinare, dato
  // che saveGame lo azzera sempre prima di scrivere su disco.
  static deserialize(data: SerializedGameSession): GameSession {
    const session = new GameSession(data.code);
    session.turnOrder = [...data.turnOrder];
    session.currentTurnIndex = data.currentTurnIndex;
    session.phase = data.phase;

    for (const sp of data.players) {
      const player: InternalPlayer = {
        id: sp.id,
        socketId: "",
        clientId: sp.clientId,
        connected: false,
        token: sp.token,
        name: sp.name,
        isHost: sp.isHost,
        isSpectator: sp.isSpectator,
        coins: sp.coins,
        boardPosition: sp.boardPosition,
        pendingRoll: null,
        pendingShop: false,
        collection: sp.collection,
        activeEffects: sp.activeEffects,
        statuses: sp.statuses,
        pendingQuestion: null,
        pendingWorldId: null,
        awaitingWheelStart: false,
        awaitingQuizStart: false,
        pendingSurprise: null,
        pendingChoice: null,
        pendingShieldContext: null,
        cardsUsedThisTurn: new Set(sp.cardsUsedThisTurn),
        bonusRolls: sp.bonusRolls,
        pendingTop5: null,
        awaitingTop5Start: false,
        forcedNextCategory: sp.forcedNextCategory,
        caroAmicoSelfId: sp.caroAmicoSelfId,
        awaitingCaroAmicoSelfChoice: false,
        pendingCaroAmico: null,
        awaitingCaroAmicoStart: false,
        pendingOcho: null,
        awaitingOchoStart: false,
        pendingDuck: null,
        awaitingDuckStart: false,
        pendingParticolare: null,
        awaitingParticolareStart: false,
        pendingSfidaGino: null,
        awaitingSfidaGinoStart: false,
      };
      session.players.set(player.id, player);
    }

    session.playedTop5Ids = new Set(data.playedTop5Ids);
    session.playedTctQuestionIds = new Set(data.playedTctQuestionIds);
    session.playedOchoIds = new Set(data.playedOchoIds);
    session.playedDuckCategoryIds = new Set(data.playedDuckCategoryIds);
    session.playedParticolareItemIds = new Set(data.playedParticolareItemIds);
    session.playedBuzzItemIds = new Set(data.playedBuzzItemIds);
    session.playedSfidaGinoFlagIds = new Set(data.playedSfidaGinoFlagIds);
    session.playedSfidaGinoCapitalIds = new Set(data.playedSfidaGinoCapitalIds);
    session.playedCaroAmicoDomandaIds = new Set(data.playedCaroAmicoDomandaIds);
    session.deactivatedWorldIds = new Set(data.deactivatedWorldIds);
    session.finalRoundPlayerIds = [...data.finalRoundPlayerIds];
    session.finalRoundDoneIds = new Set(data.finalRoundDoneIds);
    session.finalRoundIndex = data.finalRoundIndex;
    session.lastGameEndedPayload = data.lastGameEndedPayload;

    // se eravamo nel giro finale, il giocatore di turno deve ritrovare lo
    // shop già aperto (coerente con quanto fatto in saveGame)
    if (session.phase === "finalRound" && session.finalRoundPlayerIds.length > 0) {
      const currentId =
        session.finalRoundPlayerIds[session.finalRoundIndex % session.finalRoundPlayerIds.length];
      const current = session.players.get(currentId);
      if (current) current.pendingShop = true;
    }

    return session;
  }
}
