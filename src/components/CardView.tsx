import type { CardDef } from "../../shared/types";

interface Props {
  card: CardDef;
  ownedCount?: number;
  locked?: boolean;
  spent?: boolean; // possiedi la carta ma l'effetto è già stato attivato
  onUse?: () => void;
  onClick?: () => void;
}

const RARITY_TITLES: Record<CardDef["rarity"], string> = {
  comune: "Figurina Comune",
  rara: "Figurina Rara",
  epica: "Figurina Epica",
  leggendaria: "Figurina Leggendaria",
};

// posizioni fisse dei prismi di luce (solo figurine leggendarie), per non
// farli "saltare" in giro ad ogni nuovo render
const PRISM_SPOTS = [
  { top: "8%", left: "14%", size: 11, rot: 12, delay: 0 },
  { top: "14%", left: "68%", size: 15, rot: -18, delay: 0.3 },
  { top: "28%", left: "38%", size: 9, rot: 40, delay: 0.9 },
  { top: "40%", left: "82%", size: 13, rot: -8, delay: 1.4 },
  { top: "48%", left: "18%", size: 12, rot: 28, delay: 0.6 },
  { top: "58%", left: "58%", size: 17, rot: -32, delay: 1.8 },
  { top: "70%", left: "30%", size: 10, rot: 55, delay: 1.1 },
  { top: "78%", left: "72%", size: 12, rot: -22, delay: 2.1 },
  { top: "88%", left: "48%", size: 9, rot: 18, delay: 0.4 },
];

export function CardView({ card, ownedCount, locked, spent, onUse, onClick }: Props) {
  const showPrisms = !locked && card.rarity === "leggendaria";

  return (
    <div
      className={`tcg-card rarity-${card.rarity}${locked ? " locked" : ""}`}
      title={card.effect.label}
      onClick={onClick}
    >
      {showPrisms &&
        PRISM_SPOTS.map((s, i) => (
          <span
            key={i}
            className="prism"
            style={{
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              animationDelay: `${s.delay}s`,
              // @ts-expect-error -- proprietà CSS custom
              "--prism-rot": `${s.rot}deg`,
            }}
          />
        ))}

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
          className="btn-outline use-btn"
          style={{ fontSize: "0.7rem", padding: "0.35rem" }}
          onClick={(e) => {
            e.stopPropagation();
            onUse();
          }}
        >
          Attiva effetto
        </button>
      )}
    </div>
  );
}
