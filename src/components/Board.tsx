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
  floatDelay,
}: {
  cx: number;
  cy: number;
  r: number;
  fill: string;
  floatDelay: number;
}) {
  // un gruppo di cerchi sovrapposti per dare l'idea di una nuvola,
  // con ombra, striatura fucsia/viola e riflesso glossy per un look 3D
  const bumps = [
    { dx: -r * 0.55, dy: r * 0.15, br: r * 0.62 },
    { dx: r * 0.55, dy: r * 0.15, br: r * 0.62 },
    { dx: 0, dy: -r * 0.2, br: r * 0.8 },
    { dx: -r * 0.2, dy: r * 0.35, br: r * 0.55 },
    { dx: r * 0.2, dy: r * 0.35, br: r * 0.55 },
  ];
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <g className="cloud-float" style={{ animationDelay: `${floatDelay}s` }}>
        <g filter="url(#cloudShadow)">
          {bumps.map((b, i) => (
            <circle key={i} cx={b.dx} cy={b.dy} r={b.br} fill={fill} />
          ))}
          <circle cx={0} cy={0} r={r * 0.75} fill={fill} />
        </g>
        {/* striatura fucsia/viola */}
        {bumps.map((b, i) => (
          <circle key={`s${i}`} cx={b.dx} cy={b.dy} r={b.br} fill="url(#cloudStreak)" />
        ))}
        <circle cx={0} cy={0} r={r * 0.75} fill="url(#cloudStreak)" />
        {/* riflesso glossy per il look 3D */}
        <circle cx={-r * 0.15} cy={-r * 0.3} r={r * 0.7} fill="url(#cloudHighlight)" />
      </g>
    </g>
  );
}

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
            <>
              <p style={{ marginTop: 0 }}>Scegli in quale direzione avanzare di {state.me.pendingRoll} caselle:</p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
                {neighbors.map((n) => (
                  <button key={n.neighborId} className="btn-outline" onClick={() => confirmMove(n.neighborId)}>
                    {worldLabel(n.neighborId)}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <button className="btn" onClick={() => confirmMove()}>
              Avanza di {state.me.pendingRoll} caselle
            </button>
          )}
        </div>
      )}

      <svg viewBox="0 0 800 800" style={{ width: "100%", maxWidth: 720, display: "block", margin: "0 auto" }}>
        <defs>
          <radialGradient id="cloudHighlight" cx="35%" cy="25%" r="65%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="cloudStreak" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f472f4" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#a855f7" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#f472f4" stopOpacity="0" />
          </linearGradient>
          <filter id="cloudShadow" x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#000" floodOpacity="0.55" />
          </filter>
          <filter id="bridgeGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="deckGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e9b8ff" />
            <stop offset="45%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#4c1d95" />
          </linearGradient>
          <linearGradient id="railGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fce7ff" />
            <stop offset="100%" stopColor="#c026d3" />
          </linearGradient>
        </defs>

        {/* ponti: veri impalcati con corrimano, paletti e caselle-gradino */}
        {state.board.edges.map((edge) => {
          const a = nodePos(edge.a, state.worlds);
          const b = nodePos(edge.b, state.worlds);
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const px = -dy / len;
          const py = dx / len;

          const DECK_HW = 20; // met\u00e0 larghezza dell'impalcato
          const RAIL_OFF = 27; // distanza del corrimano dal centro

          const deckA1 = { x: a.x + px * DECK_HW, y: a.y + py * DECK_HW };
          const deckA2 = { x: a.x - px * DECK_HW, y: a.y - py * DECK_HW };
          const deckB1 = { x: b.x + px * DECK_HW, y: b.y + py * DECK_HW };
          const deckB2 = { x: b.x - px * DECK_HW, y: b.y - py * DECK_HW };

          const railA1 = { x: a.x + px * RAIL_OFF, y: a.y + py * RAIL_OFF };
          const railB1 = { x: b.x + px * RAIL_OFF, y: b.y + py * RAIL_OFF };
          const railA2 = { x: a.x - px * RAIL_OFF, y: a.y - py * RAIL_OFF };
          const railB2 = { x: b.x - px * RAIL_OFF, y: b.y - py * RAIL_OFF };

          // punti dei paletti e delle giunture tra caselle (agli estremi + a ogni casella)
          const posts = Array.from({ length: edge.length + 1 }, (_, k) => k / edge.length);

          return (
            <g key={edge.id}>
              {/* ombra sotto l'impalcato per dare l'idea di elevazione */}
              <polygon
                points={`${deckA1.x + 5},${deckA1.y + 8} ${deckB1.x + 5},${deckB1.y + 8} ${deckB2.x + 5},${deckB2.y + 8} ${deckA2.x + 5},${deckA2.y + 8}`}
                fill="#000000"
                opacity={0.4}
              />

              {/* superficie dell'impalcato */}
              <polygon
                points={`${deckA1.x},${deckA1.y} ${deckB1.x},${deckB1.y} ${deckB2.x},${deckB2.y} ${deckA2.x},${deckA2.y}`}
                fill="url(#deckGradient)"
                stroke="#2a1245"
                strokeWidth={1.5}
              />

              {/* giunture tra le caselle, per farle leggere come gradini distinti */}
              {posts.slice(1, -1).map((t, i) => {
                const c = lerp(a, b, t);
                const p1 = { x: c.x + px * DECK_HW, y: c.y + py * DECK_HW };
                const p2 = { x: c.x - px * DECK_HW, y: c.y - py * DECK_HW };
                return (
                  <line
                    key={i}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke="#2a1245"
                    strokeWidth={2}
                    opacity={0.65}
                  />
                );
              })}

              {/* riflesso di luce al centro di ogni casella */}
              {Array.from({ length: edge.length }, (_, k) => (k + 0.5) / edge.length).map((t, i) => {
                const c = lerp(a, b, t);
                return <circle key={i} cx={c.x} cy={c.y} r={6} fill="#fff" opacity={0.18} />;
              })}

              {/* corrimano su entrambi i lati, con paletti */}
              {[
                { rail1: railA1, rail2: railB1 },
                { rail1: railA2, rail2: railB2 },
              ].map((side, si) => (
                <g key={si}>
                  {posts.map((t, pi) => {
                    const centerPt = lerp(a, b, t);
                    const sign = si === 0 ? 1 : -1;
                    const deckEdge = { x: centerPt.x + px * DECK_HW * sign, y: centerPt.y + py * DECK_HW * sign };
                    const railEdge = { x: centerPt.x + px * RAIL_OFF * sign, y: centerPt.y + py * RAIL_OFF * sign };
                    return (
                      <line
                        key={pi}
                        x1={deckEdge.x}
                        y1={deckEdge.y}
                        x2={railEdge.x}
                        y2={railEdge.y}
                        stroke="#5b21b6"
                        strokeWidth={3}
                        strokeLinecap="round"
                      />
                    );
                  })}
                  <line
                    x1={side.rail1.x}
                    y1={side.rail1.y}
                    x2={side.rail2.x}
                    y2={side.rail2.y}
                    stroke="url(#railGradient)"
                    strokeWidth={4}
                    strokeLinecap="round"
                    filter="url(#bridgeGlow)"
                  />
                </g>
              ))}
            </g>
          );
        })}

        {/* nodi: cittadella + mondi */}
        <g>
          <CloudShape cx={CENTER.x} cy={CENTER.y} r={CITTADELLA_R} fill="#8a6a1f" floatDelay={0} />
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

        {state.worlds.map((w, i) => {
          const pos = nodePos(w.id, state.worlds);
          return (
            <g key={w.id}>
              <CloudShape cx={pos.x} cy={pos.y} r={WORLD_R} fill={w.colorFrom} floatDelay={i * 0.4} />
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
    </div>
  );
}
