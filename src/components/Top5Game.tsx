import type { Top5State } from "../../shared/types";
import { socket } from "../socket";

interface Props {
  state: Top5State;
  isHost: boolean;
  playerName: string;
}

export function Top5Game({ state, isHost, playerName }: Props) {
  return (
    <div className="wheel-wrap">
      <h1 className="display" style={{ fontSize: "1.7rem", textAlign: "center" }}>
        🏆 {state.title}
      </h1>
      <p style={{ color: "var(--cream)", textAlign: "center" }}>
        <strong style={{ color: "var(--gold-soft)" }}>{playerName}</strong> deve indovinare la
        classifica a voce!
      </p>

      <div className="top5-hearts">
        {[0, 1, 2].map((i) => (
          <span key={i} className="top5-heart">
            {i < state.heartsBroken ? "💔" : "❤️"}
          </span>
        ))}
      </div>

      <div className="top5-list">
        {state.slots.map((slot, i) => {
          const trueAnswer = state.fullAnswers?.[i];
          const isRevealed = !!slot.answer;
          return (
            <div key={slot.rank} className={`top5-row${isRevealed ? " revealed" : ""}`}>
              <span className="top5-rank">{slot.rank}°</span>
              <span className="top5-answer">
                {isRevealed ? slot.answer : trueAnswer ? `(${trueAnswer})` : "???"}
              </span>
              {isHost && !isRevealed && (
                <button
                  className="btn-outline"
                  style={{ fontSize: "0.65rem", padding: "0.25rem 0.5rem" }}
                  onClick={() => socket.emit("top5:reveal", { rank: slot.rank })}
                >
                  Rivela
                </button>
              )}
            </div>
          );
        })}
      </div>

      {isHost ? (
        <>
          <button
            className="btn-outline"
            disabled={state.heartsBroken >= 3}
            onClick={() => socket.emit("top5:breakHeart")}
          >
            💔 Spezza un cuore (risposta sbagliata)
          </button>

          <div style={{ display: "flex", gap: "1rem", marginTop: "0.8rem" }}>
            <button className="btn" onClick={() => socket.emit("top5:resolve", { won: true })}>
              ✅ Vittoria
            </button>
            <button
              className="btn-outline"
              onClick={() => socket.emit("top5:resolve", { won: false })}
            >
              ❌ Sconfitta
            </button>
          </div>
        </>
      ) : (
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
          In attesa che l'host giudichi le risposte...
        </p>
      )}

      {state.source && (
        <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", marginTop: "0.4rem" }}>
          Fonte: {state.source}
        </p>
      )}
    </div>
  );
}
