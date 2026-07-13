import type { PlayerSummary, WorldDef } from "../../shared/types";
import { socket } from "../socket";

interface Props {
  world: WorldDef | undefined;
  isMine: boolean;
  playerName: string;
  turnPlayerId: string | undefined;
  players: PlayerSummary[];
}

// Deve restare allineata alla soglia TCT_ENTRY_FEE lato server
// (server/game/GameSession.ts): serve solo per decidere se mostrare qui il
// tasto "Skippa gioco" prima ancora di tentare di avviare il minigioco.
const TCT_ENTRY_FEE = 100;

export function WelcomeScreen({ world, isMine, playerName, turnPlayerId, players }: Props) {
  const isTct = world?.id === "abisso";

  // La condizione NON è "esistono almeno due giocatori qualsiasi con 100
  // monete": è il giocatore di turno stesso che deve averne almeno 100, più
  // almeno un altro giocatore connesso che gli faccia da sfidante. Deve
  // restare allineata a beginTct() in server/game/GameSession.ts.
  const turnPlayer = players.find((p) => p.id === turnPlayerId);
  const turnPlayerQualifies = !!turnPlayer && turnPlayer.connected && turnPlayer.coins >= TCT_ENTRY_FEE;
  const otherQualifyingCount = players.filter(
    (p) => p.id !== turnPlayerId && p.connected && p.coins >= TCT_ENTRY_FEE
  ).length;
  const tctNotEnoughPlayers = isTct && (!turnPlayerQualifies || otherQualifyingCount < 1);

  const skipGame = () => {
    socket.emit("board:beginMinigame");
  };

  return (
    <div className="wheel-wrap">
      <h1 className="display" style={{ fontSize: "2.4rem" }}>
        {world?.emoji ?? "🌍"} {world?.name ?? "Mondo sconosciuto"}
      </h1>
      <div className="wheel-text-panel">
        <p className="subtle">{world?.tagline ?? ""}</p>
        {tctNotEnoughPlayers ? (
          <p>
            Servono almeno due giocatori connessi con 100 monete per tuffarsi nell'abisso (tra cui
            il giocatore di turno): al momento non ci sono abbastanza sfidanti, quindi questa prova
            va saltata.
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
          <button className="btn-outline" onClick={skipGame}>
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
