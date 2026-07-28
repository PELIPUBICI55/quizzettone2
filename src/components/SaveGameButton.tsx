import type { GameStateSnapshot } from "../../shared/types";
import { socket } from "../socket";

interface Props {
  state: GameStateSnapshot;
}

// Salva la partita: solo l'host può premerlo (vedi anche il controllo lato
// server in GameSession.saveGame, che ignora la richiesta se non arriva
// dall'host). Qualsiasi minigioco in corso per qualunque giocatore viene
// annullato (si torna tutti sulla mappa, pronti per il turno successivo),
// ma nessun progresso permanente va perso.
//
// Il salvataggio viene anche scritto su disco lato server, ma è solo un
// backup: molti hosting (es. Render piano free) hanno un disco NON
// persistente, che si svuota ad ogni riavvio del server. La copia
// affidabile è quindi il file .json che scarichiamo qui sul dispositivo di
// chi salva: per riprendere la partita in futuro basta ricaricarlo dalla
// schermata iniziale ("Carica partita salvata", vedi JoinScreen.tsx).
export function SaveGameButton({ state }: Props) {
  if (!state.me.isHost) return null;

  const handleClick = () => {
    if (
      !confirm(
        "Salvare la partita? Qualsiasi minigioco in corso verrà annullato (si torna tutti sulla mappa), ma monete, figurine e progressi restano intatti. Verrà scaricato un file: conservalo, servirà per riprendere la partita più tardi."
      )
    ) {
      return;
    }
    socket.emit("game:save", (res) => {
      if (!res.ok) {
        alert(res.error ?? "Impossibile salvare la partita.");
        return;
      }
      const json = JSON.stringify(res.data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
      const a = document.createElement("a");
      a.href = url;
      a.download = `quizzettone-${state.code}-${stamp}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <button className="btn-outline" onClick={handleClick} title="Salva la partita per riprenderla più tardi">
      💾 Salva
    </button>
  );
}
