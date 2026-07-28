import type { PlayerSummary, WorldDef } from "../../shared/types";
import { socket } from "../socket";

interface Props {
  world: WorldDef | undefined;
  isMine: boolean;
  playerName: string;
  turnPlayerId: string | undefined;
  players: PlayerSummary[];
}

// Descrizione mostrata all'arrivo su ogni mondo, specifica per la sua
// meccanica dedicata (se ne ha una). I mondi senza ancora una meccanica
// propria (cieli, rovine) restano sul testo generico del quiz a risposta
// multipla.
function worldDescription(worldId: string | undefined): string {
  switch (worldId) {
    case "vulcano":
      return (
        "Benvenuto"
      );
    case "officina":
      return (
        "Benvenuto"
      );
    case "deserto":
      return (
        "Benvenuto"
      );
    case "ghiacciaia":
      return (
        "Benvenuto"
      );
    case "foresta":
      return (
        "Benvenuto"
      );
    case "cieli":
      return (
        "Benvenuto"
      );
    case "rovine":
      return (
        "Benvenuto"
      );
    default:
      return (
        "Benvenuto"
      );
  }
}
export function WelcomeScreen({ world, isMine, playerName }: Props) {
  const isTct = world?.id === "abisso";

  return (
    <div className="wheel-wrap">
      <h1 className="display" style={{ fontSize: "2.4rem" }}>
        {world?.emoji ?? "🌍"} {world?.name ?? "Mondo sconosciuto"}
      </h1>
      <div className="wheel-text-panel">
        <p className="subtle">{world?.tagline ?? ""}</p>
        {isTct ? (
          <p>
            Qui si gioca a Il tuffo nell'abisso: partecipano SEMPRE tutti i giocatori connessi, a
            prescindere da quante monete hanno. Il montepremi si forma togliendo fino a 100 monete
            a testa (chi ne ha meno versa solo quel che ha); se il totale raccolto non arriva
            comunque a 100, il montepremi viene comunque portato a 100. Poi ci si sfida su 4 domande
            a tempo: chi risponde correttamente più in fretta guadagna più punti, e alla fine il
            montepremi va a chi ne ha totalizzati di più.
          </p>
        ) : (
          <p>{worldDescription(world?.id)}</p>
        )}
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
