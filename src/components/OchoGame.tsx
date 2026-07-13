import type { OchoStatePayload } from "../../shared/types";
import { socket } from "../socket";

interface Props {
  state: OchoStatePayload;
  isMine: boolean; // sono io il giocatore che sta selezionando le celle?
  isHost: boolean;
  playerName: string;
}

// A differenza di Top5/CaroAmico, qui non è l'host a rivelare le risposte:
// è il giocatore di turno stesso (isMine) a cliccare le celle, cercando di
// evitare quella "bomba". L'host entra in gioco solo alla fine (state.ended),
// per decidere quante monete assegnare.
//
// Titolo, domanda e celle usano pannelli scuri e pieni con bordo dorato
// (.ocho-title-panel / .ocho-prompt-panel / .ocho-grid-panel / .ocho-cell,
// in src/index.css) invece di trasparenze chiare, perché lo sfondo dell'app
// è una galassia animata molto satura e le trasparenze chiare ci si
// perdevano dentro.
export function OchoGame({ state, isMine, isHost, playerName }: Props) {
  const selectCell = (index: number) => {
    if (!isMine || state.ended) return;
    const cell = state.cells[index];
    if (cell.revealed) return;
    socket.emit("ocho:select", { index });
  };

  return (
    <div className="wheel-wrap">
      <div className="ocho-title-panel">
        <h1 className="display" style={{ fontSize: "1.6rem", textAlign: "center" }}>
          💣 {state.categoryEmoji} {state.categoryName}
        </h1>
      </div>

      <div className="ocho-prompt-panel">
        <p>{state.prompt}</p>
      </div>

      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center" }}>
        {isMine
          ? "Seleziona le risposte una alla volta: evita la scossa!"
          : (
            <>
              <strong style={{ color: "var(--gold-soft)" }}>{playerName}</strong> sta scegliendo le
              risposte...
            </>
          )}
      </p>

      <div className="ocho-grid-panel">
        <div className="ocho-grid">
          {state.cells.map((cell, i) => {
            const clickable = isMine && !state.ended && !cell.revealed;
            const stateClass = cell.revealed ? (cell.isBomb ? "bomb" : "safe") : "";
            return (
              <button
                key={i}
                onClick={() => selectCell(i)}
                disabled={!clickable}
                className={`ocho-cell${clickable ? " clickable" : ""}${stateClass ? ` ${stateClass}` : ""}`}
              >
                <span>{cell.text}</span>
                {cell.revealed && (
                  <span style={{ fontSize: "1.3rem" }}>{cell.isBomb ? "💣" : "✅"}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {state.ended ? (
        isHost ? (
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "var(--cream)", marginBottom: "0.6rem" }}>
              Quante monete assegni a <strong style={{ color: "var(--gold-soft)" }}>{playerName}</strong>?
            </p>
            <div style={{ display: "flex", gap: "0.8rem", justifyContent: "center" }}>
              <button
                className="btn-outline"
                onClick={() => socket.emit("ocho:resolve", { coinsAwarded: 0 })}
              >
                0 🪙
              </button>
              <button
                className="btn-outline"
                onClick={() => socket.emit("ocho:resolve", { coinsAwarded: 50 })}
              >
                50 🪙
              </button>
              <button
                className="btn"
                onClick={() => socket.emit("ocho:resolve", { coinsAwarded: 100 })}
              >
                100 🪙
              </button>
            </div>
          </div>
        ) : (
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            In attesa che l'host assegni le monete...
          </p>
        )
      ) : (
        <p className="ocho-progress-text" style={{ fontSize: "0.8rem" }}>
          {state.cells.filter((c) => c.revealed).length} / {state.cells.length - 1} risposte sicure
          trovate
        </p>
      )}
    </div>
  );
}
