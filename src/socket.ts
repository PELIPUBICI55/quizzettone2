import { io, Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "../shared/types";

// Stesso host/porta del server: in dev il proxy di Vite (vedi vite.config.ts)
// inoltra /socket.io verso localhost:3001; in produzione client e server
// sono serviti dallo stesso processo Express.
export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io({
  autoConnect: false,
});
