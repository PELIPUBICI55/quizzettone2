import type { PlayerSummary, WorldDef } from "../../shared/types";
import { socket } from "../socket";

interface Props {
  world: WorldDef | undefined;
  isMine: boolean;
  playerName: string;
  players: PlayerSummary[];
}

// Deve restare allineata alla soglia TCT_ENTRY_FEE lato server
// (server/game/GameSession.ts): serve solo per decidere se mostrare qui il
// tasto "Skippa gioco" prima ancora di tentare di avviare il minigioco.
const TCT_ENTRY_FEE = 100;

export function WelcomeScreen({ world, isMine, playerName, players }: Props) {
  const isTct = world?.id === "abisso";
  const qualifyingCount = players.filter((p) => p.connected && p.coins >= TCT_ENTRY_FEE).length;
  const tctNotEnoughPlayers = isTct && qualifyingCount < 2;

  return (
    <div className="wheel-wrap">
      <h1 className="display" style={{ fontSize: "2.4rem" }}>
        {world?.emoji ?? "🌍"} {world?.name ?? "Mondo sconosciuto"}
      </h1>
      <div className="wheel-text-panel">
        <p className="subtle">{world?.tagline ?? ""}</p>
        {tctNotEnoughPlayers ? (
          <p>
            Servono almeno due giocatori connessi con 100 monete per tuffarsi nell'abisso: al
            momento non ci sono abbastanza sfidanti, quindi questa prova va saltata.
          </p>
        ) : (
          <p>
            Una ruota deciderà la prova da affrontare qui: rispondi correttamente entro il tempo
            limite per guadagnare monete da spendere alla Cittadella.
          </p>
        )}
      </div>

      {isMine ? (
        tctNotEnoughPlayers ? (
          <button className="btn-outline" onClick={() => socket.emit("board:beginMinigame")}>
            Skippa gioco
          </button>
        ) : (
          <button className="btn" onClick={() => socket.emit("board:beginMinigame")}>
            Ok, iniziamo!
          </button>
        )
      ) : (
        <p style={{ color: "var(--cream)", fontSize: "1rem" }}>
          In attesa che <strong style={{ color: "var(--gold-soft)" }}>{playerName}</strong> sia
          pronto…
        </p>
      )}
    </div>
  );
}
