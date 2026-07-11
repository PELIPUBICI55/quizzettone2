import { useEffect, useState } from "react";
import type { BoardPosition, CardRarity, GameStateSnapshot } from "../../shared/types";
import { neighborsOf } from "../../shared/board";
import { socket } from "../socket";
import { BoardScene3D } from "./BoardScene3D";
import { CardView } from "./CardView";

interface Props {
  state: GameStateSnapshot;
}

const RARITY_ORDER: Record<CardRarity, number> = {
  leggendaria: 0,
  epica: 1,
  rara: 2,
  comune: 3,
};

export function Board({ state }: Props) {
  const [revealedRoll, setRevealedRoll] = useState(false);
  const [cardMenuOpen, setCardMenuOpen] = useState(false);

  useEffect(() => {
    setRevealedRoll(false);
  }, [state.currentTurnPlayerId]);

  useEffect(() => {
    if (state.me.pendingRoll !== null) setRevealedRoll(false);
  }, [state.me.pendingRoll]);

  const myTurn = state.currentTurnPlayerId === state.me.id;
  const myPos: BoardPosition = state.positions[state.me.id];
  const currentTurnPlayer = state.players.find((p) => p.id === state.currentTurnPlayerId);

  const neighbors = myPos?.onNode ? neighborsOf(myPos.nodeId) : [];
  const needsDirection = myPos?.onNode && neighbors.length > 1;

  const rollDice = () => socket.emit("board:roll");
  const confirmMove = (direction?: string) => socket.emit("board:confirmMove", { direction });

  // carte NON rapide, NON passive e non già usate in questo turno,
  // utilizzabili solo ora, prima di tirare il dado
  const cardsById = new Map(state.cardCatalog.map((c) => [c.id, c]));
  const ownedCounts = new Map<string, number>();
  for (const owned of state.me.collection) {
    ownedCounts.set(owned.cardId, (ownedCounts.get(owned.cardId) ?? 0) + 1);
  }

  const canUseCards = myTurn && state.me.pendingRoll === null;
  const preRollCardIds = canUseCards
    ? [
        ...new Set(
          state.me.collection
            .filter((c) => !c.used)
            .map((c) => c.cardId)
            .filter((id) => {
              const effect = cardsById.get(id)?.effect;
              if (!effect || effect.isQuickEffect || effect.isPassive) return false;
              return !state.me.cardsUsedThisTurn.includes(id);
            })
        ),
      ].sort((a, b) => {
        const ra = cardsById.get(a)?.rarity;
        const rb = cardsById.get(b)?.rarity;
        return (ra ? RARITY_ORDER[ra] : 99) - (rb ? RARITY_ORDER[rb] : 99);
      })
    : [];

  return (
    <div>
      <div className="panel" style={{ marginBottom: "1rem", textAlign: "center" }}>
        {currentTurnPlayer ? (
          <p style={{ margin: 0 }}>
            🎲 Turno di <strong style={{ color: "var(--gold-soft)" }}>{currentTurnPlayer.name}</strong>
          </p>
        ) : (
          <p style={{ margin: 0, color: "var(--text-muted)" }}>In attesa di giocatori…</p>
        )}
      </div>

      {myTurn && (
        <div className="panel" style={{ marginBottom: "1rem", textAlign: "center" }}>
          {state.me.pendingRoll === null ? (
            <>
              <button className="btn" onClick={rollDice}>
                🎲 Tira il dado
              </button>
              {preRollCardIds.length > 0 && (
                <div style={{ position: "relative", display: "inline-block", marginLeft: "0.75rem" }}>
                  <button className="btn-outline" onClick={() => setCardMenuOpen((o) => !o)}>
                    🎴 Usa figurina ({preRollCardIds.length})
                  </button>

                  {cardMenuOpen && (
                    <>
                      <div
                        onClick={() => setCardMenuOpen(false)}
                        style={{ position: "fixed", inset: 0, zIndex: 59 }}
                      />
                      <div
                        className="panel"
                        style={{
                          position: "absolute",
                          top: "calc(100% + 0.5rem)",
                          left: "50%",
                          transform: "translateX(-50%)",
                          zIndex: 60,
                          width: "min(90vw, 420px)",
                          maxHeight: "70vh",
                          overflowY: "auto",
                        }}
                      >
                        <h3 style={{ marginTop: 0 }}>Scegli una figurina da attivare</h3>
                        <div className="card-grid">
                          {preRollCardIds.map((id) => {
                            const card = cardsById.get(id);
                            if (!card) return null;
                            return (
                              <CardView
                                key={id}
                                card={card}
                                ownedCount={ownedCounts.get(id) ?? 0}
                                onUse={() => {
                                  socket.emit("card:use", { cardId: id });
                                  setCardMenuOpen(false);
                                }}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          ) : !revealedRoll ? (
            <>
              <p style={{ marginTop: 0 }}>
                Hai tirato <strong style={{ color: "var(--gold-soft)" }}>{state.me.pendingRoll}</strong>!
              </p>
              <button className="btn" onClick={() => setRevealedRoll(true)}>
                Continua
              </button>
            </>
          ) : needsDirection ? (
            <p style={{ marginTop: 0 }}>
              Hai tirato <strong style={{ color: "var(--gold-soft)" }}>{state.me.pendingRoll}</strong>: clicca
              su una casella o un mondo evidenziato sulla mappa per scegliere la direzione.
            </p>
          ) : (
            <button className="btn" onClick={() => confirmMove()}>
              Avanza di {state.me.pendingRoll} caselle
            </button>
          )}
        </div>
      )}

      <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
        Trascina per ruotare la mappa, scorri/pizzica per zoomare
      </p>
      <BoardScene3D
        state={state}
        directionChoice={
          myTurn && state.me.pendingRoll !== null && revealedRoll && needsDirection && myPos?.onNode
            ? { nodeId: myPos.nodeId, neighbors, roll: state.me.pendingRoll }
            : null
        }
        onSelectDirection={(neighborId) => confirmMove(neighborId)}
      />
    </div>
  );
}
