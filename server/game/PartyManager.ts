import { GameSession } from "./GameSession.js";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // niente 0/O/1/I ambigui

function generateCode(): string {
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

export class PartyManager {
  private sessions = new Map<string, GameSession>();

  create(): GameSession {
    let code = generateCode();
    while (this.sessions.has(code)) code = generateCode();
    const session = new GameSession(code);
    this.sessions.set(code, session);
    return session;
  }

  get(code: string): GameSession | undefined {
    return this.sessions.get(code.toUpperCase());
  }

  removeIfEmpty(code: string) {
    const session = this.sessions.get(code);
    if (session && session.isEmpty) this.sessions.delete(code);
  }
}
