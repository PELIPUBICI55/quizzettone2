import type { GameStateSnapshot } from "../../shared/types";
import { socket } from "../socket";

interface Props {
  state: GameStateSnapshot;
}

export function Lobby({ state }: Props) {
  const isHost = state.me.isHost;

  return (
    <div className="join-screen">
      <div className="join-panel panel" style={{ maxWidth: 480 }}>
        <h1 style={{ fontSize: "2.2rem" }}>In attesa...</h1>
        <p className="subtitle">
          Codice partita: <strong style={{ color: "var(--gold-soft)" }}>{state.code}</strong>
        </p>

        <h3 className="section-title" style={{ textAlign: "left" }}>
          Giocatori nel party ({state.players.length})
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.5rem" }}>
          {state.players.map((p) => (
            <div
              key={p.id}
              className="panel"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.6rem 1rem",
              }}
            >
              <span>
                {p.name}
                {p.isHost && " 👑"}
                {p.id === state.me.id && " (tu)"}
                {!p.connected && " · 🔴 offline"}
              </span>
              {isHost && p.id !== state.me.id && (
                <button
                  className="btn-outline"
                  style={{ fontSize: "0.75rem", padding: "0.35rem 0.7rem" }}
                  onClick={() => {
                    if (confirm(`Espellere ${p.name} dalla partita?`)) {
                      socket.emit("party:kick", { playerId: p.id });
                    }
                  }}
                >
                  Espelli
                </button>
              )}
            </div>
          ))}
        </div>

        {isHost ? (
          <>
            <button
              className="btn"
              style={{ width: "100%" }}
              disabled={state.players.length < 2}
              onClick={() => socket.emit("party:start")}
            >
              🎲 Avvia partita
            </button>
            {state.players.length < 2 && (
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                Serve almeno un altro giocatore per iniziare.
              </p>
            )}
          </>
        ) : (
          <p style={{ color: "var(--text-muted)" }}>In attesa che l'host avvii la partita…</p>
        )}
      </div>
    </div>
  );
}
