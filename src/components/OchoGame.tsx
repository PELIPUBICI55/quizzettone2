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
export function OchoGame({ state, isMine, isHost, playerName }: Props) {
  const selectCell = (index: number) => {
    if (!isMine || state.ended) return;
    const cell = state.cells[index];
    if (cell.revealed) return;
    socket.emit("ocho:select", { index });
  };

  return (
    <div className="wheel-wrap">
      <h1 className="display" style={{ fontSize: "1.6rem", textAlign: "center" }}>
        💣 {state.categoryEmoji} {state.categoryName}
      </h1>
      <p style={{ color: "var(--cream)", textAlign: "center", maxWidth: 480 }}>
        {state.prompt}
      </p>
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "0.6rem",
          width: "100%",
          maxWidth: 480,
          margin: "0.8rem 0",
        }}
      >
        {state.cells.map((cell, i) => {
          const clickable = isMine && !state.ended && !cell.revealed;
          let background = "rgba(255, 255, 255, 0.06)";
          let borderColor = "rgba(255, 255, 255, 0.18)";
          if (cell.revealed) {
            if (cell.isBomb) {
              background = "rgba(220, 38, 38, 0.28)";
              borderColor = "rgba(248, 113, 113, 0.7)";
            } else {
              background = "rgba(34, 197, 94, 0.22)";
              borderColor = "rgba(74, 222, 128, 0.7)";
            }
          }
          return (
            <button
              key={i}
              onClick={() => selectCell(i)}
              disabled={!clickable}
              style={{
                background,
                border: `1.5px solid ${borderColor}`,
                borderRadius: "0.6rem",
                padding: "0.7rem 0.5rem",
                minHeight: "4.2rem",
                color: "var(--cream)",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: clickable ? "pointer" : "default",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.25rem",
                textAlign: "center",
              }}
            >
              <span>{cell.text}</span>
              {cell.revealed && (
                <span style={{ fontSize: "1.3rem" }}>{cell.isBomb ? "💣" : "✅"}</span>
              )}
            </button>
          );
        })}
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
        <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
          {state.cells.filter((c) => c.revealed).length} / {state.cells.length - 1} risposte sicure
          trovate
        </p>
      )}
    </div>
  );
}
