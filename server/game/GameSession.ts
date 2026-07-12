import type { Server } from "socket.io";
import type {
  BoardPosition,
  CardDef,
  CardEffectType,
  ClientToServerEvents,
  GameStateSnapshot,
  OwnedCard,
  PawnToken,
  PlayerStatus,
  ServerToClientEvents,
  StatusType,
  SurpriseCardDef,
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
import { pickRandomTop5 } from "../data/top5.js";
import { BOARD_EDGES, edgeById, neighborsOf, absoluteTileIndex } from "../../shared/board.js";

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

interface InternalPlayer {
  id: string;
  socketId: string;
  clientId: string;
  connected: boolean;
  token: PawnToken | null;
  name: string;
  isHost: boolean;
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
  pendingTop5: { def: Top5Def; revealed: boolean[]; heartsBroken: number } | null;
  forcedNextCategory: string | null; // categoria scelta per il prossimo quiz (Nuvola)
  pendingShieldContext: PendingShieldContext | null; // in attesa che decida se usare uno scudo
}

const BASE_REWARD = 20;
const TOP5_REWARD = 100;
const WRONG_REWARD = 0;

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
  private phase: "lobby" | "playing" = "lobby";

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
      forcedNextCategory: null,
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
    // rientra: vista completa se è l'host, altrimenti nascosta.
    const top5Player = [...this.players.values()].find((p) => p.pendingTop5);
    if (top5Player?.pendingTop5) {
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
        fullAnswers: player.isHost ? def.answers : undefined,
      });
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
      return !!def?.effect.isPassive && def.effect.type === type;
    });
  }

  // Controlla la collezione del giocatore per figurine con effetto passivo
  // (sempre attive finché possedute, non vanno "usate") e le applica. Ogni
  // copia posseduta conta separatamente.
  private applyPassiveCardEffects(player: InternalPlayer) {
    for (const owned of player.collection) {
      const def = CARD_CATALOG.find((c) => c.id === owned.cardId);
      if (!def?.effect.isPassive) continue;

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

    const positions: Record<string, BoardPosition> = {};
    for (const p of this.players.values()) positions[p.id] = p.boardPosition;

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
      players: [...this.players.values()].map((p) => ({
        id: p.id,
        name: p.name,
        coins: p.coins,
        isHost: p.isHost,
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
    if ([...this.players.values()].some((p) => p.token === null)) {
      io.to(player.socketId).emit("error:message", {
        message: "Tutti i giocatori devono scegliere una pedina prima di iniziare.",
      });
      return;
    }

    // mescola casualmente l'ordine dei turni (Fisher-Yates)
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
      const neighbors = neighborsOf(pos.nodeId);
      const chosen =
        neighbors.find((n) => n.neighborId === direction) ?? neighbors[0];
      if (!chosen) return; // nodo isolato, non dovrebbe succedere
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
      const neighbors = neighborsOf(pos.nodeId);
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
      const neighbors = neighborsOf(player.boardPosition.nodeId);
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
      const neighbors = neighborsOf(originNodeId);
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
    this.advanceTurnAndHandleSkips(io);
    this.broadcastState(io);
  }

  private arriveAtWorld(player: InternalPlayer, worldId: string, io: IOServer) {
    player.pendingWorldId = worldId;
    player.awaitingWheelStart = true;
    io.emit("world:welcome", { playerId: player.id, worldId });
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

  // Avvia il minigioco Top 5: pesca una categoria, mostra l'animazione della
  // ruota verticale, poi rivela lo stato (nascosto per i giocatori, completo
  // per l'host) a tutti.
  private beginTop5(player: InternalPlayer, io: IOServer) {
    const def = pickRandomTop5();
    player.pendingTop5 = { def, revealed: [false, false, false, false, false], heartsBroken: 0 };
    const durationMs = 2600;

    io.emit("top5:spin", { playerId: player.id, durationMs });

    setTimeout(() => {
      if (!player.pendingTop5 || player.pendingTop5.def.id !== def.id) return;
      this.broadcastTop5State(player, io);
    }, durationMs);
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

    io.emit("top5:state", { playerId: player.id, title: def.title, slots, heartsBroken });

    const host = [...this.players.values()].find((p) => p.isHost);
    if (host) {
      io.to(host.socketId).emit("top5:state", {
        playerId: player.id,
        title: def.title,
        slots,
        heartsBroken,
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
    }
    const tripleIdx = player.statuses.findIndex((s) => s.type === "tripleWin");
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
      player.pendingChoice = { kind: "stealAllFromTwo", targets: [] };
      this.emitChoiceOptions(player, io);
      this.broadcastState(io);
      return;
    }

    if (cardDef.effect.type === "swapZeroTripleWin") {
      this.consumeCardInstance(player, instance);
      player.cardsUsedThisTurn.add(cardId);

      const others = [...this.players.values()].filter(
        (p) => p.id !== player.id && p.connected
      );
      if (others.length === 0) {
        this.broadcastState(io);
        return;
      }
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
      this.consumeCardInstance(player, instance);
      player.cardsUsedThisTurn.add(cardId);

      const others = [...this.players.values()].filter(
        (p) => p.id !== player.id && p.connected
      );
      if (others.length === 0) {
        this.broadcastState(io);
        return;
      }
      player.pendingChoice = { kind: "forceSkipTurn" };
      this.emitChoiceOptions(player, io);
      this.broadcastState(io);
      return;
    }

    if (cardDef.effect.type === "gainThreeShields") {
      this.consumeCardInstance(player, instance);
      player.cardsUsedThisTurn.add(cardId);
      for (let i = 0; i < 3; i++) {
        this.addStatus(
          player,
          "shield",
          "Scudo",
          "🛡️",
          "Puoi annullare un effetto subito in futuro. Si consuma dopo l'uso."
        );
      }
      this.broadcastState(io);
      return;
    }

    if (cardDef.effect.type === "moveAllToCittadella") {
      this.consumeCardInstance(player, instance);
      player.cardsUsedThisTurn.add(cardId);

      const others = [...this.players.values()].filter(
        (p) => p.id !== player.id && p.connected
      );
      for (const opp of others) {
        this.maybeShield(
          opp,
          `${player.name} vuole spostarti alla Cittadella! Vuoi bloccarlo con uno scudo?`,
          io,
          (blocked) => {
            if (!blocked) {
              opp.boardPosition = { nodeId: CITTADELLA_ID, onNode: true };
              this.resolveArrival(opp, CITTADELLA_ID, io);
            }
            this.broadcastState(io);
          }
        );
      }
      this.broadcastState(io);
      return;
    }

    if (cardDef.effect.type === "teleportSelfToCittadella") {
      this.consumeCardInstance(player, instance);
      player.cardsUsedThisTurn.add(cardId);
      player.boardPosition = { nodeId: CITTADELLA_ID, onNode: true };
      this.resolveArrival(player, CITTADELLA_ID, io);
      this.broadcastState(io);
      return;
    }

    if (cardDef.effect.type === "steal200Coins") {
      this.consumeCardInstance(player, instance);
      player.cardsUsedThisTurn.add(cardId);
      const others = [...this.players.values()].filter(
        (p) => p.id !== player.id && p.connected
      );
      if (others.length === 0) {
        this.broadcastState(io);
        return;
      }
      player.pendingChoice = { kind: "stealCoins", amount: 200 };
      this.emitChoiceOptions(player, io);
      this.broadcastState(io);
      return;
    }

    if (cardDef.effect.type === "swapPositionChosen") {
      this.consumeCardInstance(player, instance);
      player.cardsUsedThisTurn.add(cardId);
      const others = [...this.players.values()].filter(
        (p) => p.id !== player.id && p.connected
      );
      if (others.length === 0) {
        this.broadcastState(io);
        return;
      }
      player.pendingChoice = { kind: "swapPosition" };
      this.emitChoiceOptions(player, io);
      this.broadcastState(io);
      return;
    }

    if (cardDef.effect.type === "gainFreeChest") {
      this.consumeCardInstance(player, instance);
      player.cardsUsedThisTurn.add(cardId);
      this.addStatus(
        player,
        "freeChest",
        "Baule gratis",
        "🎁",
        "Il prossimo Baule del Mercante comprato alla Cittadella non costa nulla."
      );
      this.broadcastState(io);
      return;
    }

    if (cardDef.effect.type === "discardTwoRandomFromChosen") {
      this.consumeCardInstance(player, instance);
      player.cardsUsedThisTurn.add(cardId);
      const others = [...this.players.values()].filter(
        (p) => p.id !== player.id && p.connected
      );
      if (others.length === 0) {
        this.broadcastState(io);
        return;
      }
      player.pendingChoice = { kind: "discardFromChosen" };
      this.emitChoiceOptions(player, io);
      this.broadcastState(io);
      return;
    }

    if (cardDef.effect.type === "gainDoubleWin") {
      this.consumeCardInstance(player, instance);
      player.cardsUsedThisTurn.add(cardId);
      this.addStatus(
        player,
        "doubleWin",
        "Vincita raddoppiata",
        "✨",
        "Il prossimo gioco vinto in un mondo pagherà il doppio delle monete."
      );
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
      if (this.currentTurnPlayerId() === player.id) {
        this.dispatchSelfAdvance(player, 1, io);
      } else {
        // effetto rapido usato fuori dal tuo turno: spostamento "leggero",
        // senza controllo imprevisti né apertura mercato/mondo
        this.simpleReposition(player, 1);
        this.broadcastState(io);
      }
      return;
    }

    if (cardDef.effect.type === "moveChosenBackwardOne") {
      this.consumeCardInstance(player, instance);
      player.cardsUsedThisTurn.add(cardId);
      const others = [...this.players.values()].filter(
        (p) => p.id !== player.id && p.connected
      );
      if (others.length === 0) {
        this.broadcastState(io);
        return;
      }
      player.pendingChoice = { kind: "moveBackwardChosen" };
      this.emitChoiceOptions(player, io);
      this.broadcastState(io);
      return;
    }

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
      this.addStatus(
        player,
        "shield",
        "Scudo",
        "🛡️",
        "Puoi annullare un effetto subito in futuro. Si consuma dopo l'uso."
      );
      this.broadcastState(io);
      return;
    }

    if (cardDef.effect.type === "gainRandomCommonCard") {
      this.consumeCardInstance(player, instance);
      player.cardsUsedThisTurn.add(cardId);
      const commons = CARD_CATALOG.filter((c) => c.rarity === "comune");
      if (commons.length > 0) {
        const picked = commons[Math.floor(Math.random() * commons.length)];
        const owned = player.collection.filter((c) => c.cardId === picked.id).length;
        const limit = picked.effect.isPassive ? 1 : MAX_CARD_COPIES;
        if (owned < limit) {
          player.collection.push({
            instanceId: nextCardInstanceId(),
            cardId: picked.id,
            used: false,
          });
        }
      }
      this.broadcastState(io);
      return;
    }

    if (cardDef.effect.type === "gainFreePack") {
      this.consumeCardInstance(player, instance);
      player.cardsUsedThisTurn.add(cardId);
      this.addStatus(
        player,
        "freePack",
        "Pacchetto gratis",
        "🎁",
        "Il prossimo pacchetto base comprato alla Cittadella non costa nulla."
      );
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

    if (cardDef.effect.type === "steal20Coins") {
      this.consumeCardInstance(player, instance);
      player.cardsUsedThisTurn.add(cardId);
      const others = [...this.players.values()].filter(
        (p) => p.id !== player.id && p.connected
      );
      if (others.length === 0) {
        this.broadcastState(io);
        return;
      }
      player.pendingChoice = { kind: "stealCoins", amount: 20 };
      this.emitChoiceOptions(player, io);
      this.broadcastState(io);
      return;
    }

    // se hai più copie la scarta, altrimenti la disattiva soltanto
    this.consumeCardInstance(player, instance);
    player.activeEffects.push(cardDef.effect.type);
    player.cardsUsedThisTurn.add(cardId);

    this.broadcastState(io);
  }

  buyPack(playerId: string, packId: string, io: IOServer) {
    const player = this.players.get(playerId);
    if (!player) return;
    if (!player.pendingShop) {
      io.to(player.socketId).emit("error:message", {
        message: "Devi prima raggiungere la Cittadella con la tua pedina.",
      });
      return;
    }
    const pack = PACKS.find((p) => p.id === packId);
    if (!pack) {
      io.to(player.socketId).emit("error:message", {
        message: "Pacchetto sconosciuto.",
      });
      return;
    }

    const freePackIdx = player.statuses.findIndex((s) => s.type === "freePack");
    const freeChestIdx = player.statuses.findIndex((s) => s.type === "freeChest");
    const usesFreePack = freePackIdx !== -1 && pack.id === "pack-base";
    const usesFreeChest = freeChestIdx !== -1 && pack.id === "pack-medio";
    const cost = usesFreePack || usesFreeChest ? 0 : pack.cost;

    if (player.coins < cost) {
      io.to(player.socketId).emit("error:message", {
        message: "Non hai abbastanza monete per questo pacchetto.",
      });
      return;
    }

    player.coins -= cost;
    if (usesFreePack) player.statuses.splice(freePackIdx, 1);
    if (usesFreeChest) player.statuses.splice(freeChestIdx, 1);

    const drawnCards = pickRandomCards(pack.cardCount);
    const resultCards: { card: CardDef; capped: boolean }[] = [];
    for (const card of drawnCards) {
      const owned = player.collection.filter((c) => c.cardId === card.id).length;
      const limit = card.effect.isPassive ? 1 : MAX_CARD_COPIES;
      if (owned >= limit) {
        resultCards.push({ card, capped: true });
        continue;
      }
      player.collection.push({
        instanceId: nextCardInstanceId(),
        cardId: card.id,
        used: false,
      });
      resultCards.push({ card, capped: false });
    }

    io.to(player.socketId).emit("shop:packOpened", {
      packId: pack.id,
      cards: resultCards,
    });
    this.broadcastState(io);
  }
}
