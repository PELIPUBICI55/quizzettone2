import { useEffect, useState } from "react";
import type { BoardPosition, GameStateSnapshot } from "../../shared/types";
import { neighborsOf } from "../../shared/board";
import { socket } from "../socket";
import { BoardScene3D } from "./BoardScene3D";

interface Props {
  state: GameStateSnapshot;
}

export function Board({ state }: Props) {
  const [revealedRoll, setRevealedRoll] = useState(false);

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
            <button className="btn" onClick={rollDice}>
              🎲 Tira il dado
            </button>
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
