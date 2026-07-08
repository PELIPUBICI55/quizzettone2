import { useEffect, useRef, useState } from "react";
import { socket } from "../socket";
import type { GameStateSnapshot } from "../../shared/types";

// Rotazione necessaria per portare ciascuna faccia verso la camera
// (le facce sono fisse: front=1, back=6, right=2, left=5, top=3, bottom=4)
const FACE_ROTATION: Record<number, { x: number; y: number }> = {
  1: { x: 0, y: 0 },
  6: { x: 0, y: 180 },
  2: { x: 0, y: -90 },
  5: { x: 0, y: 90 },
  3: { x: -90, y: 0 },
  4: { x: 90, y: 0 },
};

const PIPS: Record<number, string[]> = {
  1: ["cc"],
  2: ["tl", "br"],
  3: ["tl", "cc", "br"],
  4: ["tl", "tr", "bl", "br"],
  5: ["tl", "tr", "cc", "bl", "br"],
  6: ["tl", "tr", "ml", "mr", "bl", "br"],
};

function Face({ number, className }: { number: number; className: string }) {
  return (
    <div className={`dice-face ${className}`}>
      {PIPS[number].map((pos) => (
        <div key={pos} className={`dice-pip pip-${pos}`} />
      ))}
    </div>
  );
}

interface Props {
  state: GameStateSnapshot | null;
}

export function DiceOverlay({ state }: Props) {
  const [visible, setVisible] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [rollerName, setRollerName] = useState("");
  const [value, setValue] = useState(1);
  const rollCount = useRef(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onRoll = (p: { playerId: string; value: number }) => {
      rollCount.current += 1;
      const n = rollCount.current;
      const face = FACE_ROTATION[p.value] ?? { x: 0, y: 0 };

      const spinsX = 3 + (n % 3);
      const spinsY = 4 + ((n * 2) % 3);
      const finalRotation = {
        x: face.x + spinsX * 360 * (n % 2 === 0 ? 1 : -1),
        y: face.y + spinsY * 360 * (n % 3 === 0 ? 1 : -1),
      };

      // Riparte da zero: questo \u00e8 il primo paint del cubo appena rimontato,
      // quindi non c'\u00e8 ancora nessuna transizione da vedere qui.
      setRotation({ x: 0, y: 0 });
      setValue(p.value);
      setRollerName(
        state?.players.find((pl) => pl.id === p.playerId)?.name ?? "Qualcuno"
      );
      setVisible(true);

      // Aspetta che il browser abbia dipinto lo stato iniziale, poi passa
      // alla rotazione finale: solo un cambiamento DOPO il mount fa scattare
      // davvero la transizione CSS definita su .dice-cube.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setRotation(finalRotation);
        });
      });

      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setVisible(false), 2400);
    };

    socket.on("board:diceRolled", onRoll);
    return () => {
      socket.off("board:diceRolled", onRoll);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (!visible) return null;

  return (
    <div className="dice-overlay" key={rollCount.current}>
      <div className="dice-stage">
        <div className="dice-drop">
          <div className="dice-scene">
            <div
              className="dice-cube"
              style={{ transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}
            >
              <Face number={1} className="dice-face--front" />
              <Face number={6} className="dice-face--back" />
              <Face number={2} className="dice-face--right" />
              <Face number={5} className="dice-face--left" />
              <Face number={3} className="dice-face--top" />
              <Face number={4} className="dice-face--bottom" />
            </div>
          </div>
        </div>
        <div className="dice-shadow" />
      </div>
      <p className="dice-result-label">
        {rollerName} ha tirato un {value}!
      </p>
    </div>
  );
}
