import type { DuckEndedPayload, DuckGridStatePayload } from "../../shared/types";
import { socket } from "../socket";

interface Props {
  state: DuckGridStatePayload;
  ended: DuckEndedPayload | null;
  isMine: boolean;
  playerName: string;
}

// Griglia premi di ACCHIAPPA LA PAPERA: il giocatore di turno (isMine)
// sceglie UNA delle 9 caselle. Il server rivela SUBITO tutte le posizioni
// dei premi (stesso "reveal totale" richiesto dall'utente), evidenziando
// quella scelta con .duck-cell.chosen; nessun host deve confermare nulla,
// il turno avanza da solo dopo una breve pausa lato server.
export function DuckGrid({ state, ended, isMine, playerName }: Props) {
  const anyRevealed = state.cells.some((c) => c.revealed);

  const selectCell = (index: number) => {
    if (!isMine || anyRevealed) return;
    socket.emit("duck:selectCell", { index });
  };

  return (
    <div className="wheel-wrap">
      <div className="ocho-title-panel">
        <h1 className="display" style={{ fontSize: "1.5rem", textAlign: "center" }}>
          🏆 {state.categoryEmoji} Griglia dei premi!
        </h1>
      </div>

      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center" }}>
        {anyRevealed
          ? ended
            ? `Premio assegnato: ${ended.coinsAwarded} 🪙`
            : "Ecco dove si nascondevano tutti i premi..."
          : isMine
          ? "Scegli una casella: i premi nascosti sono 500 - 100 - 100 - 50 - 50 - 50 - 50 - 40 - 40."
          : (
            <>
              <strong style={{ color: "var(--gold-soft)" }}>{playerName}</strong> sta scegliendo una
              casella...
            </>
          )}
      </p>

      <div className="ocho-grid-panel">
        <div className="ocho-grid">
          {state.cells.map((cell, i) => {
            const clickable = isMine && !anyRevealed;
            let stateClass = "";
            if (cell.revealed) stateClass = cell.chosen ? "chosen" : "safe";
            return (
              <button
                key={i}
                onClick={() => selectCell(i)}
                disabled={!clickable}
                className={`ocho-cell${clickable ? " clickable" : ""}${stateClass ? ` ${stateClass}` : ""}`}
              >
                {cell.revealed ? (
                  <span style={{ fontSize: "1.15rem", fontWeight: 800 }}>{cell.prize} 🪙</span>
                ) : (
                  <span style={{ fontSize: "1.4rem" }}>❔</span>
                )}
                {cell.chosen && <span style={{ fontSize: "1rem" }}>👆 tua scelta</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
