import type { WorldDef } from "../../shared/types";
import { socket } from "../socket";

export function WorldMap({ worlds }: { worlds: WorldDef[] }) {
  const enter = (worldId: string) => socket.emit("world:enter", { worldId });

  return (
    <div className="world-grid">
      {worlds.map((w) => (
        <button
          key={w.id}
          className="world-card"
          style={{
            background: `linear-gradient(160deg, ${w.colorFrom}, ${w.colorTo})`,
          }}
          onClick={() => enter(w.id)}
        >
          <div className="emoji">{w.emoji}</div>
          <div className="name">{w.name}</div>
          <div className="tagline">{w.tagline}</div>
        </button>
      ))}
    </div>
  );
}
