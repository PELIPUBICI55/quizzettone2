import { io, type Socket } from "socket.io-client";
import type { RoomState } from "../shared/types";

const SERVER_URL =
  import.meta.env.VITE_SERVER_URL ||
  (import.meta.env.DEV ? "http://localhost:3001" : undefined);

let socket: Socket | null = null;
let localPlayerId: string | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SERVER_URL, {
      autoConnect: false,
      transports: ["websocket", "polling"],
    });
    socket.on("connect", () => {
      localPlayerId = socket!.id;
    });
  }
  return socket;
}

export function getLocalPlayerId(): string | null {
  return localPlayerId ?? getSocket().id ?? null;
}

export type CreateRoomCallback = (result: { ok: true; roomCode: string } | { ok: false; error: string }) => void;
export type JoinRoomCallback = CreateRoomCallback;

export function createRoom(playerName: string, callback: CreateRoomCallback) {
  getSocket().connect();
  getSocket().emit("create-room", playerName, callback);
}

export function joinRoom(code: string, name: string, callback: JoinRoomCallback) {
  getSocket().connect();
  getSocket().emit("join-room", { code, name }, callback);
}

export function startGame() {
  getSocket().emit("start-game");
}

export function submitAnswer(answerIndex: number) {
  getSocket().emit("submit-answer", answerIndex);
}

export function playAgain() {
  getSocket().emit("play-again");
}

export function onRoomState(handler: (state: RoomState) => void) {
  const s = getSocket();
  s.on("room-state", handler);
  return () => s.off("room-state", handler);
}
