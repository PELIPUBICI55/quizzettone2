import { useState } from "react";
import type { GameStateSnapshot } from "../../shared/types";
import { CardView } from "./CardView";

interface Props {
  state: GameStateSnapshot;
}

export function CollectionMenu({ state }: Props) {
  const [open, setOpen] = useState(false);

  const ownedCounts = new Map<string, number>();
  const availableCounts = new Map<string, number>();
  for (const owned of state.me.collection) {
    ownedCounts.set(owned.cardId, (ownedCounts.get(owned.cardId) ?? 0) + 1);
    if (!owned.used) {
      availableCounts.set(owned.cardId, (availableCounts.get(owned.cardId) ?? 0) + 1);
    }
  }

  const foundCards = state.cardCatalog.filter((c) => ownedCounts.has(c.id));

  return (
    <div style={{ position: "relative" }}>
      <button className="btn-outline" onClick={() => setOpen((o) => !o)}>
        🎴 La tua collezione ({foundCards.length})
      </button>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 59 }}
          />
          <div
            className="panel"
            style={{
              position: "absolute",
              top: "calc(100% + 0.5rem)",
              right: 0,
              zIndex: 60,
              width: "min(90vw, 420px)",
              maxHeight: "70vh",
              overflowY: "auto",
            }}
          >
            <h3 style={{ marginTop: 0 }}>La tua collezione</h3>
            {foundCards.length === 0 ? (
              <p style={{ color: "var(--text-muted)" }}>
                Non hai ancora trovato nessuna figurina. Vai alla Cittadella per
                comprare un pacchetto!
              </p>
            ) : (
              <div className="card-grid">
                {foundCards.map((card) => (
                  <CardView
                    key={card.id}
                    card={card}
                    ownedCount={ownedCounts.get(card.id) ?? 0}
                    spent={(availableCounts.get(card.id) ?? 0) === 0}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
