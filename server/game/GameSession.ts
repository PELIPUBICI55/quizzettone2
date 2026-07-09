import type { Server } from "socket.io";
import type {
  BoardPosition,
  CardEffectType,
  ClientToServerEvents,
  GameStateSnapshot,
  OwnedCard,
  ServerToClientEvents,
} from "../../shared/types.js";
import { WORLDS, CITTADELLA_ID } from "../data/worlds.js";
import { CARD_CATALOG, pickRandomCards } from "../data/cards.js";
import { PACKS } from "../data/packs.js";
import { pickRandomQuestion, QuizQuestionInternal } from "../data/questions.js";
import { BOARD_EDGES, edgeById, neighborsOf } from "../../shared/board.js";

type IOServer = Server<ClientToServerEvents, ServerToClientEvents>;

interface InternalPlayer {
  id: string;
  socketId: string;
  name: string;
  isHost: boolean;
  coins: number;
  boardPosition: BoardPosition;
  pendingRoll: number | null;
  pendingShop: boolean;
  collection: OwnedCard[];
  activeEffects: CardEffectType[];
  pendingQuestion: QuizQuestionInternal | null;
  pendingWorldId: string | null; // mondo in cui si trova mentre risolve un minigioco
}

const BASE_REWARD = 20;
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

export class GameSession {
  readonly code: string;
  private players = new Map<string, InternalPlayer>();
  private turnOrder: string[] = [];
  private currentTurnIndex = 0;

  constructor(code: string) {
    this.code = code;
  }

  get isEmpty() {
    return this.players.size === 0;
  }

  addPlayer(socketId: string, name: string): InternalPlayer {
    const isHost = this.players.size === 0;
    const player: InternalPlayer = {
      id: nextPlayerId(),
      socketId,
      name: name.trim().slice(0, 20) || "Giocatore",
      isHost,
      coins: 50, // gruzzoletto iniziale
      boardPosition: { nodeId: CITTADELLA_ID, onNode: true },
      pendingRoll: null,
      pendingShop: false,
      collection: [],
      activeEffects: [],
      pendingQuestion: null,
      pendingWorldId: null,
    };
    this.players.set(player.id, player);
    this.turnOrder.push(player.id); // l'ordine dei turni si fissa all'ingresso e non cambia
    return player;
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

  getSnapshot(forPlayerId: string): GameStateSnapshot | null {
    const me = this.players.get(forPlayerId);
    if (!me) return null;

    const positions: Record<string, BoardPosition> = {};
    for (const p of this.players.values()) positions[p.id] = p.boardPosition;

    return {
      code: this.code,
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
        cardCount: p.collection.length,
      })),
      me: {
        id: me.id,
        name: me.name,
        coins: me.coins,
        isHost: me.isHost,
        cardCount: me.collection.length,
        collection: me.collection,
        activeEffects: me.activeEffects,
        pendingRoll: me.pendingRoll,
        pendingShop: me.pendingShop,
      },
    };
  }

  broadcastState(io: IOServer) {
    for (const p of this.players.values()) {
      const snap = this.getSnapshot(p.id);
      if (snap) io.to(p.socketId).emit("state:update", snap);
    }
  }

  rollDice(playerId: string, io: IOServer) {
    const player = this.players.get(playerId);
    if (!player) return;

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

    if (landedNodeId === CITTADELLA_ID) {
      player.pendingShop = true;
      // il turno finisce quando lascerà la Cittadella (leaveShop)
    } else if (landedNodeId) {
      this.startMinigame(player, landedNodeId, io);
      // il turno finisce quando la domanda verrà risolta (submitAnswer)
    } else {
      // ancora a metà ponte: controlla se è capitato su una casella imprevisto
      const edge = edgeById(player.boardPosition.edgeId!);
      const progress = player.boardPosition.progress!;
      const isSurprise = !!edge?.surprises.includes(progress);
      const advance = isSurprise ? this.triggerSurprise(player, io) : true;
      if (advance) this.advanceTurn();
    }

    this.broadcastState(io);
  }

  // Applica un effetto casuale quando un giocatore atterra su una casella
  // "imprevisto". Ritorna false se il turno NON deve avanzare (es. tiro extra).
  private triggerSurprise(player: InternalPlayer, io: IOServer): boolean {
    const roll = Math.random();
    let message: string;
    let advance = true;

    if (roll < 0.3) {
      const amount = 20;
      player.coins += amount;
      message = `✨ Imprevisto fortunato! +${amount} monete`;
    } else if (roll < 0.5) {
      const amount = Math.min(player.coins, 10);
      player.coins -= amount;
      message = `⚡ Imprevisto sfortunato! -${amount} monete`;
    } else if (roll < 0.75) {
      const [card] = pickRandomCards(1);
      player.collection.push({
        instanceId: nextCardInstanceId(),
        cardId: card.id,
        used: false,
      });
      message = `🎴 Imprevisto magico! Hai trovato "${card.name}"`;
    } else {
      advance = false;
      message = "🎲 Imprevisto fortunato! Tira di nuovo";
    }

    io.emit("board:surprise", { playerId: player.id, message });
    return advance;
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
    this.advanceTurn();
    this.broadcastState(io);
  }

  private startMinigame(player: InternalPlayer, worldId: string, io: IOServer) {
    player.pendingWorldId = worldId;

    // Per ora l'unico tipo di minigioco implementato è il quiz.
    const resultType = "quiz" as const;
    const durationMs = 2600;

    io.to(player.socketId).emit("wheel:spin", {
      worldId,
      resultType,
      durationMs,
    });

    setTimeout(() => {
      if (player.pendingWorldId !== worldId) return;
      this.sendNewQuestion(player, io);
    }, durationMs);
  }

  private sendNewQuestion(player: InternalPlayer, io: IOServer) {
    const question = { ...pickRandomQuestion() };
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
    io.to(player.socketId).emit("quiz:question", {
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

    player.coins += coinsAwarded;
    player.pendingWorldId = null;

    io.to(player.socketId).emit("quiz:result", {
      correct,
      correctIndex: question.correctIndex,
      coinsAwarded,
    });

    // la prova è conclusa: il turno passa al giocatore successivo
    this.advanceTurn();
    this.broadcastState(io);
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

    // la carta resta nella collezione ma non è più riutilizzabile
    instance.used = true;
    player.activeEffects.push(cardDef.effect.type);

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
    if (player.coins < pack.cost) {
      io.to(player.socketId).emit("error:message", {
        message: "Non hai abbastanza monete per questo pacchetto.",
      });
      return;
    }

    player.coins -= pack.cost;
    const cards = pickRandomCards(pack.cardCount);
    player.collection.push(
      ...cards.map((c) => ({
        instanceId: nextCardInstanceId(),
        cardId: c.id,
        used: false,
      }))
    );

    io.to(player.socketId).emit("shop:packOpened", {
      packId: pack.id,
      cards,
    });
    this.broadcastState(io);
  }
}
