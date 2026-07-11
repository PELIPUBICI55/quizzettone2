import { useState } from "react";
import type { GameStateSnapshot } from "../../shared/types";
import { socket } from "../socket";

interface Props {
  state: GameStateSnapshot;
}

export function PartyMenu({ state }: Props) {
  const [open, setOpen] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const isHost = state.me.isHost;

  const setCoins = (playerId: string, amount: number) => {
    socket.emit("party:setCoins", { playerId, amount: Math.max(0, Math.floor(amount)) });
  };

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
              width: "min(90vw, 340px)",
              maxHeight: "70vh",
              overflowY: "auto",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Party</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
              {state.players.map((p) => (
                <div key={p.id} style={{ borderBottom: "1px solid rgba(212,175,55,0.15)", paddingBottom: "0.5rem" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "0.5rem",
                    }}
                  >
                    <span style={{ fontSize: "0.9rem", opacity: p.connected ? 1 : 0.55 }}>
                      {p.id === state.currentTurnPlayerId && "🎲 "}
                      {p.name}
                      {p.isHost && " 👑"}
                      {p.id === state.me.id && " (tu)"}
                      {!p.connected && " · 🔴 offline"}
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

                  {isHost && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginTop: "0.4rem" }}>
                      <button
                        className="btn-outline"
                        style={{ padding: "0.15rem 0.45rem", fontSize: "0.7rem" }}
                        onClick={() => setCoins(p.id, p.coins - 10)}
                      >
                        −10
                      </button>
                      <button
                        className="btn-outline"
                        style={{ padding: "0.15rem 0.45rem", fontSize: "0.7rem" }}
                        onClick={() => setCoins(p.id, p.coins + 10)}
                      >
                        +10
                      </button>
                      <input
                        type="number"
                        placeholder="Imposta..."
                        value={drafts[p.id] ?? ""}
                        onChange={(e) => setDrafts((d) => ({ ...d, [p.id]: e.target.value }))}
                        style={{
                          width: "70px",
                          padding: "0.15rem 0.4rem",
                          fontSize: "0.75rem",
                          borderRadius: "6px",
                          border: "1px solid rgba(212,175,55,0.4)",
                          background: "var(--panel-raised)",
                          color: "var(--cream)",
                        }}
                      />
                      <button
                        className="btn-outline"
                        style={{ padding: "0.15rem 0.5rem", fontSize: "0.7rem" }}
                        onClick={() => {
                          const val = Number(drafts[p.id]);
                          if (!Number.isNaN(val)) {
                            setCoins(p.id, val);
                            setDrafts((d) => ({ ...d, [p.id]: "" }));
                          }
                        }}
                      >
                        ✓
                      </button>
                    </div>
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
