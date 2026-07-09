import type { Server } from "socket.io";
import type {
  BoardPosition,
  CardEffectType,
  ClientToServerEvents,
  GameStateSnapshot,
  OwnedCard,
  PawnToken,
  ServerToClientEvents,
} from "../../shared/types.js";
import { WORLDS, CITTADELLA_ID } from "../data/worlds.js";
import { CARD_CATALOG, pickRandomCards } from "../data/cards.js";
import { PACKS } from "../data/packs.js";
import { pickRandomQuestion, QuizQuestionInternal } from "../data/questions.js";
import { BOARD_EDGES, edgeById, neighborsOf } from "../../shared/board.js";

type IOServer = Server<ClientToServerEvents, ServerToClientEvents>;

type SurpriseKind = "coinsGain" | "coinsLoss" | "freeCard" | "extraRoll";

interface SurprisePlan {
  kind: SurpriseKind;
  amount: number;
  cardId?: string;
  message: string;
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
  pendingQuestion: QuizQuestionInternal | null;
  pendingWorldId: string | null; // mondo in cui si trova mentre risolve un minigioco
  awaitingWheelStart: boolean; // sulla schermata di benvenuto, in attesa che clicchi "Ok iniziamo"
  awaitingQuizStart: boolean; // sulla schermata di risultato ruota, in attesa che clicchi "Ok iniziamo"
  pendingSurprise: SurprisePlan | null; // imprevisto pescato ma non ancora applicato
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
      pendingQuestion: null,
      pendingWorldId: null,
      awaitingWheelStart: false,
      awaitingQuizStart: false,
      pendingSurprise: null,
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
        message: player.pendingSurprise.message,
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
        statuses: [],
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
        statuses: [],
        cardCount: me.collection.length,
        collection: me.collection,
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
    if (this.players.size < 2) {
      io.to(player.socketId).emit("error:message", {
        message: "Serve almeno un altro giocatore per iniziare.",
      });
      return;
    }
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

    if (landedNodeId === CITTADELLA_ID) {
      player.pendingShop = true;
      // il turno finisce quando lascerà la Cittadella (leaveShop)
    } else if (landedNodeId) {
      this.arriveAtWorld(player, landedNodeId, io);
      // il turno finisce quando la domanda verrà risolta (submitAnswer)
    } else {
      // ancora a metà ponte: controlla se è capitato su una casella imprevisto
      const edge = edgeById(player.boardPosition.edgeId!);
      const progress = player.boardPosition.progress!;
      const isSurprise = !!edge?.surprises.includes(progress);
      if (isSurprise) {
        const plan = this.rollSurprisePlan(player);
        player.pendingSurprise = plan;
        io.emit("board:surpriseDrawn", { playerId: player.id, message: plan.message });
        // il turno finisce solo quando chiuderà la schermata (closeSurprise)
      } else {
        this.advanceTurn();
      }
    }

    this.broadcastState(io);
  }

  // Decide l'effetto casuale della casella "imprevisto" ma NON lo applica
  // ancora: verrà applicato solo alla chiusura della schermata dedicata.
  private rollSurprisePlan(player: InternalPlayer): SurprisePlan {
    const roll = Math.random();

    if (roll < 0.3) {
      return { kind: "coinsGain", amount: 20, message: "✨ Imprevisto fortunato! +20 monete" };
    }
    if (roll < 0.5) {
      const amount = Math.min(player.coins, 10);
      return { kind: "coinsLoss", amount, message: `⚡ Imprevisto sfortunato! -${amount} monete` };
    }
    if (roll < 0.75) {
      const [card] = pickRandomCards(1);
      return {
        kind: "freeCard",
        amount: 0,
        cardId: card.id,
        message: `🎴 Imprevisto magico! Hai trovato "${card.name}"`,
      };
    }
    return { kind: "extraRoll", amount: 0, message: "🎲 Imprevisto fortunato! Tira di nuovo" };
  }

  // Chiude la schermata dell'imprevisto e SOLO ORA applica davvero l'effetto.
  closeSurprise(playerId: string, io: IOServer) {
    const player = this.players.get(playerId);
    if (!player || !player.pendingSurprise) return;
    if (this.currentTurnPlayerId() !== playerId) return;

    const plan = player.pendingSurprise;
    player.pendingSurprise = null;

    switch (plan.kind) {
      case "coinsGain":
        player.coins += plan.amount;
        break;
      case "coinsLoss":
        player.coins -= plan.amount;
        break;
      case "freeCard":
        if (plan.cardId) {
          player.collection.push({
            instanceId: nextCardInstanceId(),
            cardId: plan.cardId,
            used: false,
          });
        }
        break;
      case "extraRoll":
        break; // nessun cambiamento di stato, il turno resta suo
    }

    if (plan.kind !== "extraRoll") {
      this.advanceTurn();
    }
    this.broadcastState(io);
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
    // Per ora l'unico tipo di minigioco implementato è il quiz.
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

    player.coins += coinsAwarded;
    player.pendingWorldId = null;

    io.emit("quiz:result", {
      playerId: player.id,
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
