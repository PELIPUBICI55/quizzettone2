import { socket } from "../socket";

interface Props {
  categoryName: string;
  categoryEmoji: string;
  isMine: boolean;
  playerName: string;
}

export function ParticolareCategoryReveal({ categoryName, categoryEmoji, isMine, playerName }: Props) {
  return (
    <div className="wheel-wrap">
      <h1 className="display" style={{ fontSize: "1.6rem" }}>
        🎯 È uscita la categoria!
      </h1>

      <div className="wheel-text-panel top5-category-panel">
        <p className="subtle">Grandioso Quiz Particolare</p>
        <p style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--gold-soft)" }}>
          {categoryEmoji} {categoryName}
        </p>
      </div>

      <p style={{ color: "var(--cream)", fontSize: "0.9rem", textAlign: "center", maxWidth: 420 }}>
        Rispondi A VOCE alle 2 domande: sarà l'host a rivelare le risposte e ad assegnare le
        monete alla fine.
      </p>

      {isMine ? (
        <button className="btn" onClick={() => socket.emit("particolare:beginGame")}>
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
