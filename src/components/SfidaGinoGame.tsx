import type { SfidaGinoQuestionPayload } from "../../shared/types";
import { socket } from "../socket";

interface Props {
  payload: SfidaGinoQuestionPayload;
  isHost: boolean;
  isMine: boolean;
  playerName: string;
}

// SFIDA GINO: gioca solo il giocatore di turno, a voce, come in Grandioso
// Quiz Particolare, ma al MEGLIO DI N domande (stessa categoria per tutte,
// N = payload.totalQuestions, vedi SFIDA_GINO_ROUND_COUNT in GameSession) e
// un premio finale fisso e binario (2000 monete o 0, deciso dall'host solo
// alla fine, in base a quante ne ha indovinate).
export function SfidaGinoGame({ payload, isHost, isMine, playerName }: Props) {
  const isLastQuestion = payload.questionIndex >= payload.totalQuestions - 1;

  return (
    <div className="wheel-wrap">
      <div className="ocho-title-panel">
        <h1 className="display" style={{ fontSize: "1.6rem", textAlign: "center" }}>
          {payload.categoryEmoji} {payload.categoryName}
        </h1>
      </div>

      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center" }}>
        Domanda {payload.questionIndex + 1} di {payload.totalQuestions} —{" "}
        {isMine ? (
          "rispondi a voce!"
        ) : (
          <>
            <strong style={{ color: "var(--gold-soft)" }}>{playerName}</strong> risponde a voce...
          </>
        )}
      </p>

      <div className="ocho-prompt-panel" style={{ textAlign: "center" }}>
        {payload.prompt.kind === "text" ? (
          <p style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--cream)" }}>
            {payload.prompt.text}
          </p>
        ) : (
          <img
            src={payload.prompt.imageUrl}
            alt="Bandiera da indovinare"
            style={{ maxWidth: "100%", maxHeight: "38vh", borderRadius: "0.5rem", boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}
          />
        )}
      </div>

      {payload.revealed && (
        <div className="wheel-text-panel">
          <p className="subtle">Risposta</p>
          <p style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--gold-soft)" }}>{payload.answer}</p>
        </div>
      )}

      {isHost ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", alignItems: "center" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem", justifyContent: "center" }}>
            {!payload.revealed && (
              <button className="btn-outline" onClick={() => socket.emit("sfidaGino:reveal")}>
                Svela risposta
              </button>
            )}
            {!isLastQuestion && (
              <button className="btn-outline" onClick={() => socket.emit("sfidaGino:nextQuestion")}>
                Prossima domanda
              </button>
            )}
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "var(--cream)", marginBottom: "0.6rem" }}>
              Al meglio di {payload.totalQuestions}, quante ne ha indovinate{" "}
              <strong style={{ color: "var(--gold-soft)" }}>{playerName}</strong>? Assegna 2000 monete oppure 0:
            </p>
            <div style={{ display: "flex", gap: "0.8rem", justifyContent: "center" }}>
              <button
                className="btn-outline"
                onClick={() => socket.emit("sfidaGino:resolve", { coinsAwarded: 0 })}
              >
                0 🪙
              </button>
              <button
                className="btn"
                onClick={() => socket.emit("sfidaGino:resolve", { coinsAwarded: 2000 })}
              >
                2000 🪙
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
          In attesa che l'host assegni le monete...
        </p>
      )}
    </div>
  );
}
