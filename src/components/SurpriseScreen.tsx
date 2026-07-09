import { useEffect, useState } from "react";

interface Props {
  text: string;
  effectLabel: string;
  isMine: boolean;
  playerName: string;
  onClose: () => void;
}

export function SurpriseScreen({ text, effectLabel, isMine, playerName, onClose }: Props) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setRevealed(false);
    const t = setTimeout(() => setRevealed(true), 900);
    return () => clearTimeout(t);
  }, [text, effectLabel]);

  return (
    <div className="wheel-wrap">
      <h1 className="display" style={{ fontSize: "2.2rem" }}>
        ❔ Pesca Imprevisto
      </h1>

      <div className="surprise-deck-area">
        <div className="surprise-deck">
          <span>❔</span>
        </div>
        <div className={`surprise-card${revealed ? " revealed" : ""}`}>
          <span className="surprise-card-emoji">🎴</span>
        </div>
      </div>

      {revealed && (
        <>
          <div className="wheel-text-panel">
            <p>{text}</p>
            <p className="subtle" style={{ marginTop: "0.6rem" }}>
              {effectLabel}
            </p>
          </div>
          {isMine ? (
            <button className="btn" onClick={onClose}>
              OK
            </button>
          ) : (
            <p style={{ color: "var(--cream)", fontSize: "1rem" }}>
              <strong style={{ color: "var(--gold-soft)" }}>{playerName}</strong> ha pescato un
              imprevisto…
            </p>
          )}
        </>
      )}
    </div>
  );
}
