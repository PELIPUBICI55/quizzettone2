import type { GameStateSnapshot, PawnToken } from "../../shared/types";
import { socket } from "../socket";

interface Props {
  state: GameStateSnapshot;
}

const TOKENS: { id: PawnToken; emoji: string; label: string }[] = [
  { id: "hat", emoji: "🎩", label: "Cappello" },
  { id: "car", emoji: "🚗", label: "Macchina" },
  { id: "dog", emoji: "🐕", label: "Cane" },
  { id: "boot", emoji: "👢", label: "Stivale" },
  { id: "ship", emoji: "🚢", label: "Nave" },
  { id: "wheelbarrow", emoji: "🛒", label: "Carriola" },
];

export function Lobby({ state }: Props) {
  const isHost = state.me.isHost;
  const allChoseToken = state.players.every((p) => p.token !== null);
  const takenTokens = new Map(state.players.filter((p) => p.token).map((p) => [p.token, p.name]));

  return (
    <div className="join-screen">
      <div className="join-panel panel" style={{ maxWidth: 520 }}>
        <h1 style={{ fontSize: "2.2rem" }}>In attesa...</h1>
        <p className="subtitle">
          Codice partita: <strong style={{ color: "var(--gold-soft)" }}>{state.code}</strong>
        </p>

        <h3 className="section-title" style={{ textAlign: "left" }}>
          Scegli la tua pedina
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
            gap: "0.6rem",
            marginBottom: "1.5rem",
          }}
        >
          {TOKENS.map((t) => {
            const ownerName = takenTokens.get(t.id);
            const isMine = state.me.token === t.id;
            const isTakenByOther = ownerName && !isMine;
            return (
              <button
                key={t.id}
                className={isMine ? "btn" : "btn-outline"}
                disabled={!!isTakenByOther}
                onClick={() => socket.emit("party:chooseToken", { token: t.id })}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.2rem",
                  padding: "0.6rem 0.4rem",
                  opacity: isTakenByOther ? 0.4 : 1,
                }}
              >
                <span style={{ fontSize: "1.6rem" }}>{t.emoji}</span>
                <span style={{ fontSize: "0.75rem" }}>{t.label}</span>
                {isTakenByOther && (
                  <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{ownerName}</span>
                )}
              </button>
            );
          })}
        </div>

        <h3 className="section-title" style={{ textAlign: "left" }}>
          Giocatori nel party ({state.players.length})
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.5rem" }}>
          {state.players.map((p) => {
            const tokenInfo = TOKENS.find((t) => t.id === p.token);
            return (
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
                  {tokenInfo ? tokenInfo.emoji : "❔"} {p.name}
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
            );
          })}
        </div>

        {isHost ? (
          <>
            <button
              className="btn"
              style={{ width: "100%" }}
              disabled={state.players.length < 2 || !allChoseToken}
              onClick={() => socket.emit("party:start")}
            >
              🎲 Avvia partita
            </button>
            {state.players.length < 2 && (
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                Serve almeno un altro giocatore per iniziare.
              </p>
            )}
            {state.players.length >= 2 && !allChoseToken && (
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                In attesa che tutti scelgano una pedina.
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
