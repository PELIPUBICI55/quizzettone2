import { useEffect, useState } from "react";
import type {
  GameStateSnapshot,
  PackOpenedPayload,
  QuizQuestionPayload,
  QuizResultPayload,
  WheelSpinPayload,
} from "../shared/types";
import { socket } from "./socket";
import { JoinScreen } from "./components/JoinScreen";
import { Wheel } from "./components/Wheel";
import { QuizMinigame } from "./components/QuizMinigame";
import { Cittadella } from "./screens/Cittadella";
import { Board } from "./components/Board";
import { DiceOverlay } from "./components/DiceOverlay";
import { CardView } from "./components/CardView";

export default function App() {
  const [state, setState] = useState<GameStateSnapshot | null>(null);
  const [tab, setTab] = useState<"board" | "cittadella">("board");
  const [error, setError] = useState<string | null>(null);
  const [wheelInfo, setWheelInfo] = useState<WheelSpinPayload | null>(null);
  const [quizPayload, setQuizPayload] = useState<QuizQuestionPayload | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResultPayload | null>(null);
  const [packOpened, setPackOpened] = useState<PackOpenedPayload | null>(null);

  useEffect(() => {
    const onState = (s: GameStateSnapshot) => setState(s);
    const onWheel = (p: WheelSpinPayload) => {
      setWheelInfo(p);
      setQuizPayload(null);
      setQuizResult(null);
    };
    const onQuestion = (p: QuizQuestionPayload) => {
      setWheelInfo(null);
      setQuizPayload(p);
      setQuizResult(null);
    };
    const onResult = (p: QuizResultPayload) => setQuizResult(p);
    const onPack = (p: PackOpenedPayload) => setPackOpened(p);
    const onError = (p: { message: string }) => setError(p.message);
    const onDisconnect = () => setState(null);

    socket.on("state:update", onState);
    socket.on("wheel:spin", onWheel);
    socket.on("quiz:question", onQuestion);
    socket.on("quiz:result", onResult);
    socket.on("shop:packOpened", onPack);
    socket.on("error:message", onError);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("state:update", onState);
      socket.off("wheel:spin", onWheel);
      socket.off("quiz:question", onQuestion);
      socket.off("quiz:result", onResult);
      socket.off("shop:packOpened", onPack);
      socket.off("error:message", onError);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 4000);
    return () => clearTimeout(t);
  }, [error]);

  if (!state) {
    return (
      <div className="app-shell">
        {error && (
          <div className="error-banner" style={{ margin: "1rem" }}>
            {error}
          </div>
        )}
        <JoinScreen onError={setError} />
      </div>
    );
  }

  const closeQuiz = () => {
    setQuizPayload(null);
    setQuizResult(null);
    setWheelInfo(null);
    setTab("board");
  };

  const currentWorld = state.worlds.find((w) => w.id === wheelInfo?.worldId);

  return (
    <div className="app-shell">
      <DiceOverlay state={state} />
      <div className="topbar">
        <span className="title display">🎪 Quizzettone</span>
        <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
          Codice partita: <strong style={{ color: "var(--gold-soft)" }}>{state.code}</strong>
        </span>
        <span className="coin-pill">🪙 {state.me.coins}</span>
      </div>

      <div className="main-area">
        {error && <div className="error-banner">{error}</div>}

        {wheelInfo ? (
          <Wheel
            worldName={currentWorld?.name ?? ""}
            worldEmoji={currentWorld?.emoji ?? "🎡"}
          />
        ) : quizPayload ? (
          <QuizMinigame
            payload={quizPayload}
            result={quizResult}
            myCollection={state.me.collection}
            cardCatalog={state.cardCatalog}
            onUseCard={(cardId) => socket.emit("card:use", { cardId })}
            onClose={closeQuiz}
          />
        ) : (
          <>
            <div className="join-tabs" style={{ marginBottom: "1.5rem" }}>
              <button className={tab === "board" ? "active" : ""} onClick={() => setTab("board")}>
                🗺️ Mappa
              </button>
              <button className={tab === "cittadella" ? "active" : ""} onClick={() => setTab("cittadella")}>
                🏰 Cittadella
              </button>
            </div>
            {tab === "board" ? <Board state={state} /> : <Cittadella state={state} />}
          </>
        )}
      </div>

      {packOpened && (
        <div className="reveal-overlay" onClick={() => setPackOpened(null)}>
          <h2 className="display" style={{ fontSize: "2rem" }}>
            Hai aperto un pacchetto!
          </h2>
          <div className="card-grid" style={{ maxWidth: 560 }}>
            {packOpened.cards.map((c, i) => (
              <CardView key={i} card={c} />
            ))}
          </div>
          <button className="btn" onClick={() => setPackOpened(null)}>
            Continua
          </button>
        </div>
      )}
    </div>
  );
}
