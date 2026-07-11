import type { GameStateSnapshot, PackDef } from "../../shared/types";
import { socket } from "../socket";

interface Props {
  state: GameStateSnapshot;
}

function PackTile({
  pack,
  canAfford,
  freeAvailable,
}: {
  pack: PackDef;
  canAfford: boolean;
  freeAvailable: number;
}) {
  const isFree = freeAvailable > 0;

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
          🎁 Hai {freeAvailable}{" "}
          {pack.id === "pack-medio"
            ? `baul${freeAvailable > 1 ? "i" : "e"}`
            : `pacchett${freeAvailable > 1 ? "i" : "o"}`}{" "}
          gratis disponibil{freeAvailable > 1 ? "i" : "e"}!
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
  const freeChestsAvailable = state.me.statuses.filter((s) => s.type === "freeChest").length;

  const freeAvailableFor = (packId: string) => {
    if (packId === "pack-base") return freePacksAvailable;
    if (packId === "pack-medio") return freeChestsAvailable;
    return 0;
  };

  return (
    <div>
      <h2 className="section-title">🏰 La Cittadella</h2>
      <p style={{ color: "var(--text-muted)" }}>
        Sei arrivato al Mercante. Spendi le tue monete per aprire pacchetti di
        figurine prima di ripartire.
      </p>

      <div className="pack-row">
        {state.packs.map((p) => {
          const freeAvailable = freeAvailableFor(p.id);
          return (
            <PackTile
              key={p.id}
              pack={p}
              canAfford={freeAvailable > 0 || state.me.coins >= p.cost}
              freeAvailable={freeAvailable}
            />
          );
        })}
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
