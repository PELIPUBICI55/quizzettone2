import { useEffect, useState } from "react";
import type {
  CardDef,
  CardEffectType,
  OwnedCard,
  QuizQuestionPayload,
  QuizResultPayload,
} from "../../shared/types";
import { socket } from "../socket";
import { CardView } from "./CardView";

interface Props {
  payload: QuizQuestionPayload;
  result: QuizResultPayload | null;
  myCollection: OwnedCard[];
  cardCatalog: CardDef[];
  onUseCard: (cardId: string) => void;
  onBackToCittadella: () => void;
}

const EFFECT_LABELS: Record<CardEffectType, string> = {
  extraTime: "Tempo extra",
  removeWrongOption: "Aiuto attivo",
  doubleCoins: "Monete raddoppiate",
  secondChance: "Seconda chance",
  skipQuestion: "Salta domanda",
};

export function QuizMinigame({
  payload,
  result,
  myCollection,
  cardCatalog,
  onUseCard,
  onBackToCittadella,
}: Props) {
  const { question, activeEffects, eliminatedOptionIndex } = payload;
  const [selected, setSelected] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(question.timeLimitSec);

  useEffect(() => {
    setSelected(null);
    setSecondsLeft(question.timeLimitSec);
  }, [question.id, question.timeLimitSec]);

  useEffect(() => {
    if (result || selected !== null) return;
    if (secondsLeft <= 0) {
      answer(null);
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, result, selected]);

  const answer = (index: number | null) => {
    if (selected !== null || result) return;
    setSelected(index);
    socket.emit("quiz:answer", { questionId: question.id, answerIndex: index });
  };

  // carte in mano utilizzabili durante questa domanda: solo quelle con
  // almeno una copia il cui effetto non è ancora stato attivato
  const usableCardIds = [
    ...new Set(myCollection.filter((c) => !c.used).map((c) => c.cardId)),
  ];
  const cardsById = new Map(cardCatalog.map((c) => [c.id, c]));

  return (
    <div className="quiz-card">
      <button className="btn-outline" style={{ marginBottom: "1rem" }} onClick={onBackToCittadella}>
        ← Torna alla Cittadella
      </button>

      {activeEffects.length > 0 && (
        <div className="effects-row">
          {activeEffects.map((e, i) => (
            <span className="effect-chip" key={e + i}>
              {EFFECT_LABELS[e]} pronto
            </span>
          ))}
        </div>
      )}

      <div className="panel">
        <div className="quiz-category">{question.category}</div>
        <div className="quiz-question">{question.question}</div>

        <div className="quiz-timer-bar">
          <div
            className="quiz-timer-fill"
            style={{
              width: `${Math.max(0, (secondsLeft / question.timeLimitSec) * 100)}%`,
            }}
          />
        </div>

        <div className="quiz-options">
          {question.options.map((opt, i) => {
            if (i === eliminatedOptionIndex) return null;
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
                disabled={selected !== null || !!result}
                onClick={() => answer(i)}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {result && (
          <p style={{ marginTop: "1rem", fontWeight: 700 }}>
            {result.correct
              ? `Esatto! +${result.coinsAwarded} monete 🪙`
              : `Risposta sbagliata. ${
                  result.coinsAwarded > 0
                    ? `Hai comunque ricevuto ${result.coinsAwarded} monete grazie a un effetto.`
                    : "Nessuna moneta questa volta."
                }`}
          </p>
        )}
      </div>

      {!result && usableCardIds.length > 0 && (
        <>
          <h3 className="section-title">Usa una carta in questa domanda</h3>
          <div className="card-grid">
            {usableCardIds.map((id) => {
              const card = cardsById.get(id);
              if (!card) return null;
              return (
                <CardView key={id} card={card} onUse={() => onUseCard(id)} />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
