import { useEffect, useState } from "react";
import type {
  GameStateSnapshot,
  TctEndedPayload,
  TctQuestionPayload,
  TctQuestionResultPayload,
  TctStartedPayload,
} from "../../shared/types";
import { socket } from "../socket";

interface Props {
  state: GameStateSnapshot;
  started: TctStartedPayload | null;
  question: TctQuestionPayload | null;
  questionResult: TctQuestionResultPayload | null;
  ended: TctEndedPayload | null;
  hasAnswered: boolean;
  onAnswered: () => void;
}

function nameOf(state: GameStateSnapshot, playerId: string): string {
  return state.players.find((p) => p.id === playerId)?.name ?? "?";
}

export function TctMinigame({
  state,
  started,
  question,
  questionResult,
  ended,
  hasAnswered,
  onAnswered,
}: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(question?.timeLimitSec ?? 10);

  useEffect(() => {
    setSelected(null);
    setSecondsLeft(question?.timeLimitSec ?? 10);
  }, [question?.questionIndex, question?.timeLimitSec]);

  useEffect(() => {
    if (!question || hasAnswered) return;
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, question, hasAnswered]);

  // --- Classifica finale -----------------------------------------------
  if (ended) {
    return (
      <div className="wheel-wrap">
        <h1 className="display" style={{ fontSize: "1.8rem", textAlign: "center" }}>
          🌊 Fine del tuffo nell'abisso!
        </h1>
        <div className="wheel-text-panel">
          <p>
            Montepremi: <strong style={{ color: "var(--gold-soft)" }}>🪙 {ended.potTotal}</strong>
          </p>
        </div>
        <div className="top5-list">
          {ended.standings.map((s, i) => (
            <div
              key={s.playerId}
              className={`top5-row${ended.winnerIds.includes(s.playerId) ? " revealed" : ""}`}
            >
              <span className="top5-rank">{i + 1}°</span>
              <span className="top5-answer">
                {nameOf(state, s.playerId)}
                {s.playerId === state.me.id ? " (tu)" : ""} — {s.totalPoints} punti
                {s.coinsWon > 0 ? ` (+${s.coinsWon} 🪙)` : ""}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- Risultati della domanda appena chiusa ----------------------------
  if (questionResult) {
    const iParticipated = questionResult.results.some((r) => r.playerId === state.me.id);
    return (
      <div className="wheel-wrap">
        <h1 className="display" style={{ fontSize: "1.6rem", textAlign: "center" }}>
          Domanda {questionResult.questionIndex + 1} — risultati
        </h1>
        <div className="wheel-text-panel top5-category-panel">
          <p className="subtle">Risposta esatta</p>
          <p style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--gold-soft)" }}>
            {questionResult.correctAnswerText}
          </p>
        </div>
        <div className="top5-list">
          {[...questionResult.results]
            .sort((a, b) => b.pointsAwarded - a.pointsAwarded)
            .map((r) => (
              <div key={r.playerId} className={`top5-row${r.correct ? " revealed" : ""}`}>
                <span className="top5-answer">
                  {nameOf(state, r.playerId)}
                  {r.playerId === state.me.id ? " (tu)" : ""} —{" "}
                  {r.correct ? `+${r.pointsAwarded} punti` : "risposta errata"}
                </span>
              </div>
            ))}
        </div>
        {!iParticipated && (
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            Non hai partecipato a questo round.
          </p>
        )}
      </div>
    );
  }

  // --- Domanda aperta, in attesa di risposte ----------------------------
  if (question) {
    const isParticipant = question.participantIds.includes(state.me.id);

    const answer = (index: number | null) => {
      if (!isParticipant || hasAnswered) return;
      setSelected(index);
      socket.emit("tct:answer", { answerIndex: index });
      onAnswered();
    };

    return (
      <div className="quiz-card">
        <div className="panel">
          <div className="quiz-category">
            🌊 TCT — Domanda {question.questionIndex + 1}/{question.totalQuestions}
          </div>
          <div className="quiz-question">{question.question.question}</div>

          <div className="quiz-timer-bar">
            <div
              className="quiz-timer-fill"
              style={{ width: `${Math.max(0, (secondsLeft / question.timeLimitSec) * 100)}%` }}
            />
          </div>

          {isParticipant ? (
            <>
              <div className="quiz-options">
                {question.question.options.map((opt, i) => (
                  <button
                    key={i}
                    className="quiz-option"
                    style={
                      selected === i
                        ? { borderColor: "var(--gold)", background: "#3d2523" }
                        : undefined
                    }
                    disabled={hasAnswered}
                    onClick={() => answer(i)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {hasAnswered && (
                <p style={{ marginTop: "1rem", fontWeight: 700, textAlign: "center" }}>
                  Risposta inviata! In attesa degli altri giocatori...
                </p>
              )}
            </>
          ) : (
            <p style={{ color: "var(--text-muted)", textAlign: "center", marginTop: "1rem" }}>
              Non hai abbastanza monete per partecipare a questo round: guardi da spettatore.
            </p>
          )}
        </div>
      </div>
    );
  }

  // --- Annuncio iniziale (partecipanti + montepremi) --------------------
  if (started) {
    return (
      <div className="wheel-wrap">
        <h1 className="display" style={{ fontSize: "1.8rem", textAlign: "center" }}>
          🌊 Tuffo nell'abisso!
        </h1>
        <div className="wheel-text-panel">
          <p>
            Partecipano ({started.participantIds.length}):{" "}
            {started.participantIds.map((id) => nameOf(state, id)).join(", ")}
          </p>
          <p>
            Quota d'ingresso: <strong>🪙 {started.entryFee}</strong> a testa — Montepremi:{" "}
            <strong style={{ color: "var(--gold-soft)" }}>🪙 {started.potTotal}</strong>
          </p>
        </div>
        <p style={{ color: "var(--cream)" }}>La prima domanda sta per arrivare...</p>
      </div>
    );
  }

  return null;
}
