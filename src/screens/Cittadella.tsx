import type { GameStateSnapshot, PackDef } from "../../shared/types";
import { socket } from "../socket";

interface Props {
  state: GameStateSnapshot;
}

function PackTile({
  pack,
  canAfford,
  freePacksAvailable,
}: {
  pack: PackDef;
  canAfford: boolean;
  freePacksAvailable: number;
}) {
  const isFree = pack.id === "pack-base" && freePacksAvailable > 0;

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
      {isFree && (
        <p style={{ fontSize: "0.75rem", color: "var(--gold-soft)", fontWeight: 700 }}>
          🎁 Hai {freePacksAvailable} pacchetto{freePacksAvailable > 1 ? "i" : ""} gratis disponibil
          {freePacksAvailable > 1 ? "i" : "e"}!
        </p>
      )}
      <button
        className="btn"
        disabled={!canAfford}
        onClick={() => socket.emit("shop:buyPack", { packId: pack.id })}
      >
        {isFree ? "Compra — GRATIS 🎁" : `Compra — 🪙 ${pack.cost}`}
      </button>
    </div>
  );
}

export function Cittadella({ state }: Props) {
  const freePacksAvailable = state.me.statuses.filter((s) => s.type === "freePack").length;

  return (
    <div>
      <h2 className="section-title">🏰 La Cittadella</h2>
      <p style={{ color: "var(--text-muted)" }}>
        Sei arrivato al Mercante. Spendi le tue monete per aprire pacchetti di
        figurine prima di ripartire.
      </p>

      <div className="pack-row">
        {state.packs.map((p) => (
          <PackTile
            key={p.id}
            pack={p}
            canAfford={
              (p.id === "pack-base" && freePacksAvailable > 0) || state.me.coins >= p.cost
            }
            freePacksAvailable={freePacksAvailable}
          />
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
