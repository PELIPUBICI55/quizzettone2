import { WORLDS, CITTADELLA_ID } from "./worldsData.js";

export const BRIDGE_LENGTH = 5;

export interface BoardEdge {
  id: string;
  a: string; // id nodo A
  b: string; // id nodo B
  length: number; // numero di caselle da attraversare
}

// La Cittadella è collegata a tutti gli 8 mondi (raggi), e ogni mondo è
// collegato anche ai suoi due vicini sull'anello (ponti tra mondi adiacenti).
export const BOARD_EDGES: BoardEdge[] = [
  ...WORLDS.map((w) => ({
    id: `spoke-${w.id}`,
    a: CITTADELLA_ID,
    b: w.id,
    length: BRIDGE_LENGTH,
  })),
  ...WORLDS.map((w, i) => {
    const next = WORLDS[(i + 1) % WORLDS.length];
    return {
      id: `rim-${w.id}-${next.id}`,
      a: w.id,
      b: next.id,
      length: BRIDGE_LENGTH,
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
