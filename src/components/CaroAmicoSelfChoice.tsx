import type { CaroAmicoPersonaDef } from "../../shared/types";
import { socket } from "../socket";

interface Props {
  personas: CaroAmicoPersonaDef[];
  currentSelfId: string | null;
  isMine: boolean;
  playerName: string;
}

export function CaroAmicoSelfChoice({ personas, currentSelfId, isMine, playerName }: Props) {
  return (
    <div className="wheel-wrap">
      <h1 className="display" style={{ fontSize: "1.8rem", textAlign: "center" }}>
        ✍️ Caro amico ti scrivo...
      </h1>

      {isMine ? (
        <>
          <div className="wheel-text-panel">
            <p>
              Quale di queste persone sei TU? Non ti verranno mai fatte domande sulle tue
              risposte.
            </p>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.6rem",
              justifyContent: "center",
              maxWidth: 480,
            }}
          >
            {personas.map((p) => (
              <button
                key={p.id}
                className="btn-outline"
                style={
                  currentSelfId === p.id
                    ? { borderColor: "var(--gold-soft)", color: "var(--gold-soft)" }
                    : undefined
                }
                onClick={() => socket.emit("caroamico:chooseSelf", { personaId: p.id })}
              >
                {p.emoji} {p.name}
              </button>
            ))}
          </div>
          <button
            className="btn-outline"
            style={{ marginTop: "0.6rem", fontSize: "0.8rem" }}
            onClick={() => socket.emit("caroamico:chooseSelf", { personaId: null })}
          >
            Nessuno di questi
          </button>
        </>
      ) : (
        <p style={{ color: "var(--cream)", fontSize: "1rem" }}>
          In attesa che <strong style={{ color: "var(--gold-soft)" }}>{playerName}</strong> scelga
          chi è…
        </p>
      )}
    </div>
  );
}
