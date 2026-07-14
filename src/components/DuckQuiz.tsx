import { useEffect, useState } from "react";
import type { DuckAnswerResultPayload, DuckQuestionPayload } from "../../shared/types";
import { socket } from "../socket";

interface Props {
  payload: DuckQuestionPayload;
  result: DuckAnswerResultPayload | null;
  isMine: boolean;
  playerName: string;
}

// Quiz di ACCHIAPPA LA PAPERA: come OchoGame, nessun host è coinvolto, è il
// giocatore di turno stesso (isMine) a rispondere. A differenza del quiz
// generico non c'è un timer: il ritmo lo detta il giocatore, e dopo ogni
// risposta la scelta si colora di verde o rosso (stessa logica di
// QuizMinigame/QuizSpectatorView) prima di passare in automatico alla
// domanda successiva, alla griglia premi, o a un esito di fallimento.
export function DuckQuiz({ payload, result, isMine, playerName }: Props) {
  const { question, correctSoFar, wrongSoFar, questionIndex, totalQuestions } = payload;
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    setSelected(null);
  }, [questionIndex]);

  const answer = (index: number) => {
    if (!isMine || result || selected !== null) return;
    setSelected(index);
    socket.emit("duck:answer", { questionIndex, answerIndex: index });
  };

  return (
    <div className="wheel-wrap">
      <div className="ocho-title-panel">
        <h1 className="display" style={{ fontSize: "1.5rem", textAlign: "center" }}>
          🦆 {payload.categoryEmoji} {payload.categoryName}
        </h1>
      </div>

      <p className="ocho-progress-text" style={{ fontSize: "0.85rem", textAlign: "center" }}>
        Domanda {questionIndex + 1}/{totalQuestions} · ✅ {correctSoFar} corrette · ❌ {wrongSoFar}{" "}
        sbagliate (serve arrivare a 3 corrette)
      </p>

      <div className="quiz-card">
        <div className="panel">
          <div className="quiz-question">{question.question}</div>

          <div className="quiz-options">
            {question.options.map((opt, i) => {
              let cls = "quiz-option";
              if (result && selected === i) {
                cls += result.correct ? " correct" : " wrong";
              } else if (result && i === result.correctIndex) {
                cls += " correct";
              }
              return (
                <button
                  key={i}
                  className={cls}
                  disabled={!isMine || selected !== null || !!result}
                  onClick={() => answer(i)}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {!isMine && !result && (
            <p style={{ textAlign: "center", color: "var(--text-muted)", marginTop: "1rem" }}>
              🔎 <strong style={{ color: "var(--gold-soft)" }}>{playerName}</strong> sta rispondendo...
            </p>
          )}

          {result && (
            <p style={{ marginTop: "1rem", fontWeight: 700, textAlign: "center" }}>
              {result.correct ? "Esatto! ✅" : "Risposta sbagliata. ❌"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
