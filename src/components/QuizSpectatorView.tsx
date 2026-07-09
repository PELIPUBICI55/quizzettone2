import type { QuizQuestionPayload, QuizResultPayload } from "../../shared/types";

interface Props {
  payload: QuizQuestionPayload;
  result: QuizResultPayload | null;
  playerName: string;
}

export function QuizSpectatorView({ payload, result, playerName }: Props) {
  const { question, eliminatedOptionIndex } = payload;

  return (
    <div className="quiz-card">
      <p style={{ textAlign: "center", color: "var(--text-muted)" }}>
        🔎 Stai guardando la prova di <strong style={{ color: "var(--gold-soft)" }}>{playerName}</strong>
      </p>

      <div className="panel">
        <div className="quiz-category">{question.category}</div>
        <div className="quiz-question">{question.question}</div>

        <div className="quiz-options">
          {question.options.map((opt, i) => {
            if (i === eliminatedOptionIndex) return null;
            let cls = "quiz-option";
            if (result && i === result.correctIndex) cls += " correct";
            return (
              <button key={i} className={cls} disabled>
                {opt}
              </button>
            );
          })}
        </div>

        {result && (
          <p style={{ marginTop: "1rem", fontWeight: 700 }}>
            {result.correct
              ? `${playerName} ha risposto giusto! +${result.coinsAwarded} monete 🪙`
              : `${playerName} ha sbagliato risposta.`}
          </p>
        )}
      </div>
    </div>
  );
}
