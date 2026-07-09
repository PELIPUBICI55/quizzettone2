import { WORLDS, CITTADELLA_ID } from "./worldsData.js";

export const BRIDGE_LENGTH = 5;
const SURPRISES_PER_BRIDGE = 2;

export interface BoardEdge {
  id: string;
  a: string; // id nodo A
  b: string; // id nodo B
  length: number; // numero di caselle da attraversare
  surprises: number[]; // indici di casella (1..length) con un evento imprevisto
}

// hash semplice e deterministico di una stringa, per generare le caselle
// "imprevisto" sempre uguali per uno stesso ponte (ma diverse da ponte a ponte)
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function pickSurpriseTiles(edgeId: string, length: number, count: number): number[] {
  const seed = hashString(edgeId);
  const rnd = (n: number) => {
    const x = Math.sin(seed + n * 99.71) * 43758.5453;
    return x - Math.floor(x);
  };
  const indices = Array.from({ length }, (_, i) => i + 1);
  const shuffled = [...indices].sort((a, b) => rnd(a) - rnd(b));
  return shuffled.slice(0, count).sort((a, b) => a - b);
}

// La Cittadella è collegata a tutti gli 8 mondi (raggi), e ogni mondo è
// collegato anche ai suoi due vicini sull'anello (ponti tra mondi adiacenti).
export const BOARD_EDGES: BoardEdge[] = [
  ...WORLDS.map((w) => {
    const id = `spoke-${w.id}`;
    return {
      id,
      a: CITTADELLA_ID,
      b: w.id,
      length: BRIDGE_LENGTH,
      surprises: pickSurpriseTiles(id, BRIDGE_LENGTH, SURPRISES_PER_BRIDGE),
    };
  }),
  ...WORLDS.map((w, i) => {
    const next = WORLDS[(i + 1) % WORLDS.length];
    const id = `rim-${w.id}-${next.id}`;
    return {
      id,
      a: w.id,
      b: next.id,
      length: BRIDGE_LENGTH,
      surprises: pickSurpriseTiles(id, BRIDGE_LENGTH, SURPRISES_PER_BRIDGE),
    };
  }),
];

export function neighborsOf(
  nodeId: string
): { edgeId: string; neighborId: string }[] {
  return BOARD_EDGES.filter((e) => e.a === nodeId || e.b === nodeId).map(
    (e) => ({
      edgeId: e.id,
      neighborId: e.a === nodeId ? e.b : e.a,
    })
  );
}

export function edgeById(edgeId: string): BoardEdge | undefined {
  return BOARD_EDGES.find((e) => e.id === edgeId);
}
