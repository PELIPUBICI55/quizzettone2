import type { GameStateSnapshot } from "../../shared/types";
import { socket } from "../socket";

interface Props {
  state: GameStateSnapshot;
}

// Salva la partita su disco lato server: solo l'host può premerlo (vedi
// anche il controllo lato server in GameSession.saveGame, che ignora la
// richiesta se non arriva dall'host). Qualsiasi minigioco in corso per
// qualunque giocatore viene annullato (si torna tutti sulla mappa, pronti
// per il turno successivo), ma nessun progresso permanente va perso. La
// partita può poi essere ripresa in futuro ricollegandosi con lo stesso
// codice stanza.
export function SaveGameButton({ state }: Props) {
  if (!state.me.isHost) return null;

  const handleClick = () => {
    if (
      confirm(
        "Salvare la partita? Qualsiasi minigioco in corso verrà annullato (si torna tutti sulla mappa), ma monete, figurine e progressi restano intatti. Potrete riprenderla in futuro con lo stesso codice stanza."
      )
    ) {
      socket.emit("game:save");
    }
  };

  return (
    <button className="btn-outline" onClick={handleClick} title="Salva la partita per riprenderla più tardi">
      💾 Salva
    </button>
  );
}
