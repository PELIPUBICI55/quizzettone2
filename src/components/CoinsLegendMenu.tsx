import { useState } from "react";
import type { GameStateSnapshot } from "../../shared/types";

interface Props {
  state: GameStateSnapshot;
}

// Testi statici, non arrivano dal server: descrivono a parole come si
// guadagnano le monete in ciascun mondo. Se le regole/importi di un
// minigioco cambiano lato server (vedi le costanti in GameSession.ts:
// BASE_REWARD, TOP5_REWARD, CARO_AMICO_REWARD, OCHO_VALID_REWARDS,
// PARTICOLARE_VALID_REWARDS, BUZZ_REWARD, SFIDA_GINO_VALID_REWARDS,
// SFIDA_GINO_ROUND_COUNT, TCT_ENTRY_FEE/TCT_QUESTION_COUNT, i premi della
// griglia di ACCHIAPPA LA PAPERA in server/data/duck.ts), va aggiornato
// anche questo testo a mano.
const WORLD_REWARD_INFO: Record<string, string> = {
  vulcano:
    "Indovina 5 elementi di una classifica (al massimo 3 errori concessi). Vittoria: 100 monete. Sconfitta: 0.",
  abisso:
    "Torneo a punti tra tutti i partecipanti con almeno 100 monete: si paga un ingresso di 100 monete per entrare nel montepremi. 4 domande, punti a chi risponde correttamente più in fretta. Chi totalizza più punti si prende l'intero montepremi (diviso in caso di parità); gli altri non riprendono nulla dell'ingresso pagato.",
  foresta:
    "Rispondi a voce a 2 domande. L'host assegna 0, 50 o 100 monete in base a quante ne indovini.",
  deserto:
    "Scopri le caselle di una griglia 3×3 evitando la bomba nascosta. L'host assegna 0, 50 o 100 monete in base a quante caselle sicure hai scoperto.",
  ghiacciaia:
    "Quiz automatico: serve arrivare a 3 risposte corrette prima di sbagliarne 2. Se ti qualifichi, scegli una casella su una griglia di 9 premi nascosti (40, 40, 50, 50, 50, 50, 100, 100 o 500 monete). Se fallisci il quiz: 0.",
  cieli:
    "Una sola domanda per tutta la sala: chi preme il buzzer e risponde correttamente per primo vince 100 monete. Tutti gli altri: 0.",
  rovine:
    "Rispondi a voce al meglio di 6 domande della stessa categoria (capitali o bandiere). L'host assegna 0, 150 o 2000 monete in base a quante ne indovini: tre soglie fisse, nessuna via di mezzo.",
  officina:
    "Rispondi a una domanda su un'altra persona del gruppo. Vittoria: 80 monete. Sconfitta: 0.",
};

export function CoinsLegendMenu({ state }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <button className="btn-outline" onClick={() => setOpen((o) => !o)}>
        🪙 Legenda monete
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 59 }} />
          <div
            className="panel"
            style={{
              position: "absolute",
              top: "calc(100% + 0.5rem)",
              right: 0,
              zIndex: 60,
              width: "min(92vw, 420px)",
              maxHeight: "70vh",
              overflowY: "auto",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Quante monete si guadagnano</h3>

            <div
              className="panel"
              style={{ padding: "0.6rem 0.8rem", marginBottom: "0.6rem" }}
            >
              <div style={{ fontWeight: 700, marginBottom: "0.2rem" }}>❓ Casella semplice</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Domanda a risposta multipla. Corretta: 20 monete. Sbagliata: 0.
              </div>
            </div>

            {state.worlds.map((w) => (
              <div
                key={w.id}
                className="panel"
                style={{ padding: "0.6rem 0.8rem", marginBottom: "0.6rem" }}
              >
                <div style={{ fontWeight: 700, marginBottom: "0.2rem" }}>
                  {w.emoji} {w.name}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  {WORLD_REWARD_INFO[w.id] ?? "Regole non ancora definite."}
                </div>
              </div>
            ))}

            <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: 0 }}>
              Alcune figurine possono raddoppiare, triplicare o dimezzare una vincita: gli importi
              qui sopra sono quelli base.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
