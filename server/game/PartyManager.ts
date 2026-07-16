import { GameSession, SerializedGameSession } from "./GameSession.js";
import { readSave } from "./saveStore.js";

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

  // Se la partita non è (più) in memoria, prima di arrenderci controlliamo
  // se esiste un salvataggio su disco per questo codice (vedi
  // GameSession.saveGame): così ricollegarsi con lo stesso codice stanza
  // funziona anche dopo che tutti erano usciti, o dopo un riavvio del
  // server. Una volta ripescata, resta in memoria come una partita normale.
  get(code: string): GameSession | undefined {
    const upperCode = code.toUpperCase();
    const existing = this.sessions.get(upperCode);
    if (existing) return existing;

    const saved = readSave(upperCode);
    if (!saved) return undefined;
    const restored = GameSession.deserialize(saved as SerializedGameSession);
    this.sessions.set(upperCode, restored);
    return restored;
  }

  removeIfEmpty(code: string) {
    const session = this.sessions.get(code);
    if (session && session.isEmpty) this.sessions.delete(code);
  }
}
