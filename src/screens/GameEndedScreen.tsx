import type { GameEndedPayload, GameStateSnapshot } from "../../shared/types";
import { RevealedCollectionMenu } from "../components/RevealedCollectionMenu";

interface Props {
  state: GameStateSnapshot;
  payload: GameEndedPayload;
}

// Schermata di fine partita: mostra la classifica finale dopo il giro
// finale di shopping (tutti i mondi hanno esaurito le domande). Criteri di
// vittoria, in ordine: (1) più carte diverse possedute, (2) a parità più
// copie totali, (3) a ulteriore parità più monete rimaste.
export function GameEndedScreen({ state, payload }: Props) {
  const nameFor = (playerId: string) =>
    state.players.find((p) => p.id === playerId)?.name ?? "?";

  const winnerNames = payload.winnerIds.map(nameFor);
  const isCollectionWin = payload.reason === "collectionComplete";

  return (
    <div className="join-screen">
      <div className="join-panel panel" style={{ maxWidth: 560 }}>
        <h1 style={{ fontSize: "2.2rem", textAlign: "center" }}>
          {isCollectionWin ? "🎴 Collezione completata!" : "🏆 Partita conclusa!"}
        </h1>

        <p className="subtitle" style={{ textAlign: "center" }}>
          {isCollectionWin
            ? `${winnerNames.join(", ")} ${
                winnerNames.length > 1 ? "hanno" : "ha"
              } completato l'intera collezione di figurine: la partita finisce qui.`
            : "Tutti i mondi hanno esaurito le domande: dopo l'ultimo giro di shopping alla Cittadella, la partita è finita."}
        </p>

        <div
          className="wheel-text-panel"
          style={{ textAlign: "center", margin: "1rem 0 1.5rem" }}
        >
          <p className="subtle">
            {winnerNames.length > 1 ? "Vincitori a pari merito" : "Vincitore"}
          </p>
          <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--gold-soft)" }}>
            {winnerNames.join(", ")}
          </p>
        </div>

        <div style={{ margin: "0 0 1.2rem" }}>
          <RevealedCollectionMenu state={state} />
        </div>

        <h3 className="section-title" style={{ textAlign: "left" }}>
          Classifica finale
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {payload.standings.map((s, i) => {
            const isWinner = payload.winnerIds.includes(s.playerId);
            return (
              <div
                key={s.playerId}
                className="panel"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.6rem 0.9rem",
                  border: isWinner ? "2px solid var(--gold-soft)" : undefined,
                }}
              >
                <span style={{ fontWeight: 700 }}>
                  {i + 1}. {isWinner ? "🏆 " : ""}
                  {nameFor(s.playerId)}
                </span>
                <span style={{ color: "var(--text-muted)", fontSize: "0.9rem", textAlign: "right" }}>
                  {s.distinctCards}/{payload.totalCardCount} carte diverse · {s.totalCards} copie totali ·{" "}
                  {s.coins} 🪙
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
