import type { CardDef } from "../../shared/types";

interface Props {
  card: CardDef;
  ownedCount?: number;
  locked?: boolean;
  spent?: boolean; // possiedi la carta ma l'effetto è già stato attivato
  onUse?: () => void;
}

const RARITY_TITLES: Record<CardDef["rarity"], string> = {
  comune: "Figurina Comune",
  rara: "Figurina Rara",
  epica: "Figurina Epica",
  leggendaria: "Figurina Leggendaria",
};

export function CardView({ card, ownedCount, locked, spent, onUse }: Props) {
  return (
    <div className={`tcg-card rarity-${card.rarity}${locked ? " locked" : ""}`} title={card.effect.label}>
      {!locked && card.effect.isQuickEffect && (
        <span className="quick-badge" title="Effetto rapido: usabile in qualsiasi momento">
          ⚡
        </span>
      )}

      <div className="name">{card.name}</div>

      <div className="illustration">
        <span className="emoji">{card.emoji}</span>
      </div>

      <div className="rarity-title">{RARITY_TITLES[card.rarity]}</div>

      {!locked && (
        <div className="description">
          {card.description} <strong>{spent ? "Effetto già usato." : card.effect.label + "."}</strong>
        </div>
      )}

      {!!ownedCount && ownedCount > 1 && <span className="owned-count">×{ownedCount}</span>}

      {onUse && !locked && !spent && (
        <button
          className="btn-outline"
          style={{ fontSize: "0.7rem", padding: "0.35rem" }}
          onClick={onUse}
        >
          Attiva effetto
        </button>
      )}
    </div>
  );
}
