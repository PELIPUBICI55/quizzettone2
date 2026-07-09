import type { MinigameType } from "../../shared/types";
import { socket } from "../socket";

interface Props {
  resultType: MinigameType;
  isMine: boolean;
  playerName: string;
}

const RESULT_LABELS: Record<MinigameType, { emoji: string; label: string; description: string }> = {
  quiz: {
    emoji: "🧠",
    label: "Quiz a tempo!",
    description: "Una domanda, quattro risposte, il tempo stringe: scegli quella giusta.",
  },
};

export function WheelResultScreen({ resultType, isMine, playerName }: Props) {
  const info = RESULT_LABELS[resultType];

  return (
    <div className="wheel-wrap">
      <p style={{ color: "var(--gold-soft)", fontWeight: 600 }}>La ruota si è fermata su…</p>
      <h1 className="display" style={{ fontSize: "2.6rem" }}>
        {info.emoji} {info.label}
      </h1>
      <div className="wheel-text-panel">
        <p>{info.description}</p>
      </div>

      {isMine ? (
        <button className="btn" onClick={() => socket.emit("board:beginQuiz")}>
          Ok, iniziamo!
        </button>
      ) : (
        <p style={{ color: "var(--cream)", fontSize: "1rem" }}>
          In attesa che <strong style={{ color: "var(--gold-soft)" }}>{playerName}</strong> sia
          pronto…
        </p>
      )}
    </div>
  );
}
