import { CARO_AMICO_PERSONE } from "../../shared/caroAmicoPersone";

interface Props {
  isMine: boolean;
  playerName: string;
}

// La strip gira tra le emoji delle vere persone: quando ne arriveranno di
// nuove compariranno automaticamente qui.
const REEL_ITEMS = CARO_AMICO_PERSONE.map((p) => p.emoji);

export function CaroAmicoWheel({ isMine, playerName }: Props) {
  return (
    <div className="wheel-wrap">
      <h1 className="display" style={{ fontSize: "2.1rem" }}>
        🎰 Sta per uscire una persona...
      </h1>

      <div className="top5-reel-frame">
        <div className="top5-reel-strip">
          {[...REEL_ITEMS, ...REEL_ITEMS, ...REEL_ITEMS].map((item, i) => (
            <div className="top5-reel-item" key={i}>
              {item}
            </div>
          ))}
        </div>
        <div className="top5-reel-shade" />
      </div>

      <p style={{ color: "var(--cream)" }}>
        {isMine ? (
          "Sta per uscire la persona a cui dovrai rispondere..."
        ) : (
          <>
            Persona per <strong style={{ color: "var(--gold-soft)" }}>{playerName}</strong> in
            arrivo...
          </>
        )}
      </p>
    </div>
  );
}
