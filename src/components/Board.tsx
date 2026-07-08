import { useEffect, useState } from "react";
import type { BoardPosition, GameStateSnapshot, WorldDef } from "../../shared/types";
import { neighborsOf, edgeById } from "../../shared/board";
import { socket } from "../socket";

const CENTER = { x: 400, y: 400 };
const WORLD_RADIUS = 300;
const CITTADELLA_R = 68;
const WORLD_R = 52;

const PLAYER_COLORS = [
  "#e8c44a", // oro
  "#6fbf8f", // verde
  "#7aa8e0", // blu
  "#e08a6f", // corallo
  "#c98ad6", // lilla
  "#e0d06f", // giallo
  "#8fd6c9", // acqua
  "#e07a9c", // rosa
];

function nodePos(nodeId: string, worlds: WorldDef[]): { x: number; y: number } {
  if (nodeId === "cittadella") return CENTER;
  const idx = worlds.findIndex((w) => w.id === nodeId);
  if (idx === -1) return CENTER;
  const angle = -Math.PI / 2 + idx * ((2 * Math.PI) / worlds.length);
  return {
    x: CENTER.x + WORLD_RADIUS * Math.cos(angle),
    y: CENTER.y + WORLD_RADIUS * Math.sin(angle),
  };
}

function lerp(a: { x: number; y: number }, b: { x: number; y: number }, t: number) {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function CloudShape({
  cx,
  cy,
  r,
  fill,
}: {
  cx: number;
  cy: number;
  r: number;
  fill: string;
}) {
  // un gruppo di cerchi sovrapposti per dare l'idea di una nuvola
  const bumps = [
    { dx: -r * 0.55, dy: r * 0.15, br: r * 0.62 },
    { dx: r * 0.55, dy: r * 0.15, br: r * 0.62 },
    { dx: 0, dy: -r * 0.2, br: r * 0.8 },
    { dx: -r * 0.2, dy: r * 0.35, br: r * 0.55 },
    { dx: r * 0.2, dy: r * 0.35, br: r * 0.55 },
  ];
  return (
    <g>
      {bumps.map((b, i) => (
        <circle key={i} cx={cx + b.dx} cy={cy + b.dy} r={b.br} fill={fill} />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.75} fill={fill} />
    </g>
  );
}

interface Props {
  state: GameStateSnapshot;
}

export function Board({ state }: Props) {
  const [chosenDirection, setChosenDirection] = useState<string | null>(null);
  const [lastRoll, setLastRoll] = useState<{ playerId: string; value: number } | null>(null);

  useEffect(() => {
    const onRoll = (p: { playerId: string; value: number }) => {
      setLastRoll(p);
      setChosenDirection(null);
    };
    socket.on("board:diceRolled", onRoll);
    return () => {
      socket.off("board:diceRolled", onRoll);
    };
  }, []);

  const myTurn = state.currentTurnPlayerId === state.me.id;
  const myPos: BoardPosition = state.positions[state.me.id];
  const currentTurnPlayer = state.players.find((p) => p.id === state.currentTurnPlayerId);

  const neighbors = myPos?.onNode ? neighborsOf(myPos.nodeId) : [];
  const needsDirection = myTurn && myPos?.onNode && neighbors.length > 1;

  const roll = () => {
    socket.emit("board:roll", { direction: chosenDirection ?? undefined });
  };

  const worldLabel = (nodeId: string) => {
    if (nodeId === "cittadella") return "🏰 Cittadella";
    const w = state.worlds.find((w) => w.id === nodeId);
    return w ? `${w.emoji} ${w.name}` : nodeId;
  };

  // raggruppa i giocatori per nodo/arco per distanziare le pedine sovrapposte
  const grouped = new Map<string, string[]>();
  for (const [playerId, pos] of Object.entries(state.positions)) {
    const key = pos.onNode ? `n-${pos.nodeId}` : `e-${pos.edgeId}-${pos.progress}`;
    grouped.set(key, [...(grouped.get(key) ?? []), playerId]);
  }

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
          {needsDirection && !chosenDirection ? (
            <>
              <p style={{ marginTop: 0 }}>Scegli la direzione dalla tua posizione:</p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
                {neighbors.map((n) => (
                  <button
                    key={n.neighborId}
                    className="btn-outline"
                    onClick={() => setChosenDirection(n.neighborId)}
                  >
                    {worldLabel(n.neighborId)}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <button className="btn" onClick={roll}>
              🎲 Tira il dado
              {chosenDirection ? ` verso ${worldLabel(chosenDirection)}` : ""}
            </button>
          )}
        </div>
      )}

      <svg viewBox="0 0 800 800" style={{ width: "100%", maxWidth: 720, display: "block", margin: "0 auto" }}>
        {/* ponti */}
        {state.board.edges.map((edge) => {
          const a = nodePos(edge.a, state.worlds);
          const b = nodePos(edge.b, state.worlds);
          const tiles = Array.from({ length: edge.length }, (_, k) => {
            const t = (k + 1) / (edge.length + 1);
            return lerp(a, b, t);
          });
          return (
            <g key={edge.id}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#5a3d1f" strokeWidth={10} strokeLinecap="round" opacity={0.55} />
              {tiles.map((t, i) => (
                <rect
                  key={i}
                  x={t.x - 12}
                  y={t.y - 12}
                  width={24}
                  height={24}
                  rx={5}
                  fill="var(--panel-raised)"
                  stroke="var(--gold)"
                  strokeWidth={1.5}
                />
              ))}
            </g>
          );
        })}

        {/* nodi: cittadella + mondi */}
        <g>
          <CloudShape cx={CENTER.x} cy={CENTER.y} r={CITTADELLA_R} fill="#8a6a1f" />
          <text x={CENTER.x} y={CENTER.y - 6} textAnchor="middle" fontSize={26}>
            🏰
          </text>
          <text
            x={CENTER.x}
            y={CENTER.y + 22}
            textAnchor="middle"
            fontSize={13}
            fontFamily="var(--font-display)"
            fill="#2a1c08"
          >
            CITTADELLA
          </text>
        </g>

        {state.worlds.map((w) => {
          const pos = nodePos(w.id, state.worlds);
          return (
            <g key={w.id}>
              <CloudShape cx={pos.x} cy={pos.y} r={WORLD_R} fill={w.colorFrom} />
              <text x={pos.x} y={pos.y - 4} textAnchor="middle" fontSize={22}>
                {w.emoji}
              </text>
              <text
                x={pos.x}
                y={pos.y + 20}
                textAnchor="middle"
                fontSize={10.5}
                fontFamily="var(--font-display)"
                fill="#1c1c1c"
              >
                {w.name.toUpperCase()}
              </text>
            </g>
          );
        })}

        {/* pedine dei giocatori */}
        {[...grouped.entries()].flatMap(([, playerIds]) =>
          playerIds.map((playerId, slot) => {
            const pos = state.positions[playerId];
            if (!pos) return null;
            let coord: { x: number; y: number };
            if (pos.onNode) {
              coord = nodePos(pos.nodeId, state.worlds);
            } else {
              const edge = edgeById(pos.edgeId!);
              if (!edge) return null;
              const a = nodePos(pos.nodeId, state.worlds);
              const other = edge.a === pos.nodeId ? edge.b : edge.a;
              const b = nodePos(other, state.worlds);
              coord = lerp(a, b, (pos.progress ?? 0) / edge.length);
            }
            // distanzia pedine sovrapposte sullo stesso punto
            const offsetAngle = (slot * 2 * Math.PI) / Math.max(playerIds.length, 1);
            const offsetR = playerIds.length > 1 ? 16 : 0;
            const cx = coord.x + Math.cos(offsetAngle) * offsetR;
            const cy = coord.y + Math.sin(offsetAngle) * offsetR;
            const colorIdx = state.turnOrder.indexOf(playerId) % PLAYER_COLORS.length;
            const player = state.players.find((p) => p.id === playerId);
            const isCurrent = playerId === state.currentTurnPlayerId;
            return (
              <g key={playerId}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={14}
                  fill={PLAYER_COLORS[colorIdx]}
                  stroke={isCurrent ? "#fff" : "#00000055"}
                  strokeWidth={isCurrent ? 3 : 1.5}
                />
                <text x={cx} y={cy + 4} textAnchor="middle" fontSize={12} fontWeight={700} fill="#241417">
                  {player?.name.slice(0, 1).toUpperCase()}
                </text>
              </g>
            );
          })
        )}
      </svg>

      {lastRoll && (
        <p style={{ textAlign: "center", color: "var(--text-muted)" }}>
          {state.players.find((p) => p.id === lastRoll.playerId)?.name ?? "Qualcuno"} ha tirato un{" "}
          <strong style={{ color: "var(--gold-soft)" }}>{lastRoll.value}</strong>
        </p>
      )}
    </div>
  );
}
