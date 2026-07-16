import type { SfidaGinoQuestionPayload } from "../../shared/types";
import { socket } from "../socket";

interface Props {
  payload: SfidaGinoQuestionPayload;
  isHost: boolean;
  isMine: boolean;
  playerName: string;
}

// SFIDA GINO: gioca solo il giocatore di turno, a voce, come in Grandioso
// Quiz Particolare, ma con una sola domanda e un premio fisso e binario
// (2000 monete o 0, deciso dall'host).
export function SfidaGinoGame({ payload, isHost, isMine, playerName }: Props) {
  return (
    <div className="wheel-wrap">
      <div className="ocho-title-panel">
        <h1 className="display" style={{ fontSize: "1.6rem", textAlign: "center" }}>
          {payload.categoryEmoji} {payload.categoryName}
        </h1>
      </div>

      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center" }}>
        {isMine ? (
          "Rispondi a voce!"
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
          {!payload.revealed && (
            <button className="btn-outline" onClick={() => socket.emit("sfidaGino:reveal")}>
              Svela risposta
            </button>
          )}
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "var(--cream)", marginBottom: "0.6rem" }}>
              Quante monete assegni a <strong style={{ color: "var(--gold-soft)" }}>{playerName}</strong>?
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
