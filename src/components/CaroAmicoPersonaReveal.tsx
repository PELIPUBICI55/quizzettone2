import { socket } from "../socket";

interface Props {
  personaName: string;
  personaEmoji: string;
  isMine: boolean;
  playerName: string;
}

export function CaroAmicoPersonaReveal({
  personaName,
  personaEmoji,
  isMine,
  playerName,
}: Props) {
  return (
    <div className="wheel-wrap">
      <h1 className="display" style={{ fontSize: "1.6rem" }}>
        🎯 È uscita la persona!
      </h1>

      <div className="wheel-text-panel top5-category-panel">
        <p className="subtle">Caro amico ti scrivo</p>
        <p style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--gold-soft)" }}>
          {personaEmoji} {personaName}
        </p>
      </div>

      {isMine ? (
        <button className="btn" onClick={() => socket.emit("caroamico:beginGame")}>
          Ok, iniziamo!
        </button>
      ) : (
        <p style={{ color: "var(--cream)", fontSize: "1rem" }}>
          In attesa che <strong style={{ color: "var(--gold-soft)" }}>{playerName}</strong> sia
          pronto…
        </p>
      )}
    </div>
  );
}
