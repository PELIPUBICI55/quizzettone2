import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line, Billboard, Text } from "@react-three/drei";
import type * as THREE from "three";
import type { GameStateSnapshot, PawnToken as PawnTokenId, WorldDef } from "../../shared/types";

const RADIUS = 13;

// generatore pseudo-casuale deterministico (stesso seed = stesso risultato ad ogni render)
function rand(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function nodePos3D(nodeId: string, worlds: WorldDef[]): [number, number, number] {
  if (nodeId === "cittadella") return [0, 0, 0];
  const idx = worlds.findIndex((w) => w.id === nodeId);
  if (idx === -1) return [0, 0, 0];
  const angle = -Math.PI / 2 + idx * ((2 * Math.PI) / worlds.length);
  const heightVariance = (rand(idx * 3.7) - 0.5) * 1.6;
  return [RADIUS * Math.cos(angle), heightVariance, RADIUS * Math.sin(angle)];
}

function lerp3(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

const CITTADELLA_SIZE = 3.6;
const WORLD_SIZE = 2.7;

function islandRadius(nodeId: string): number {
  const size = nodeId === "cittadella" ? CITTADELLA_SIZE : WORLD_SIZE;
  return size * 0.65;
}

// Calcola inizio/fine effettivi del ponte (accorciato rispetto ai centri
// delle isole, per non compenetrarle). Usato sia da Bridge3D per disegnare
// le tavole sia dal calcolo della posizione delle pedine, così coincidono sempre.
function bridgeSpan(
  a: [number, number, number],
  b: [number, number, number],
  radiusA: number,
  radiusB: number
): { start: [number, number, number]; end: [number, number, number] } {
  const dx = b[0] - a[0];
  const dz = b[2] - a[2];
  const dist = Math.sqrt(dx * dx + dz * dz) || 1;
  const margin = 0.6;
  const tStart = (radiusA + margin) / dist;
  const tEnd = 1 - (radiusB + margin) / dist;
  return {
    start: [a[0] + dx * tStart, a[1] + (b[1] - a[1]) * tStart, a[2] + dz * tStart],
    end: [a[0] + dx * tEnd, a[1] + (b[1] - a[1]) * tEnd, a[2] + dz * tEnd],
  };
}

function FloatingIsland({
  position,
  color,
  size,
  seed,
  isCenter,
  pawns,
  highlighted,
  deactivated,
  onSelect,
  name,
  emoji,
}: {
  position: [number, number, number];
  color: string;
  size: number;
  seed: number;
  isCenter?: boolean;
  pawns?: { key: string; color: string; isCurrent: boolean; name: string; token: PawnTokenId; angle: number; offsetR: number }[];
  highlighted?: boolean;
  deactivated?: boolean; // domande finite: isola spenta, non più selezionabile
  onSelect?: () => void;
  name: string;
  emoji: string;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const phase = seed * 1.7;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.position.y = position[1] + Math.sin(t * 0.5 + phase) * 0.4;
    groupRef.current.rotation.y = Math.sin(t * 0.12 + phase) * 0.04;
  });

  const cloudPuffs = useMemo(() => {
    const arr: { x: number; z: number; y: number; s: number }[] = [];
    const count = 7;
    const platformBottom = size * 0.08; // le nuvole devono toccare qui il fondo della piattaforma, non oltre
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + rand(seed + i) * 0.35;
      const ringR = size * 0.4 * (0.55 + rand(seed + i * 3) * 0.5);
      const puffR = size * (0.2 + rand(seed + i * 7) * 0.16);
      const jitter = (rand(seed + i * 11) - 0.5) * size * 0.04;
      arr.push({
        x: Math.cos(a) * ringR,
        z: Math.sin(a) * ringR,
        y: -platformBottom - puffR + jitter,
        s: puffR,
      });
    }
    // grosso cumulo centrale, per riempire il volume sotto la piattaforma
    const centerR = size * 0.48;
    arr.push({ x: 0, z: 0, y: -platformBottom - centerR * 0.85, s: centerR });
    return arr;
  }, [seed, size]);

  const decos = useMemo(() => {
    const arr: { x: number; z: number; s: number; type: "tree" | "rock" }[] = [];
    const count = 4 + Math.floor(rand(seed) * 3);
    for (let i = 0; i < count; i++) {
      const a = rand(seed + i * 3.1) * Math.PI * 2;
      const r = size * (0.25 + rand(seed + i * 7.7) * 0.35);
      arr.push({
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        s: 0.35 + rand(seed + i * 2.3) * 0.35,
        type: rand(seed + i * 5.3) > 0.45 ? "tree" : "rock",
      });
    }
    return arr;
  }, [seed, size]);

  return (
    <group ref={groupRef} position={position}>
      {/* cumulo di nuvole soffici sotto la piattaforma */}
      {cloudPuffs.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]} castShadow receiveShadow>
          <sphereGeometry args={[p.s, 12, 12]} />
          <meshStandardMaterial color="#f2ecff" roughness={0.9} />
        </mesh>
      ))}
      {/* piattaforma superiore: spenta e desaturata se il mondo è disattivato */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[size * 0.62, size * 0.68, size * 0.22, 8]} />
        <meshStandardMaterial color={deactivated ? "#4a4a52" : color} roughness={0.9} flatShading />
      </mesh>
      {/* anello di energia magica: diventa un bersaglio pulsante e cliccabile quando evidenziato,
          spento e non cliccabile se il mondo è disattivato (domande finite) */}
      <mesh
        position={[0, -size * 0.08, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={highlighted && !deactivated ? 1.25 : 1}
        onClick={
          onSelect && !deactivated
            ? (e) => {
                e.stopPropagation();
                onSelect();
              }
            : undefined
        }
        onPointerOver={onSelect && !deactivated ? () => (document.body.style.cursor = "pointer") : undefined}
        onPointerOut={onSelect && !deactivated ? () => (document.body.style.cursor = "auto") : undefined}
      >
        <torusGeometry args={[size * 0.68, highlighted && !deactivated ? 0.12 : 0.05, 8, 32]} />
        <meshStandardMaterial
          color={deactivated ? "#3a3a40" : highlighted ? "#4ade80" : "#e879f9"}
          emissive={deactivated ? "#000000" : highlighted ? "#4ade80" : "#e879f9"}
          emissiveIntensity={deactivated ? 0 : highlighted ? 2 : 1.3}
          toneMapped={false}
        />
      </mesh>

      {isCenter ? (
        <>
          <mesh position={[0, size * 0.35, 0]} castShadow>
            <cylinderGeometry args={[size * 0.22, size * 0.26, size * 0.55, 8]} />
            <meshStandardMaterial color="#c9a227" roughness={0.5} />
          </mesh>
          <mesh position={[0, size * 0.7, 0]} castShadow>
            <coneGeometry args={[size * 0.3, size * 0.4, 8]} />
            <meshStandardMaterial color="#8a6a1f" roughness={0.4} />
          </mesh>
        </>
      ) : (
        decos.map((d, i) =>
          d.type === "tree" ? (
            <group key={i} position={[d.x, size * 0.11, d.z]}>
              <mesh position={[0, d.s * 0.4, 0]} castShadow>
                <cylinderGeometry args={[d.s * 0.06, d.s * 0.08, d.s * 0.5, 5]} />
                <meshStandardMaterial color="#3a2612" roughness={0.9} />
              </mesh>
              <mesh position={[0, d.s * 0.8, 0]} castShadow>
                <coneGeometry args={[d.s * 0.4, d.s * 0.75, 6]} />
                <meshStandardMaterial color="#2f6f4f" flatShading roughness={0.8} />
              </mesh>
            </group>
          ) : (
            <mesh
              key={i}
              position={[d.x, size * 0.14 + d.s * 0.15, d.z]}
              rotation={[rand(seed + i) * Math.PI, rand(seed + i * 2) * Math.PI, 0]}
              castShadow
            >
              <icosahedronGeometry args={[d.s * 0.3, 0]} />
              <meshStandardMaterial color="#8f8f9a" roughness={0.85} flatShading />
            </mesh>
          )
        )
      )}

      {/* pedine posate su questa isola: sono figlie dello stesso gruppo animato,
          quindi fluttuano insieme alla piattaforma senza sfasarsi mai */}
      {pawns?.map((p) => (
        <PawnToken
          key={p.key}
          position={[Math.cos(p.angle) * p.offsetR, size * 0.11 + 0.12, Math.sin(p.angle) * p.offsetR]}
          color={p.color}
          isCurrent={p.isCurrent}
          name={p.name}
          token={p.token}
        />
      ))}

      {/* etichetta col nome dell'isola, sempre rivolta verso la camera */}
      <Billboard position={[0, size * (isCenter ? 1.05 : 0.55), 0]}>
        <Text
          fontSize={size * 0.24}
          color={deactivated ? "#8a8a90" : "#f2d98a"}
          anchorX="center"
          anchorY="middle"
          outlineWidth={size * 0.018}
          outlineColor="#1a0f10"
        >
          {emoji} {name}
          {deactivated ? " (esaurito)" : ""}
        </Text>
      </Billboard>
    </group>
  );
}

