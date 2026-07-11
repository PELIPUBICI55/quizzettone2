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
  { top: "5%", left: "10%", size: 10, rot: 12, delay: 0 },
  { top: "6%", left: "42%", size: 8, rot: -25, delay: 0.5 },
  { top: "8%", left: "75%", size: 13, rot: 30, delay: 1.1 },
  { top: "16%", left: "25%", size: 9, rot: -15, delay: 1.6 },
  { top: "18%", left: "60%", size: 15, rot: 45, delay: 0.2 },
  { top: "22%", left: "90%", size: 8, rot: -35, delay: 0.9 },
  { top: "28%", left: "8%", size: 12, rot: 20, delay: 1.9 },
  { top: "30%", left: "48%", size: 9, rot: -10, delay: 0.4 },
  { top: "36%", left: "78%", size: 14, rot: 38, delay: 1.3 },
  { top: "42%", left: "20%", size: 8, rot: -28, delay: 0.7 },
  { top: "44%", left: "62%", size: 11, rot: 15, delay: 2.1 },
  { top: "50%", left: "35%", size: 9, rot: -42, delay: 0.3 },
  { top: "52%", left: "88%", size: 13, rot: 22, delay: 1.5 },
  { top: "58%", left: "12%", size: 10, rot: -18, delay: 1.0 },
  { top: "60%", left: "55%", size: 16, rot: 33, delay: 0.6 },
  { top: "66%", left: "75%", size: 8, rot: -30, delay: 1.8 },
  { top: "70%", left: "30%", size: 11, rot: 50, delay: 0.1 },
  { top: "74%", left: "68%", size: 9, rot: -20, delay: 1.2 },
  { top: "78%", left: "18%", size: 13, rot: 26, delay: 2.0 },
  { top: "82%", left: "48%", size: 8, rot: -38, delay: 0.8 },
  { top: "86%", left: "82%", size: 12, rot: 18, delay: 1.4 },
  { top: "90%", left: "32%", size: 9, rot: -24, delay: 0.5 },
  { top: "92%", left: "60%", size: 14, rot: 40, delay: 1.7 },
  { top: "94%", left: "8%", size: 8, rot: -12, delay: 2.2 },
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

      <div className="rarity-title">
        <span className="shine-text">{RARITY_TITLES[card.rarity]}</span>
      </div>

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
