import { useState } from "react";
import type { CardDef, GameStateSnapshot } from "../../shared/types";
import { CardView } from "./CardView";
import { CardZoomModal } from "./CardZoomModal";

interface Props {
  state: GameStateSnapshot;
}

// Usato solo nelle schermate di fine partita (sia per esaurimento mondi, sia
// per collezione completata): mostra l'intero catalogo delle figurine,
// incluse quelle mai trovate e la 26esima segreta, completamente sbloccato
// per qualsiasi giocatore. A partita finita non ha più senso nascondere
// nulla: è il "reveal" completo della collezione.
export function RevealedCollectionMenu({ state }: Props) {
  const [open, setOpen] = useState(false);
  const [zoomedCard, setZoomedCard] = useState<CardDef | null>(null);

  const ownedCounts = new Map<string, number>();
  for (const owned of state.me.collection) {
    ownedCounts.set(owned.cardId, (ownedCounts.get(owned.cardId) ?? 0) + 1);
  }

  const total = state.cardCatalog.length;

  return (
    <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
      <button className="btn-outline" onClick={() => setOpen((o) => !o)}>
        🎴 Svela la collezione completa ({total})
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 59 }} />
          <div
            className="panel"
            style={{
              position: "absolute",
              top: "calc(100% + 0.5rem)",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 60,
              width: "min(90vw, 460px)",
              maxHeight: "70vh",
              overflowY: "auto",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Tutte le figurine — {total}</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "-0.5rem" }}>
              La partita è finita: ecco l'intera collezione, segreta compresa.
            </p>
            <div className="card-grid">
              {state.cardCatalog.map((card) => (
                <CardView
                  key={card.id}
                  card={card}
                  ownedCount={ownedCounts.get(card.id) ?? 0}
                  locked={false}
                  onClick={() => setZoomedCard(card)}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {zoomedCard && (
        <CardZoomModal
          card={zoomedCard}
          ownedCount={ownedCounts.get(zoomedCard.id) ?? 0}
          locked={false}
          onClose={() => setZoomedCard(null)}
        />
      )}
    </div>
  );
}
