import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "../shared/types.js";
import { PartyManager } from "./game/PartyManager.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const httpServer = http.createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: { origin: "*" },
});

const parties = new PartyManager();
// tiene traccia di dove si trova ogni socket, per instradare gli eventi
const socketLocation = new Map<string, { code: string; playerId: string }>();

app.get("/health", (_req, res) => res.status(200).send("ok"));

io.on("connection", (socket) => {
  socket.on("party:create", ({ name, clientId }, cb) => {
    const session = parties.create();
    const player = session.addPlayer(socket.id, name, clientId);
    socketLocation.set(socket.id, { code: session.code, playerId: player.id });
    cb({ ok: true, code: session.code });
    const snap = session.getSnapshot(player.id);
    if (snap) socket.emit("state:update", snap);
  });

  socket.on("party:join", ({ code, name, clientId }, cb) => {
    const session = parties.get(code);
    if (!session) {
      cb({ ok: false, error: "Codice partita non trovato." });
      return;
    }
    const player = session.addPlayer(socket.id, name, clientId);
    socketLocation.set(socket.id, { code: session.code, playerId: player.id });
    cb({ ok: true, code: session.code });
    session.broadcastState(io);
    session.resendPendingScreens(player.id, io);
    session.resendPendingQuestion(player.id, io);
  });

  socket.on("party:chooseToken", ({ token }) => {
    const loc = socketLocation.get(socket.id);
    if (!loc) return;
    const session = parties.get(loc.code);
    session?.chooseToken(loc.playerId, token, io);
  });

  socket.on("party:start", () => {
    const loc = socketLocation.get(socket.id);
    if (!loc) return;
    const session = parties.get(loc.code);
    session?.startGame(loc.playerId, io);
  });

  socket.on("party:kick", ({ playerId }) => {
    const loc = socketLocation.get(socket.id);
    if (!loc) return;
    const session = parties.get(loc.code);
    const kickedSocketId = session?.kickPlayer(loc.playerId, playerId, io);
    if (kickedSocketId) socketLocation.delete(kickedSocketId);
  });

  socket.on("board:roll", () => {
    const loc = socketLocation.get(socket.id);
    if (!loc) return;
    const session = parties.get(loc.code);
    session?.rollDice(loc.playerId, io);
  });

  socket.on("board:beginMinigame", () => {
    const loc = socketLocation.get(socket.id);
    if (!loc) return;
    const session = parties.get(loc.code);
    session?.beginMinigame(loc.playerId, io);
  });

  socket.on("board:beginQuiz", () => {
    const loc = socketLocation.get(socket.id);
    if (!loc) return;
    const session = parties.get(loc.code);
    session?.beginQuiz(loc.playerId, io);
  });

  socket.on("board:confirmMove", ({ direction }) => {
    const loc = socketLocation.get(socket.id);
    if (!loc) return;
    const session = parties.get(loc.code);
    session?.confirmMove(loc.playerId, direction, io);
  });

  socket.on("quiz:answer", ({ questionId, answerIndex }) => {
    const loc = socketLocation.get(socket.id);
    if (!loc) return;
    const session = parties.get(loc.code);
    session?.submitAnswer(loc.playerId, questionId, answerIndex, io);
  });

  socket.on("card:use", ({ cardId }) => {
    const loc = socketLocation.get(socket.id);
    if (!loc) return;
    const session = parties.get(loc.code);
    session?.useCard(loc.playerId, cardId, io);
  });

  socket.on("shop:buyPack", ({ packId }) => {
    const loc = socketLocation.get(socket.id);
    if (!loc) return;
    const session = parties.get(loc.code);
    session?.buyPack(loc.playerId, packId, io);
  });

  socket.on("shop:leave", () => {
    const loc = socketLocation.get(socket.id);
    if (!loc) return;
    const session = parties.get(loc.code);
    session?.leaveShop(loc.playerId, io);
  });

  socket.on("disconnect", () => {
    const loc = socketLocation.get(socket.id);
    if (!loc) return;
    socketLocation.delete(socket.id);
    const session = parties.get(loc.code);
    if (!session) return;
    session.markDisconnected(loc.playerId);
    session.broadcastState(io);
    parties.removeIfEmpty(loc.code);
  });
});

// In produzione serviamo il client buildato da Vite (vedi vite.config.ts:
// build.outDir = "dist/client", mentre questo file compila in dist/server).
const clientDist = path.join(__dirname, "../client");
app.use(express.static(clientDist));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/socket.io")) return next();
  res.sendFile(path.join(clientDist, "index.html"));
});

const PORT = Number(process.env.PORT) || 3001;
httpServer.listen(PORT, () => {
  console.log(`Quizzettone server in ascolto sulla porta ${PORT}`);
});
