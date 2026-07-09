import type { WorldDef } from "../../shared/types";
import { socket } from "../socket";

interface Props {
  world: WorldDef | undefined;
  isMine: boolean;
  playerName: string;
}

export function WelcomeScreen({ world, isMine, playerName }: Props) {
  return (
    <div className="wheel-wrap">
      <h1 className="display" style={{ fontSize: "2.4rem" }}>
        {world?.emoji ?? "🌍"} {world?.name ?? "Mondo sconosciuto"}
      </h1>
      <div className="wheel-text-panel">
        <p className="subtle">{world?.tagline ?? ""}</p>
        <p>
          Una ruota deciderà la prova da affrontare qui: rispondi correttamente entro il tempo
          limite per guadagnare monete da spendere alla Cittadella.
        </p>
      </div>

      {isMine ? (
        <button className="btn" onClick={() => socket.emit("board:beginMinigame")}>
          Ok, iniziamo!
        </button>
      ) : (
        <p style={{ color: "var(--cream)", fontSize: "1rem" }}>
          In attesa che <strong style={{ color: "var(--gold-soft)" }}>{playerName}</strong> sia
          pronto…
        </p>
      )}
    </div>
  );
}
