import express from "express";
import fs from "fs";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { Server, type Socket } from "socket.io";
import { pickQuestions } from "../shared/questions.js";
import {
  QUESTIONS_PER_GAME,
  QUESTION_TIME_MS,
  REVEAL_TIME_MS,
  computePoints,
  generateRoomCode,
  type AnswerResult,
  type Player,
  type Question,
  type QuestionPayload,
  type QuestionSummary,
  type RoomState,
} from "../shared/types.js";

const PORT = Number(process.env.PORT) || 3001;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.join(__dirname, "../client");

interface Room {
  code: string;
  hostId: string;
  players: Map<string, Player>;
  questions: Question[];
  questionIndex: number;
  phase: RoomState["phase"];
  answers: Map<string, { answerIndex: number; elapsedMs: number }>;
  questionStartedAt: number;
  timers: NodeJS.Timeout[];
}

const rooms = new Map<string, Room>();

function clearTimers(room: Room) {
  for (const timer of room.timers) clearTimeout(timer);
  room.timers = [];
}

function getPlayerList(room: Room): Player[] {
  return [...room.players.values()].sort((a, b) => b.score - a.score);
}

function publicQuestion(q: Question, index: number, total: number): QuestionPayload {
  const { correctIndex: _, ...rest } = q;
  return {
    index,
    total,
    question: rest,
    timeLimitMs: QUESTION_TIME_MS,
  };
}

function buildRoomState(room: Room, summary?: QuestionSummary): RoomState {
  const players = getPlayerList(room);
  const state: RoomState = {
    code: room.code,
    phase: room.phase,
    players,
    questionIndex: room.questionIndex,
    totalQuestions: room.questions.length,
  };

  if (room.phase === "question" && room.questions[room.questionIndex]) {
    state.currentQuestion = publicQuestion(
      room.questions[room.questionIndex],
      room.questionIndex,
      room.questions.length
    );
  }

  if (summary) state.lastSummary = summary;
  if (room.phase === "finished") {
    const winner = players[0];
    if (winner) state.winner = { id: winner.id, name: winner.name, score: winner.score };
  }

  return state;
}

function emitRoom(io: Server, room: Room, summary?: QuestionSummary) {
  io.to(room.code).emit("room-state", buildRoomState(room, summary));
}

function scheduleReveal(io: Server, room: Room) {
  const timer = setTimeout(() => revealQuestion(io, room), QUESTION_TIME_MS);
  room.timers.push(timer);
}

function revealQuestion(io: Server, room: Room) {
  const question = room.questions[room.questionIndex];
  if (!question) return;

  room.phase = "reveal";
  const results: AnswerResult[] = [];

  for (const [playerId, player] of room.players) {
    const answer = room.answers.get(playerId);
    const answerIndex = answer?.answerIndex ?? null;
    const correct = answerIndex === question.correctIndex;
    const points = answer
      ? computePoints(correct, answer.elapsedMs, QUESTION_TIME_MS)
      : 0;

    if (points > 0) player.score += points;

    results.push({
      playerId,
      playerName: player.name,
      answerIndex,
      correct,
      pointsEarned: points,
    });
  }

  results.sort((a, b) => b.pointsEarned - a.pointsEarned);

  const summary: QuestionSummary = {
    questionIndex: room.questionIndex,
    correctIndex: question.correctIndex,
    results,
    scores: getPlayerList(room).map((p) => ({ id: p.id, name: p.name, score: p.score })),
  };

  emitRoom(io, room, summary);

  const timer = setTimeout(() => {
    room.questionIndex += 1;
    if (room.questionIndex >= room.questions.length) {
      finishGame(io, room);
    } else {
      startQuestion(io, room);
    }
  }, REVEAL_TIME_MS);
  room.timers.push(timer);
}

function startQuestion(io: Server, room: Room) {
  room.phase = "question";
  room.answers.clear();
  room.questionStartedAt = Date.now();
  emitRoom(io, room);
  scheduleReveal(io, room);
}

function finishGame(io: Server, room: Room) {
  room.phase = "finished";
  clearTimers(room);
  emitRoom(io, room);
}

