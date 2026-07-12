import type { CaroAmicoState } from "../../shared/types";
import { socket } from "../socket";

interface Props {
  state: CaroAmicoState;
  isHost: boolean;
  playerName: string;
}

export function CaroAmicoGame({ state, isHost, playerName }: Props) {
  return (
    <div className="wheel-wrap">
      <h1 className="display" style={{ fontSize: "1.6rem", textAlign: "center" }}>
        {state.personaEmoji} {state.personaName}
      </h1>
      <p style={{ color: "var(--cream)", textAlign: "center" }}>
        <strong style={{ color: "var(--gold-soft)" }}>{playerName}</strong> deve indovinare a voce
        la risposta di{" "}
        <strong style={{ color: "var(--gold-soft)" }}>{state.personaName}</strong>!
      </p>

      <div className="wheel-text-panel">
        <p style={{ fontWeight: 700 }}>{state.question}</p>
      </div>

      <div className="top5-list">
        <div className={`top5-row${state.revealed ? " revealed" : ""}`}>
          <span className="top5-answer">
            {state.revealed
              ? state.answer
              : state.fullAnswer
              ? `(${state.fullAnswer})`
              : "???"}
          </span>
          {isHost && !state.revealed && (
            <button
              className="btn-outline"
              style={{ fontSize: "0.65rem", padding: "0.25rem 0.5rem" }}
              onClick={() => socket.emit("caroamico:reveal")}
            >
              Rivela
            </button>
          )}
        </div>
      </div>

      {isHost ? (
        <div style={{ display: "flex", gap: "1rem", marginTop: "0.8rem" }}>
          <button className="btn" onClick={() => socket.emit("caroamico:resolve", { won: true })}>
            ✅ Vittoria
          </button>
          <button
            className="btn-outline"
            onClick={() => socket.emit("caroamico:resolve", { won: false })}
          >
            ❌ Sconfitta
          </button>
        </div>
      ) : (
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
          In attesa che l'host giudichi la risposta...
        </p>
      )}
    </div>
  );
}
