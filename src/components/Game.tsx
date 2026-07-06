import { useEffect, useState, type CSSProperties } from "react";
import type { RoomState } from "../../shared/types";
import { submitAnswer } from "../socket";
import { useCountdown } from "../hooks/useCountdown";

interface Props {
  room: RoomState;
}

const OPTION_LABELS = ["A", "B", "C", "D"];

export function Game({ room }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const question = room.currentQuestion;
  const isQuestion = room.phase === "question";
  const isReveal = room.phase === "reveal";
  const resetKey = question ? `${room.questionIndex}-${question.question.id}` : room.questionIndex;

  const remainingMs = useCountdown(
    isQuestion,
    question?.timeLimitMs ?? 15000,
    resetKey
  );

  useEffect(() => {
    setSelected(null);
  }, [resetKey]);

  const handleSelect = (index: number) => {
    if (!isQuestion || selected !== null) return;
    setSelected(index);
    submitAnswer(index);
  };

  if (!question) return null;

  const progress = ((question.index + 1) / question.total) * 100;
  const timerRatio = remainingMs / question.timeLimitMs;
  const summary = room.lastSummary;

  return (
    <div className="app">
      <div className="bg-orbs" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <main className="game">
        <header className="game-top">
          <div className="progress-wrap">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>
          <div className="game-meta">
            <span className="category">{question.question.category}</span>
            <span>
              Domanda {question.index + 1} / {question.total}
            </span>
          </div>
        </header>

        <section className="card question-card">
          <div
            className={`timer-ring ${timerRatio < 0.25 ? "urgent" : ""}`}
            style={{ "--ratio": timerRatio } as CSSProperties}
          >
            <span>{Math.ceil(remainingMs / 1000)}s</span>
          </div>
          <h2>{question.question.text}</h2>
        </section>

        <section className="options">
          {question.question.options.map((option, index) => {
            let className = "option";
            if (selected === index) className += " selected";
            if (isReveal && summary && index === summary.correctIndex) className += " correct";
            if (
              isReveal &&
              summary &&
              selected === index &&
              index !== summary.correctIndex
            ) {
              className += " wrong";
            }

            return (
              <button
                key={index}
                className={className}
                disabled={!isQuestion || selected !== null}
                onClick={() => handleSelect(index)}
              >
                <span className="option-label">{OPTION_LABELS[index]}</span>
                <span>{option}</span>
              </button>
            );
          })}
        </section>

        {isReveal && summary && (
          <section className="card reveal-card">
            <h3>Risultati domanda</h3>
            <ul className="reveal-list">
              {summary.results.map((result) => (
                <li key={result.playerId} className={result.correct ? "hit" : "miss"}>
                  <span>{result.playerName}</span>
                  <span>
                    {result.correct ? `+${result.pointsEarned}` : "—"}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <aside className="scoreboard card">
          <h3>Classifica</h3>
          <ul>
            {room.players.map((player, i) => (
              <li key={player.id}>
                <span>
                  {i + 1}. {player.name}
                </span>
                <strong>{player.score}</strong>
              </li>
            ))}
          </ul>
        </aside>
      </main>
    </div>
  );
}
