import type { CardDef } from "../../shared/types";

interface Props {
  card: CardDef;
  ownedCount?: number;
  locked?: boolean;
  spent?: boolean; // possiedi la carta ma l'effetto è già stato attivato
  onUse?: () => void;
}

export function CardView({ card, ownedCount, locked, spent, onUse }: Props) {
  return (
    <div
      className={`tcg-card${locked ? " locked" : ""}`}
      title={card.effect.label}
    >
      <span className="rarity">{card.rarity}</span>
      <div className="emoji">{card.emoji}</div>
      <div>
        <div className="name">{card.name}</div>
        {!locked && (
          <div className="effect">
            {spent ? "Effetto già usato" : card.effect.label}
          </div>
        )}
      </div>
      {!!ownedCount && ownedCount > 1 && (
        <span className="owned-count">×{ownedCount}</span>
      )}
      {onUse && !locked && !spent && (
        <button
          className="btn-outline"
          style={{ marginTop: "0.5rem", fontSize: "0.75rem", padding: "0.4rem" }}
          onClick={onUse}
        >
          Attiva effetto
        </button>
      )}
    </div>
  );
}
