import { useState } from "react";
import type { CardDef, GameStateSnapshot } from "../../shared/types";
import { CardView } from "./CardView";
import { CardZoomModal } from "./CardZoomModal";

interface Props {
  state: GameStateSnapshot;
}

export function FullCollectionMenu({ state }: Props) {
  const [open, setOpen] = useState(false);
  const [zoomedCard, setZoomedCard] = useState<CardDef | null>(null);

  const ownedCounts = new Map<string, number>();
  for (const owned of state.me.collection) {
    ownedCounts.set(owned.cardId, (ownedCounts.get(owned.cardId) ?? 0) + 1);
  }

  const total = state.cardCatalog.length;
  const foundCount = state.cardCatalog.filter((c) => ownedCounts.has(c.id)).length;

  return (
    <div style={{ position: "relative" }}>
      <button className="btn-outline" onClick={() => setOpen((o) => !o)}>
        📖 Collezione completa ({foundCount}/{total})
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 59 }} />
          <div
            className="panel"
            style={{
              position: "absolute",
              top: "calc(100% + 0.5rem)",
              right: 0,
              zIndex: 60,
              width: "min(90vw, 460px)",
              maxHeight: "70vh",
              overflowY: "auto",
            }}
          >
            <h3 style={{ marginTop: 0 }}>
              Collezione completa — {foundCount}/{total}
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "-0.5rem" }}>
              Le figurine che ti mancano sono oscurate.
            </p>
            <div className="card-grid">
              {state.cardCatalog.map((card) => {
                const locked = !ownedCounts.has(card.id);
                return (
                  <CardView
                    key={card.id}
                    card={card}
                    ownedCount={ownedCounts.get(card.id) ?? 0}
                    locked={locked}
                    onClick={() => setZoomedCard(card)}
                  />
                );
              })}
            </div>
          </div>
        </>
      )}

      {zoomedCard && (
        <CardZoomModal
          card={zoomedCard}
          ownedCount={ownedCounts.get(zoomedCard.id) ?? 0}
          locked={!ownedCounts.has(zoomedCard.id)}
          onClose={() => setZoomedCard(null)}
        />
      )}
    </div>
  );
}
