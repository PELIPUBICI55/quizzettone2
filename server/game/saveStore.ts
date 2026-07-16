import fs from "fs";
import path from "path";

// Le partite salvate manualmente (vedi GameSession.saveGame) vivono qui come
// semplici file JSON, uno per codice stanza. Bastano per riprendere una
// partita con lo stesso codice anche dopo un riavvio del server (vedi
// PartyManager.get, che ci ripesca da qui se non trova nulla in memoria).
const SAVES_DIR = path.join(process.cwd(), "saves");

function ensureDir() {
  if (!fs.existsSync(SAVES_DIR)) fs.mkdirSync(SAVES_DIR, { recursive: true });
}

function fileFor(code: string): string {
  // il codice arriva anche direttamente da un evento socket (party:join):
  // meglio ripulirlo da tutto ciò che non è alfanumerico prima di usarlo in
  // un path su disco, per sicurezza (niente attraversamento di cartelle).
  const safeCode = code.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 20) || "INVALID";
  return path.join(SAVES_DIR, `${safeCode}.json`);
}

export function writeSave(code: string, data: unknown) {
  ensureDir();
  fs.writeFileSync(fileFor(code), JSON.stringify(data), "utf-8");
}

export function readSave(code: string): unknown | null {
  const file = fileFor(code);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch {
    // file corrotto/illeggibile: meglio ignorarlo che far esplodere il server
    return null;
  }
}

export function deleteSave(code: string) {
  const file = fileFor(code);
  if (fs.existsSync(file)) fs.unlinkSync(file);
}
