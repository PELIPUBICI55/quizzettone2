import type { GameStateSnapshot } from "../../shared/types";

interface Props {
  state: GameStateSnapshot;
  onContinue: () => void;
}

export function TurnOrderReveal({ state, onContinue }: Props) {
  return (
    <div className="reveal-overlay">
      <h2 className="display" style={{ fontSize: "2.2rem" }}>
        🎲 Ordine dei turni
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", width: "min(90vw, 420px)" }}>
        {state.turnOrder.map((playerId, i) => {
          const player = state.players.find((p) => p.id === playerId);
          return (
            <div
              key={playerId}
              className="panel"
              style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.7rem 1.2rem" }}
            >
              <span className="display" style={{ fontSize: "1.5rem", color: "var(--gold-soft)", minWidth: "2rem" }}>
                {i + 1}°
              </span>
              <span>
                {player?.name ?? "?"}
                {player?.id === state.me.id && " (tu)"}
              </span>
            </div>
          );
        })}
      </div>
      <button className="btn" onClick={onContinue}>
        Si comincia!
      </button>
    </div>
  );
}
