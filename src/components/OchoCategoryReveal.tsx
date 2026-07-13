import { socket } from "../socket";

interface Props {
  categoryName: string;
  categoryEmoji: string;
  isMine: boolean;
  playerName: string;
}

export function OchoCategoryReveal({ categoryName, categoryEmoji, isMine, playerName }: Props) {
  return (
    <div className="wheel-wrap">
      <h1 className="display" style={{ fontSize: "1.6rem" }}>
        🎯 È uscita la categoria!
      </h1>

      <div className="wheel-text-panel top5-category-panel">
        <p className="subtle">Ocho alla bomba</p>
        <p style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--gold-soft)" }}>
          {categoryEmoji} {categoryName}
        </p>
      </div>

      {isMine ? (
        <>
          <p style={{ color: "var(--cream)", fontSize: "0.95rem", maxWidth: 420, textAlign: "center" }}>
            Dovrai selezionare le risposte una alla volta, evitando quella "scossa": occhio alla
            bomba!
          </p>
          <button className="btn" onClick={() => socket.emit("ocho:beginGame")}>
            Ok, iniziamo!
          </button>
        </>
      ) : (
        <p style={{ color: "var(--cream)", fontSize: "1rem" }}>
          In attesa che <strong style={{ color: "var(--gold-soft)" }}>{playerName}</strong> sia
          pronto…
        </p>
      )}
    </div>
  );
}
