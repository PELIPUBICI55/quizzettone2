import type { CardDef, GameStateSnapshot, PackDef } from "../../shared/types";
import { CardView } from "../components/CardView";
import { WorldMap } from "../components/WorldMap";
import { socket } from "../socket";

interface Props {
  state: GameStateSnapshot;
}

function PackTile({ pack, canAfford }: { pack: PackDef; canAfford: boolean }) {
  return (
    <div className="panel pack-card">
      <div className="display" style={{ fontSize: "1.3rem" }}>
        {pack.name}
      </div>
      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", flex: 1 }}>
        {pack.description}
      </p>
      <p style={{ fontSize: "0.8rem" }}>
        {pack.cardCount} carta{pack.cardCount > 1 ? "e" : ""}
      </p>
      <button
        className="btn"
        disabled={!canAfford}
        onClick={() => socket.emit("shop:buyPack", { packId: pack.id })}
      >
        Compra — 🪙 {pack.cost}
      </button>
    </div>
  );
}

export function Cittadella({ state }: Props) {
  const ownedCounts = new Map<string, number>();
  const availableCounts = new Map<string, number>();
  for (const owned of state.me.collection) {
    ownedCounts.set(owned.cardId, (ownedCounts.get(owned.cardId) ?? 0) + 1);
    if (!owned.used) {
      availableCounts.set(owned.cardId, (availableCounts.get(owned.cardId) ?? 0) + 1);
    }
  }

  return (
    <div>
      <h2 className="section-title">🏰 La Cittadella</h2>
      <p style={{ color: "var(--text-muted)" }}>
        Compra pacchetti dal Mercante e completa la tua collezione. Vai negli
        altri mondi per guadagnare monete.
      </p>

      <h3 className="section-title">Il Mercante</h3>
      <div className="pack-row">
        {state.packs.map((p) => (
          <PackTile key={p.id} pack={p} canAfford={state.me.coins >= p.cost} />
        ))}
      </div>

      <h3 className="section-title">Parti per un mondo</h3>
      <WorldMap worlds={state.worlds} />

      <h3 className="section-title">
        La tua collezione ({[...ownedCounts.keys()].length}/{state.cardCatalog.length})
      </h3>
      <div className="card-grid">
        {state.cardCatalog.map((card: CardDef) => {
          const owned = ownedCounts.get(card.id) ?? 0;
          const available = availableCounts.get(card.id) ?? 0;
          return (
            <CardView
              key={card.id}
              card={card}
              ownedCount={owned}
              locked={owned === 0}
              spent={owned > 0 && available === 0}
            />
          );
        })}
      </div>

      {state.players.length > 1 && (
        <>
          <h3 className="section-title">Nella partita</h3>
          <div className="player-list">
            {state.players.map((p) => (
              <span key={p.id} className={`player-chip${p.isHost ? " host" : ""}`}>
                {p.name} · 🪙{p.coins} · 🎴{p.cardCount}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