function createRoom(hostId: string, hostName: string): Room {
  let code = generateRoomCode();
  while (rooms.has(code)) code = generateRoomCode();

  const host: Player = { id: hostId, name: hostName, score: 0, isHost: true };
  const room: Room = {
    code,
    hostId,
    players: new Map([[hostId, host]]),
    questions: pickQuestions(QUESTIONS_PER_GAME),
    questionIndex: 0,
    phase: "lobby",
    answers: new Map(),
    questionStartedAt: 0,
    timers: [],
  };

  rooms.set(code, room);
  return room;
}

function joinRoom(code: string, playerId: string, name: string): Room | null {
  const room = rooms.get(code.toUpperCase());
  if (!room || room.phase !== "lobby") return null;
  if ([...room.players.values()].some((p) => p.name.toLowerCase() === name.toLowerCase())) {
    return null;
  }

  room.players.set(playerId, { id: playerId, name, score: 0, isHost: false });
  return room;
}

function removePlayer(io: Server, socket: Socket, room: Room, playerId: string) {
  const player = room.players.get(playerId);
  if (!player) return;

  room.players.delete(playerId);
  socket.leave(room.code);

  if (room.players.size === 0) {
    clearTimers(room);
    rooms.delete(room.code);
    return;
  }

  if (player.isHost) {
    const nextHost = room.players.values().next().value as Player;
    nextHost.isHost = true;
    room.hostId = nextHost.id;
  }

  if (room.phase === "lobby") {
    emitRoom(io, room);
  }
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: true, credentials: true },
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, rooms: rooms.size });
});

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

io.on("connection", (socket) => {
  let currentRoomCode: string | null = null;

  socket.on("create-room", (playerName: string, callback) => {
    const name = playerName?.trim();
    if (!name) return callback({ ok: false, error: "Inserisci un nome valido." });

    const room = createRoom(socket.id, name);
    currentRoomCode = room.code;
    socket.join(room.code);
    callback({ ok: true, roomCode: room.code });
    emitRoom(io, room);
  });

  socket.on("join-room", (payload: { code: string; name: string }, callback) => {
    const name = payload.name?.trim();
    const code = payload.code?.trim().toUpperCase();
    if (!name || !code) return callback({ ok: false, error: "Nome e codice richiesti." });

    const room = joinRoom(code, socket.id, name);
    if (!room) {
      return callback({
        ok: false,
        error: "Stanza non trovata, partita già iniziata, o nome già in uso.",
      });
    }

    currentRoomCode = room.code;
    socket.join(room.code);
    callback({ ok: true, roomCode: room.code });
    emitRoom(io, room);
  });

  socket.on("start-game", () => {
    const room = currentRoomCode ? rooms.get(currentRoomCode) : null;
    if (!room || room.hostId !== socket.id || room.phase !== "lobby") return;
    if (room.players.size < 1) return;

    clearTimers(room);
    room.questionIndex = 0;
    for (const player of room.players.values()) player.score = 0;
    startQuestion(io, room);
  });

  socket.on("submit-answer", (answerIndex: number) => {
    const room = currentRoomCode ? rooms.get(currentRoomCode) : null;
    if (!room || room.phase !== "question") return;
    if (room.answers.has(socket.id)) return;

    const elapsedMs = Date.now() - room.questionStartedAt;
    room.answers.set(socket.id, { answerIndex, elapsedMs });

    if (room.answers.size === room.players.size) {
      clearTimers(room);
      revealQuestion(io, room);
    }
  });

  socket.on("play-again", () => {
    const room = currentRoomCode ? rooms.get(currentRoomCode) : null;
    if (!room || room.hostId !== socket.id) return;

    clearTimers(room);
    room.phase = "lobby";
    room.questionIndex = 0;
    room.answers.clear();
    room.questions = pickQuestions(QUESTIONS_PER_GAME);
    for (const player of room.players.values()) player.score = 0;
    emitRoom(io, room);
  });

  socket.on("disconnect", () => {
    if (!currentRoomCode) return;
    const room = rooms.get(currentRoomCode);
    if (!room) return;
    removePlayer(io, socket, room, socket.id);
  });
});

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Quizzettone server in ascolto sulla porta ${PORT}`);
});
