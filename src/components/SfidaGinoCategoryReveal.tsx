import { socket } from "../socket";

interface Props {
  categoryName: string;
  categoryEmoji: string;
  isMine: boolean;
  playerName: string;
}

export function SfidaGinoCategoryReveal({ categoryName, categoryEmoji, isMine, playerName }: Props) {
  return (
    <div className="wheel-wrap">
      <h1 className="display" style={{ fontSize: "1.6rem" }}>
        🎯 È uscita la categoria!
      </h1>

      <div className="wheel-text-panel top5-category-panel">
        <p className="subtle">Sfida Gino</p>
        <p style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--gold-soft)" }}>
          {categoryEmoji} {categoryName}
        </p>
      </div>

      <p style={{ color: "var(--cream)", fontSize: "0.9rem", textAlign: "center", maxWidth: 420 }}>
        Rispondi A VOCE: sarà l'host a svelare la risposta e ad assegnare 2000 monete, oppure 0.
      </p>

      {isMine ? (
        <button className="btn" onClick={() => socket.emit("sfidaGino:beginGame")}>
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
