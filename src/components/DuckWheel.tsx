import { DUCK_CATEGORIES } from "../../shared/duckCategories";

interface Props {
  isMine: boolean;
  playerName: string;
}

// Stessa idea della ruota di Top5/Ocho: la strip gira tra le emoji delle
// vere categorie di ACCHIAPPA LA PAPERA.
const REEL_ITEMS = DUCK_CATEGORIES.map((c) => c.emoji);

export function DuckWheel({ isMine, playerName }: Props) {
  return (
    <div className="wheel-wrap">
      <h1 className="display" style={{ fontSize: "2.1rem" }}>
        🦆 Acchiappa la papera in arrivo...
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
          "Sta per uscire la tua categoria..."
        ) : (
          <>
            Categoria per <strong style={{ color: "var(--gold-soft)" }}>{playerName}</strong> in arrivo...
          </>
        )}
      </p>
    </div>
  );
}
