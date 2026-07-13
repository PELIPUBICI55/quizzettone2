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

// Descrizione mostrata all'arrivo su ogni mondo, specifica per la sua
// meccanica dedicata (se ne ha una). I mondi senza ancora una meccanica
// propria (foresta, ghiacciaia, cieli, rovine) restano sul testo generico
// del quiz a risposta multipla.
function worldDescription(worldId: string | undefined): string {
  switch (worldId) {
    case "vulcano":
      return (
        "Qui si gioca a Top 5: la ruota estrae una categoria e una classifica top 5 al suo " +
        "interno. Il giocatore di turno deve indovinare a voce le 5 posizioni: l'host rivela " +
        "ogni risposta corretta e segna gli errori, poi decreta se la prova è vinta o persa."
      );
    case "officina":
      return (
        "Qui si gioca a Caro amico ti scrivo: prima scegli quale persona della ruota sei tu " +
        "stesso (così non ti capiterà mai in sorte), poi verrà estratta una persona diversa e " +
        "una domanda personale a cui il giocatore di turno deve rispondere a voce indovinando " +
        "cosa risponderebbe quella persona."
      );
    case "deserto":
      return (
        "Qui si gioca a Ocho alla bomba: la ruota estrae una categoria e un gioco al suo " +
        "interno con 9 risposte possibili, una delle quali è la bomba. Il giocatore di turno " +
        "seleziona le risposte una alla volta cercando di evitarla: se la trova, o resta solo " +
        "lei da scegliere, il gioco si ferma e l'host assegna 0, 50 o 100 monete."
      );
    default:
      return (
        "Una ruota deciderà la prova da affrontare qui: rispondi correttamente entro il tempo " +
        "limite per guadagnare monete da spendere alla Cittadella."
      );
  }
}
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
        ) : isTct ? (
          <p>
            Qui si gioca a Il tuffo nell'abisso: tutti i giocatori connessi con almeno 100 monete
            vengono automaticamente iscritti (la quota forma il montepremi) e si sfidano su 4
            domande a tempo. Chi risponde correttamente più in fretta guadagna più punti: alla
            fine il montepremi va a chi ne ha totalizzati di più.
          </p>
        ) : (
          <p>{worldDescription(world?.id)}</p>
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
