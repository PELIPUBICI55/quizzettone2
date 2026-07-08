import type { Server } from "socket.io";
import type {
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

type IOServer = Server<ClientToServerEvents, ServerToClientEvents>;

interface InternalPlayer {
  id: string;
  socketId: string;
  name: string;
  isHost: boolean;
  coins: number;
  currentWorldId: string | null;
  collection: OwnedCard[];
  activeEffects: CardEffectType[];
  pendingQuestion: QuizQuestionInternal | null;
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
      currentWorldId: null,
      collection: [],
      activeEffects: [],
      pendingQuestion: null,
    };
    this.players.set(player.id, player);
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
    // promuovi un nuovo host se serve
    if (![...this.players.values()].some((p) => p.isHost)) {
      const next = this.players.values().next().value;
      if (next) next.isHost = true;
    }
  }

  getSnapshot(forPlayerId: string): GameStateSnapshot | null {
    const me = this.players.get(forPlayerId);
    if (!me) return null;
    return {
      code: this.code,
      worlds: WORLDS,
      packs: PACKS,
      cardCatalog: CARD_CATALOG,
      players: [...this.players.values()].map((p) => ({
        id: p.id,
        name: p.name,
        coins: p.coins,
        isHost: p.isHost,
        currentWorldId: p.currentWorldId,
        cardCount: p.collection.length,
      })),
      me: {
        id: me.id,
        name: me.name,
        coins: me.coins,
        isHost: me.isHost,
        currentWorldId: me.currentWorldId,
        cardCount: me.collection.length,
        collection: me.collection,
        activeEffects: me.activeEffects,
      },
    };
  }

  broadcastState(io: IOServer) {
    for (const p of this.players.values()) {
      const snap = this.getSnapshot(p.id);
      if (snap) io.to(p.socketId).emit("state:update", snap);
    }
  }

  enterWorld(playerId: string, worldId: string, io: IOServer) {
    const player = this.players.get(playerId);
    if (!player) return;

    if (worldId !== CITTADELLA_ID && !WORLDS.some((w) => w.id === worldId)) {
      io.to(player.socketId).emit("error:message", {
        message: "Mondo sconosciuto.",
      });
      return;
    }

    player.currentWorldId = worldId;
    player.pendingQuestion = null;

    if (worldId === CITTADELLA_ID) {
      this.broadcastState(io);
      return;
    }

    // Per ora l'unico tipo di minigioco implementato è il quiz.
    // La struttura è già pronta per estendere resultType ad altri tipi.
    const resultType = "quiz" as const;
    const durationMs = 2600;

    io.to(player.socketId).emit("wheel:spin", {
      worldId,
      resultType,
      durationMs,
    });

    setTimeout(() => {
      // il giocatore potrebbe essersi spostato nel frattempo
      if (player.currentWorldId !== worldId) return;
      this.sendNewQuestion(player, io);
    }, durationMs);

    this.broadcastState(io);
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
      this.broadcastState(io);
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

    io.to(player.socketId).emit("quiz:result", {
      correct,
      correctIndex: question.correctIndex,
      coinsAwarded,
    });
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
