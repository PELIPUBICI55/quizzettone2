import { useState } from "react";
import type { GameStateSnapshot } from "../../shared/types";
import { socket } from "../socket";

interface Props {
  state: GameStateSnapshot;
}

export function PartyMenu({ state }: Props) {
  const [open, setOpen] = useState(false);
  const isHost = state.me.isHost;

  return (
    <div style={{ position: "relative" }}>
      <button className="btn-outline" onClick={() => setOpen((o) => !o)}>
        👥 Party ({state.players.length})
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 59 }} />
          <div
            className="panel"
            style={{
              position: "absolute",
              top: "calc(100% + 0.5rem)",
              right: 0,
              zIndex: 60,
              width: "min(90vw, 320px)",
              maxHeight: "70vh",
              overflowY: "auto",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Party</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {state.players.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.5rem",
                  }}
                >
                  <span style={{ fontSize: "0.9rem" }}>
                    {p.id === state.currentTurnPlayerId && "🎲 "}
                    {p.name}
                    {p.isHost && " 👑"}
                    {p.id === state.me.id && " (tu)"}
                    <br />
                    <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                      🪙{p.coins} · 🎴{p.cardCount}
                    </span>
                  </span>
                  {isHost && p.id !== state.me.id && (
                    <button
                      className="btn-outline"
                      style={{ fontSize: "0.7rem", padding: "0.3rem 0.6rem", flexShrink: 0 }}
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
          </div>
        </>
      )}
    </div>
  );
}
