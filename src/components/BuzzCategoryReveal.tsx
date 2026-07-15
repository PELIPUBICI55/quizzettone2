import { socket } from "../socket";

interface Props {
  categoryName: string;
  categoryEmoji: string;
  isHost: boolean;
}

// A differenza di ParticolareCategoryReveal, qui non è il giocatore di turno
// a confermare "Ok iniziamo": è l'host, dato che il round coinvolge tutta la
// sala e non un singolo giocatore.
export function BuzzCategoryReveal({ categoryName, categoryEmoji, isHost }: Props) {
  return (
    <div className="wheel-wrap">
      <h1 className="display" style={{ fontSize: "1.6rem" }}>
        🎯 È uscita la categoria!
      </h1>

      <div className="wheel-text-panel top5-category-panel">
        <p className="subtle">Il Grandioso Buzz</p>
        <p style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--gold-soft)" }}>
          {categoryEmoji} {categoryName}
        </p>
      </div>

      <p style={{ color: "var(--cream)", fontSize: "0.9rem", textAlign: "center", maxWidth: 420 }}>
        Appena l'host avvia la domanda, chi pensa di sapere la risposta prema il buzzer: risponde
        a voce chi arriva primo. Vale 100 monete, decise dall'host.
      </p>

      {isHost ? (
        <button className="btn" onClick={() => socket.emit("buzz:beginGame")}>
          Via!
        </button>
      ) : (
        <p style={{ color: "var(--cream)", fontSize: "1rem" }}>In attesa che l'host avvii la domanda…</p>
      )}
    </div>
  );
}
