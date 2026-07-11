import { useState } from "react";
import type { GameStateSnapshot } from "../../shared/types";
import { CardView } from "./CardView";

interface Props {
  state: GameStateSnapshot;
}

export function FullCollectionMenu({ state }: Props) {
  const [open, setOpen] = useState(false);

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
              {state.cardCatalog.map((card) => (
                <CardView
                  key={card.id}
                  card={card}
                  ownedCount={ownedCounts.get(card.id) ?? 0}
                  locked={!ownedCounts.has(card.id)}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