function Bridge3D({
  a,
  b,
  length,
  radiusA,
  radiusB,
  surprises,
  deactivated,
}: {
  a: [number, number, number];
  b: [number, number, number];
  length: number;
  radiusA: number;
  radiusB: number;
  surprises: number[];
  deactivated?: boolean; // ponte verso/da un mondo con domande finite: spento, non attraversabile
}) {
  const fullDx = b[0] - a[0];
  const fullDz = b[2] - a[2];
  const fullDist = Math.sqrt(fullDx * fullDx + fullDz * fullDz) || 1;
  const dirx = fullDx / fullDist;
  const dirz = fullDz / fullDist;

  const { start, end } = bridgeSpan(a, b, radiusA, radiusB);

  const dx = end[0] - start[0];
  const dz = end[2] - start[2];
  const dist = Math.sqrt(dx * dx + dz * dz) || 1;
  const perpx = -dirz;
  const perpz = dirx;
  const angle = Math.atan2(dirx, dirz);

  const railOffset = 1.25;
  const railHeight = 0.95;

  const planks = Array.from({ length }, (_, i) => {
    const t = (i + 0.5) / length;
    const dip = Math.sin(t * Math.PI) * 0.35;
    return {
      x: start[0] + dx * t,
      y: start[1] + (end[1] - start[1]) * t - dip,
      z: start[2] + dz * t,
    };
  });

  const railSide = (sign: number): [number, number, number][] => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= length; i++) {
      const t = i / length;
      const dip = Math.sin(t * Math.PI) * 0.35;
      pts.push([
        start[0] + dx * t + perpx * railOffset * sign,
        start[1] + (end[1] - start[1]) * t - dip + railHeight,
        start[2] + dz * t + perpz * railOffset * sign,
      ]);
    }
    return pts;
  };

  const postTs = Array.from({ length: length + 1 }, (_, i) => i / length);

  return (
    <group>
      {/* tavole di legno del ponte, ben distanziate tra loro: spente e
          desaturate se il ponte è disattivato (nessun bagliore imprevisto,
          il ponte non è più attraversabile) */}
      {planks.map((p, i) => {
        const isSurprise = !deactivated && surprises.includes(i + 1);
        return (
          <group key={i}>
            <mesh position={[p.x, p.y, p.z]} rotation={[0, angle, 0]} castShadow receiveShadow>
              <boxGeometry args={[2, 0.16, (dist / length) * 0.62]} />
              <meshStandardMaterial
                color={deactivated ? "#454549" : isSurprise ? "#2f9e6f" : "#8a5a30"}
                emissive={isSurprise ? "#2f9e6f" : "#000000"}
                emissiveIntensity={isSurprise ? 0.5 : 0}
                roughness={0.9}
                flatShading
                toneMapped={false}
              />
            </mesh>
            {isSurprise && (
              <Billboard position={[p.x, p.y + 0.7, p.z]}>
                <mesh>
                  <circleGeometry args={[0.26, 20]} />
                  <meshStandardMaterial color="#123d2b" emissive="#2f9e6f" emissiveIntensity={0.6} toneMapped={false} />
                </mesh>
                <Text fontSize={0.32} color="#baffd9" anchorX="center" anchorY="middle" position={[0, 0, 0.01]}>
                  ?
                </Text>
              </Billboard>
            )}
          </group>
        );
      })}

      {/* corrimano di corda: spento se il ponte è disattivato */}
      <Line points={railSide(1)} color={deactivated ? "#5c5c62" : "#c9a875"} lineWidth={2.5} />
      <Line points={railSide(-1)} color={deactivated ? "#5c5c62" : "#c9a875"} lineWidth={2.5} />

      {postTs.flatMap((t, i) => {
        const dip = Math.sin(t * Math.PI) * 0.35;
        const baseY = start[1] + (end[1] - start[1]) * t - dip;
        const cx = start[0] + dx * t;
        const cz = start[2] + dz * t;
        return [1, -1].map((sign) => (
          <group key={`${i}-${sign}`}>
            <Line
              points={[
                [cx + perpx * 0.85 * sign, baseY + 0.1, cz + perpz * 0.85 * sign],
                [cx + perpx * railOffset * sign, baseY + railHeight, cz + perpz * railOffset * sign],
              ]}
              color={deactivated ? "#3f3f44" : "#6b4423"}
              lineWidth={1.5}
            />
            {/* lanterna magica ogni due paletti, spenta se il ponte è disattivato */}
            {i % 2 === 0 && !deactivated && (
              <mesh position={[cx + perpx * railOffset * sign, baseY + railHeight + 0.15, cz + perpz * railOffset * sign]}>
                <sphereGeometry args={[0.09, 8, 8]} />
                <meshStandardMaterial
                  color="#ffe9a8"
                  emissive="#ffcf6b"
                  emissiveIntensity={1.6}
                  toneMapped={false}
                />
              </mesh>
            )}
          </group>
        ));
      })}
    </group>
  );
}

