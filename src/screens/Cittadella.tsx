import type { GameStateSnapshot, PackDef } from "../../shared/types";
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
  return (
    <div>
      <h2 className="section-title">🏰 La Cittadella</h2>
      <p style={{ color: "var(--text-muted)" }}>
        Sei arrivato al Mercante. Spendi le tue monete per aprire pacchetti di
        figurine prima di ripartire.
      </p>

      <div className="pack-row">
        {state.packs.map((p) => (
          <PackTile key={p.id} pack={p} canAfford={state.me.coins >= p.cost} />
        ))}
      </div>

      <button
        className="btn-outline"
        style={{ marginTop: "1.5rem" }}
        onClick={() => socket.emit("shop:leave")}
      >
        ✓ Lascia la Cittadella
      </button>
    </div>
  );
}