function TargetMarker({
  point,
  onSelect,
}: {
  point: [number, number, number];
  onSelect: () => void;
}) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ringRef.current) return;
    const s = 1 + Math.sin(clock.getElapsedTime() * 4) * 0.15;
    ringRef.current.scale.set(s, 1, s);
  });

  return (
    <group position={point}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "auto")}
      >
        <cylinderGeometry args={[0.8, 0.8, 0.05, 20]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.09, 10, 26]} />
        <meshStandardMaterial color="#4ade80" emissive="#4ade80" emissiveIntensity={1.8} toneMapped={false} />
      </mesh>
    </group>
  );
}

function MonopolyToken({
  token,
  color,
  isCurrent,
  movingRef,
}: {
  token: PawnTokenId;
  color: string;
  isCurrent: boolean;
  movingRef: { current: boolean };
}) {
  const glow = isCurrent ? color : "#000000";
  const glowI = isCurrent ? 0.6 : 0;

  const bodyRef = useRef<THREE.Group>(null);
  const wheelRefs = useRef<(THREE.Mesh | null)[]>([]);
  const spinRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const moving = movingRef.current;
    const t = state.clock.getElapsedTime();

    wheelRefs.current.forEach((w) => {
      if (w) w.rotation.x += (moving ? 14 : 0) * delta;
    });
    if (spinRef.current) {
      spinRef.current.rotation.x += (moving ? 12 : 0) * delta;
    }

    if (bodyRef.current) {
      if (moving && (token === "dog" || token === "boot")) {
        bodyRef.current.position.y = Math.abs(Math.sin(t * 11)) * 0.09;
        bodyRef.current.rotation.z = 0;
      } else if (moving && token === "ship") {
        bodyRef.current.position.y = 0;
        bodyRef.current.rotation.z = Math.sin(t * 6) * 0.12;
      } else if (moving && token === "hat") {
        bodyRef.current.rotation.y += delta * 7;
        bodyRef.current.position.y = Math.abs(Math.sin(t * 9)) * 0.05;
      } else {
        bodyRef.current.position.y = 0;
        bodyRef.current.rotation.set(0, 0, 0);
      }
    }
  });

  switch (token) {
    case "hat":
      return (
        <group ref={bodyRef}>
          <mesh position={[0, 0.08, 0]} castShadow>
            <cylinderGeometry args={[0.34, 0.34, 0.05, 20]} />
            <meshStandardMaterial color="#1a1a1a" emissive={glow} emissiveIntensity={glowI} />
          </mesh>
          <mesh position={[0, 0.32, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.22, 0.42, 20]} />
            <meshStandardMaterial color="#1a1a1a" emissive={glow} emissiveIntensity={glowI} />
          </mesh>
          <mesh position={[0, 0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.21, 0.03, 8, 20]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      );

    case "car":
      return (
        <group>
          <mesh position={[0, 0.26, 0]} castShadow>
            <boxGeometry args={[0.56, 0.16, 0.26]} />
            <meshStandardMaterial color={color} emissive={glow} emissiveIntensity={glowI} flatShading />
          </mesh>
          <mesh position={[-0.03, 0.41, 0]} castShadow>
            <boxGeometry args={[0.3, 0.14, 0.22]} />
            <meshStandardMaterial color={color} flatShading />
          </mesh>
          {[0.18, -0.18].flatMap((x, xi) =>
            [0.14, -0.14].map((z, zi) => (
              <mesh
                key={`${x}-${z}`}
                ref={(el) => {
                  wheelRefs.current[xi * 2 + zi] = el;
                }}
                position={[x, 0.12, z]}
                rotation={[0, 0, Math.PI / 2]}
                castShadow
              >
                <cylinderGeometry args={[0.09, 0.09, 0.07, 14]} />
                <meshStandardMaterial color="#1a1a1a" />
              </mesh>
            ))
          )}
        </group>
      );

    case "dog":
      return (
        <group ref={bodyRef}>
          <mesh position={[0, 0.28, 0]} castShadow>
            <boxGeometry args={[0.4, 0.16, 0.16]} />
            <meshStandardMaterial color={color} emissive={glow} emissiveIntensity={glowI} flatShading />
          </mesh>
          <mesh position={[0.24, 0.35, 0]} castShadow>
            <sphereGeometry args={[0.13, 12, 12]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0.35, 0.32, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
            <coneGeometry args={[0.06, 0.14, 8]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {[0.16, -0.16].map((z) => (
            <mesh key={z} position={[0.28, 0.44, z]} castShadow>
              <coneGeometry args={[0.045, 0.12, 6]} />
              <meshStandardMaterial color={color} flatShading />
            </mesh>
          ))}
          {[
            [0.15, 0.1],
            [0.15, -0.1],
            [-0.15, 0.1],
            [-0.15, -0.1],
          ].map(([x, z]) => (
            <mesh key={`${x}-${z}`} position={[x, 0.12, z]} castShadow>
              <cylinderGeometry args={[0.035, 0.035, 0.2, 8]} />
              <meshStandardMaterial color={color} />
            </mesh>
          ))}
        </group>
      );

    case "boot":
      return (
        <group ref={bodyRef}>
          <mesh position={[0.04, 0.07, 0]} castShadow>
            <boxGeometry args={[0.44, 0.08, 0.2]} />
            <meshStandardMaterial color={color} emissive={glow} emissiveIntensity={glowI} flatShading />
          </mesh>
          <mesh position={[-0.11, 0.28, 0]} castShadow>
            <boxGeometry args={[0.18, 0.38, 0.17]} />
            <meshStandardMaterial color={color} flatShading />
          </mesh>
          <mesh position={[0.2, 0.13, 0]} castShadow>
            <boxGeometry args={[0.14, 0.1, 0.18]} />
            <meshStandardMaterial color={color} flatShading />
          </mesh>
        </group>
      );

    case "ship":
      return (
        <group ref={bodyRef}>
          <mesh position={[0, 0.22, 0]} castShadow>
            <boxGeometry args={[0.58, 0.14, 0.22]} />
            <meshStandardMaterial color={color} emissive={glow} emissiveIntensity={glowI} flatShading />
          </mesh>
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.42, 8]} />
            <meshStandardMaterial color="#5a3d1f" />
          </mesh>
          <mesh position={[0.09, 0.5, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <coneGeometry args={[0.16, 0.3, 4]} />
            <meshStandardMaterial color="#f2ecff" flatShading />
          </mesh>
        </group>
      );

    case "wheelbarrow":
    default:
      return (
        <group>
          <mesh position={[-0.05, 0.32, 0]} rotation={[-0.15, 0, 0]} castShadow>
            <boxGeometry args={[0.38, 0.14, 0.26]} />
            <meshStandardMaterial color={color} emissive={glow} emissiveIntensity={glowI} flatShading />
          </mesh>
          <mesh ref={spinRef} position={[0.22, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[0.1, 0.03, 8, 16]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          {[0.09, -0.09].map((z) => (
            <mesh key={z} position={[-0.32, 0.28, z]} rotation={[0, 0, -0.2]} castShadow>
              <cylinderGeometry args={[0.02, 0.02, 0.36, 6]} />
              <meshStandardMaterial color="#5a3d1f" />
            </mesh>
          ))}
        </group>
      );
  }
}

function PawnToken({
  position,
  color,
  isCurrent,
  name,
  token,
}: {
  position: [number, number, number];
  color: string;
  isCurrent: boolean;
  name: string;
  token: PawnTokenId;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const movingRef = useRef(false);
  const mounted = useRef(false);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (!mounted.current) {
      groupRef.current.position.set(position[0], position[1], position[2]);
      mounted.current = true;
      movingRef.current = false;
      return;
    }
    const cur = groupRef.current.position;
    const dx = position[0] - cur.x;
    const dy = position[1] - cur.y;
    const dz = position[2] - cur.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    movingRef.current = dist > 0.02;
    if (dist > 0.001) {
      const ease = Math.min(1, delta * 5);
      cur.x += dx * ease;
      cur.y += dy * ease;
      cur.z += dz * ease;
    } else {
      cur.set(position[0], position[1], position[2]);
    }
  });

  return (
    <group ref={groupRef}>
      <MonopolyToken token={token} color={color} isCurrent={isCurrent} movingRef={movingRef} />
      <Billboard position={[0, 1.05, 0]}>
        <Text
          fontSize={0.32}
          color="#f2d98a"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.025}
          outlineColor="#1a0f10"
        >
          {name}
        </Text>
      </Billboard>
    </group>
  );
}

interface Props {
  state: GameStateSnapshot;
  directionChoice?: {
    nodeId: string;
    neighbors: { edgeId: string; neighborId: string }[];
    roll: number;
  } | null;
  onSelectDirection?: (neighborId: string) => void;
}

const PLAYER_COLORS = [
  "#e8c44a",
  "#6fbf8f",
  "#7aa8e0",
  "#e08a6f",
  "#c98ad6",
  "#e0d06f",
  "#8fd6c9",
  "#e07a9c",
];

export function BoardScene3D({ state, directionChoice, onSelectDirection }: Props) {
  // raggruppa le pedine per nodo/arco, per distanziare quelle sovrapposte
  const grouped = new Map<string, string[]>();
  for (const [playerId, pos] of Object.entries(state.positions)) {
    const key = pos.onNode ? `n-${pos.nodeId}` : `e-${pos.edgeId}-${pos.progress}`;
    grouped.set(key, [...(grouped.get(key) ?? []), playerId]);
  }

  const pawnDescriptor = (playerId: string, slot: number, total: number) => {
    const angle = (slot * 2 * Math.PI) / Math.max(total, 1);
    const offsetR = total > 1 ? 0.9 : 0;
    const colorIdx = state.turnOrder.indexOf(playerId) % PLAYER_COLORS.length;
    const player = state.players.find((p) => p.id === playerId);
    return {
      key: playerId,
      color: PLAYER_COLORS[colorIdx],
      isCurrent: playerId === state.currentTurnPlayerId,
      name: player?.name ?? "?",
      token: player?.token ?? "hat",
      angle,
      offsetR,
    };
  };

  // pedine per nodo (rese come figlie della rispettiva isola, per fluttuare insieme)
  const pawnsByNode = new Map<string, ReturnType<typeof pawnDescriptor>[]>();
  // pedine a metà ponte, con la loro posizione mondo già calcolata
  const bridgePawns: { descriptor: ReturnType<typeof pawnDescriptor>; point: [number, number, number] }[] = [];

  for (const [, playerIds] of grouped.entries()) {
    playerIds.forEach((playerId, slot) => {
      const pos = state.positions[playerId];
      if (!pos) return;
      const descriptor = pawnDescriptor(playerId, slot, playerIds.length);
      if (pos.onNode) {
        const list = pawnsByNode.get(pos.nodeId) ?? [];
        list.push(descriptor);
        pawnsByNode.set(pos.nodeId, list);
      } else {
        const edge = state.board.edges.find((e) => e.id === pos.edgeId);
        if (!edge) return;
        const other = edge.a === pos.nodeId ? edge.b : edge.a;
        const a = nodePos3D(pos.nodeId, state.worlds);
        const b = nodePos3D(other, state.worlds);
        const { start, end } = bridgeSpan(a, b, islandRadius(pos.nodeId), islandRadius(other));
        const progress = pos.progress ?? 1;
        // centro della tavola corrispondente (non il confine tra due tavole)
        const t = (progress - 0.5) / edge.length;
        const dip = Math.sin(t * Math.PI) * 0.35;
        const base = lerp3(start, end, t);
        bridgePawns.push({
          descriptor,
          point: [base[0] + Math.cos(descriptor.angle) * descriptor.offsetR * 0.3, base[1] - dip + 0.28, base[2] + Math.sin(descriptor.angle) * descriptor.offsetR * 0.3],
        });
      }
    });
  }

  // marcatori delle destinazioni raggiungibili dopo il tiro, per la scelta a click
  const highlightedNodeIds = new Set<string>();
  const midBridgeTargets: { neighborId: string; point: [number, number, number] }[] = [];

  if (directionChoice) {
    const originPos = nodePos3D(directionChoice.nodeId, state.worlds);
    for (const n of directionChoice.neighbors) {
      const edge = state.board.edges.find((e) => e.id === n.edgeId);
      if (!edge) continue;
      if (directionChoice.roll > edge.length) {
        highlightedNodeIds.add(n.neighborId);
      } else {
        const destPos = nodePos3D(n.neighborId, state.worlds);
        const { start, end } = bridgeSpan(
          originPos,
          destPos,
          islandRadius(directionChoice.nodeId),
          islandRadius(n.neighborId)
        );
        const t = (directionChoice.roll - 0.5) / edge.length;
        const dip = Math.sin(t * Math.PI) * 0.35;
        const base = lerp3(start, end, t);
        midBridgeTargets.push({ neighborId: n.neighborId, point: [base[0], base[1] - dip + 0.35, base[2]] });
      }
    }
  }

  return (
    <div style={{ width: "100%", height: "min(70vh, 640px)", borderRadius: 16, overflow: "hidden" }}>
      <Canvas shadows camera={{ position: [0, 19, 25], fov: 42 }} gl={{ alpha: true }}>
        <ambientLight intensity={0.55} />
        <directionalLight
          position={[12, 22, 8]}
          intensity={1.3}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[0, 5, 0]} intensity={1.1} color="#f0abfc" distance={22} />
        <fog attach="fog" args={["#170a2e", 28, 62]} />
        <OrbitControls
          enablePan={false}
          minDistance={12}
          maxDistance={46}
          maxPolarAngle={Math.PI / 2 - 0.04}
          target={[0, -2.5, 0]}
        />

        {state.board.edges.map((edge) => {
          const a = nodePos3D(edge.a, state.worlds);
          const b = nodePos3D(edge.b, state.worlds);
          const deactivated =
            state.deactivatedWorldIds.includes(edge.a) || state.deactivatedWorldIds.includes(edge.b);
          return (
            <Bridge3D
              key={edge.id}
              a={a}
              b={b}
              length={edge.length}
              radiusA={islandRadius(edge.a)}
              radiusB={islandRadius(edge.b)}
              surprises={edge.surprises}
              deactivated={deactivated}
            />
          );
        })}

        <FloatingIsland
          position={[0, 0, 0]}
          color="#c9a227"
          size={CITTADELLA_SIZE}
          seed={0}
          isCenter
          name="Cittadella"
          emoji="🏰"
          pawns={pawnsByNode.get("cittadella")}
          highlighted={highlightedNodeIds.has("cittadella")}
          onSelect={
            highlightedNodeIds.has("cittadella") && onSelectDirection
              ? () => onSelectDirection("cittadella")
              : undefined
          }
        />

        {state.worlds.map((w, i) => (
          <FloatingIsland
            key={w.id}
            position={nodePos3D(w.id, state.worlds)}
            color={w.colorFrom}
            deactivated={state.deactivatedWorldIds.includes(w.id)}
            size={WORLD_SIZE}
            seed={i + 1}
            name={w.name}
            emoji={w.emoji}
            pawns={pawnsByNode.get(w.id)}
            highlighted={highlightedNodeIds.has(w.id)}
            onSelect={
              highlightedNodeIds.has(w.id) && onSelectDirection ? () => onSelectDirection(w.id) : undefined
            }
          />
        ))}

        {bridgePawns.map(({ descriptor, point }) => (
          <PawnToken
            key={descriptor.key}
            position={point}
            color={descriptor.color}
            isCurrent={descriptor.isCurrent}
            name={descriptor.name}
            token={descriptor.token}
          />
        ))}

        {onSelectDirection &&
          midBridgeTargets.map((t) => (
            <TargetMarker key={t.neighborId} point={t.point} onSelect={() => onSelectDirection(t.neighborId)} />
          ))}
      </Canvas>
    </div>
  );
}
