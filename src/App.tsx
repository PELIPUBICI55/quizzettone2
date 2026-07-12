import { useEffect, useRef, useState } from "react";
import type {
  ChooseTargetPayload,
  GameStateSnapshot,
  MinigameType,
  PackOpenedPayload,
  QuizQuestionPayload,
  QuizResultPayload,
  Top5State,
  WheelSpinPayload,
} from "../shared/types";
import { socket } from "./socket";
import { JoinScreen } from "./components/JoinScreen";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { Wheel } from "./components/Wheel";
import { WheelResultScreen } from "./components/WheelResultScreen";
import { Top5Wheel } from "./components/Top5Wheel";
import { Top5CategoryReveal } from "./components/Top5CategoryReveal";
import { Top5Game } from "./components/Top5Game";
import { SurpriseScreen } from "./components/SurpriseScreen";
import { ChooseTargetScreen } from "./components/ChooseTargetScreen";
import { ShieldPromptScreen } from "./components/ShieldPromptScreen";
import { QuizMinigame } from "./components/QuizMinigame";
import { QuizSpectatorView } from "./components/QuizSpectatorView";
import { Cittadella } from "./screens/Cittadella";
import { Lobby } from "./screens/Lobby";
import { TurnOrderReveal } from "./screens/TurnOrderReveal";
import { Board } from "./components/Board";
import { DiceOverlay } from "./components/DiceOverlay";
import { CollectionMenu } from "./components/CollectionMenu";
import { FullCollectionMenu } from "./components/FullCollectionMenu";
import { PartyMenu } from "./components/PartyMenu";
import { StatusMenu } from "./components/StatusMenu";
import { CardView } from "./components/CardView";

export default function App() {
  const [state, setState] = useState<GameStateSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [welcomeInfo, setWelcomeInfo] = useState<{ playerId: string; worldId: string } | null>(null);
  const [wheelInfo, setWheelInfo] = useState<WheelSpinPayload | null>(null);
  const [wheelResultInfo, setWheelResultInfo] = useState<{
    playerId: string;
    worldId: string;
    resultType: MinigameType;
  } | null>(null);
  const [quizPayload, setQuizPayload] = useState<QuizQuestionPayload | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResultPayload | null>(null);
  const [top5SpinInfo, setTop5SpinInfo] = useState<{ playerId: string; durationMs: number } | null>(
    null
  );
  const [top5CategoryInfo, setTop5CategoryInfo] = useState<{ playerId: string; title: string } | null>(
    null
  );
  const [top5State, setTop5State] = useState<Top5State | null>(null);
  const [packOpened, setPackOpened] = useState<PackOpenedPayload | null>(null);
  const [surpriseInfo, setSurpriseInfo] = useState<{ playerId: string; text: string; effectLabel: string } | null>(
    null
  );
  const [chooseTargetInfo, setChooseTargetInfo] = useState<ChooseTargetPayload | null>(null);
  const [shieldPromptInfo, setShieldPromptInfo] = useState<{ message: string } | null>(null);
  const [showTurnOrder, setShowTurnOrder] = useState(false);
  const prevPhase = useRef<"lobby" | "playing" | null>(null);

  useEffect(() => {
    const onState = (s: GameStateSnapshot) => {
      if (prevPhase.current === "lobby" && s.phase === "playing") {
        setShowTurnOrder(true);
      }
      prevPhase.current = s.phase;
      setState(s);
    };
    const onWelcome = (p: { playerId: string; worldId: string }) => {
      setWelcomeInfo(p);
      setWheelInfo(null);
      setWheelResultInfo(null);
      setQuizPayload(null);
      setQuizResult(null);
      setTop5SpinInfo(null);
      setTop5State(null);
    };
    const onWheel = (p: WheelSpinPayload) => {
      setWelcomeInfo(null);
      setWheelInfo(p);
      setWheelResultInfo(null);
      setQuizPayload(null);
      setQuizResult(null);
    };
    const onWheelResult = (p: { playerId: string; worldId: string; resultType: MinigameType }) => {
      setWheelInfo(null);
      setWheelResultInfo(p);
    };
    const onQuestion = (p: QuizQuestionPayload) => {
      setWheelResultInfo(null);
      setQuizPayload(p);
      setQuizResult(null);
    };
    const onResult = (p: QuizResultPayload) => setQuizResult(p);
    const onTop5Spin = (p: { playerId: string; durationMs: number }) => {
      setWelcomeInfo(null);
      setTop5SpinInfo(p);
      setTop5CategoryInfo(null);
      setTop5State(null);
    };
    const onTop5Category = (p: { playerId: string; title: string }) => {
      setTop5SpinInfo(null);
      setTop5CategoryInfo(p);
      setTop5State(null);
    };
    const onTop5State = (p: Top5State) => {
      setTop5SpinInfo(null);
      setTop5CategoryInfo(null);
      setTop5State(p);
    };
    const onTop5Ended = () => {
      setTop5State(null);
      setTop5SpinInfo(null);
      setTop5CategoryInfo(null);
    };
    const onPack = (p: PackOpenedPayload) => setPackOpened(p);
    const onSurpriseDrawn = (p: { playerId: string; text: string; effectLabel: string }) => {
      setSurpriseInfo(p);
      setChooseTargetInfo(null);
    };
    const onChooseTarget = (p: ChooseTargetPayload) => setChooseTargetInfo(p);
    const onShieldPrompt = (p: { message: string }) => setShieldPromptInfo(p);
    const onShieldUsed = () => setShieldPromptInfo(null);
    const onError = (p: { message: string }) => setError(p.message);
    const onKicked = () => {
      setState(null);
      setShowTurnOrder(false);
      prevPhase.current = null;
      setError("Sei stato espulso dalla partita dall'host.");
    };
    const onDisconnect = () => setState(null);

    socket.on("state:update", onState);
    socket.on("world:welcome", onWelcome);
    socket.on("wheel:spin", onWheel);
    socket.on("wheel:result", onWheelResult);
    socket.on("quiz:question", onQuestion);
    socket.on("quiz:result", onResult);
    socket.on("top5:spin", onTop5Spin);
    socket.on("top5:categoryDrawn", onTop5Category);
    socket.on("top5:state", onTop5State);
    socket.on("top5:ended", onTop5Ended);
    socket.on("shop:packOpened", onPack);
    socket.on("board:surpriseDrawn", onSurpriseDrawn);
    socket.on("board:chooseTarget", onChooseTarget);
    socket.on("board:useShieldPrompt", onShieldPrompt);
    socket.on("board:shieldUsed", onShieldUsed);
    socket.on("error:message", onError);
    socket.on("party:kicked", onKicked);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("state:update", onState);
      socket.off("world:welcome", onWelcome);
      socket.off("wheel:spin", onWheel);
      socket.off("wheel:result", onWheelResult);
      socket.off("quiz:question", onQuestion);
      socket.off("quiz:result", onResult);
      socket.off("top5:spin", onTop5Spin);
      socket.off("top5:categoryDrawn", onTop5Category);
      socket.off("top5:state", onTop5State);
      socket.off("top5:ended", onTop5Ended);
      socket.off("shop:packOpened", onPack);
      socket.off("board:surpriseDrawn", onSurpriseDrawn);
      socket.off("board:chooseTarget", onChooseTarget);
      socket.off("board:useShieldPrompt", onShieldPrompt);
      socket.off("board:shieldUsed", onShieldUsed);
      socket.off("error:message", onError);
      socket.off("party:kicked", onKicked);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  useEffect(() => {
    if (!state) return;
    setWelcomeInfo((prev) => (prev && prev.playerId !== state.me.id ? null : prev));
    setWheelInfo((prev) => (prev && prev.playerId !== state.me.id ? null : prev));
    setWheelResultInfo((prev) => (prev && prev.playerId !== state.me.id ? null : prev));
    setSurpriseInfo((prev) => (prev && prev.playerId !== state.me.id ? null : prev));
    setQuizPayload((prev) => (prev && prev.playerId !== state.me.id ? null : prev));
    setQuizResult((prev) => (prev && prev.playerId !== state.me.id ? null : prev));
    setTop5SpinInfo((prev) => (prev && prev.playerId !== state.me.id ? null : prev));
    setTop5CategoryInfo((prev) => (prev && prev.playerId !== state.me.id ? null : prev));
    setTop5State((prev) => (prev && prev.playerId !== state.me.id ? null : prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.currentTurnPlayerId]);

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

  if (state.phase === "lobby") {
    return (
      <div className="app-shell">
        {error && (
          <div className="error-banner" style={{ margin: "1rem" }}>
            {error}
          </div>
        )}
        <Lobby state={state} />
      </div>
    );
  }

  if (showTurnOrder) {
    return (
      <div className="app-shell">
        <TurnOrderReveal state={state} onContinue={() => setShowTurnOrder(false)} />
      </div>
    );
  }

  const closeQuiz = () => {
    setQuizPayload(null);
    setQuizResult(null);
    setWheelInfo(null);
  };

  const closeSurprise = () => {
    socket.emit("board:closeSurprise");
    setSurpriseInfo(null);
  };

  const submitChoice = (optionId: string) => {
    socket.emit("board:submitChoice", { optionId });
    setChooseTargetInfo(null);
  };

  const respondShield = (use: boolean) => {
    socket.emit("board:useShieldResponse", { use });
    setShieldPromptInfo(null);
  };

  const currentWorld = state.worlds.find(
    (w) => w.id === (welcomeInfo?.worldId ?? wheelInfo?.worldId)
  );
  const welcomePlayer = state.players.find((p) => p.id === welcomeInfo?.playerId);
  const wheelPlayer = state.players.find((p) => p.id === wheelInfo?.playerId);
  const wheelResultPlayer = state.players.find((p) => p.id === wheelResultInfo?.playerId);
  const top5SpinPlayer = state.players.find((p) => p.id === top5SpinInfo?.playerId);
  const top5CategoryPlayer = state.players.find((p) => p.id === top5CategoryInfo?.playerId);
  const top5StatePlayer = state.players.find((p) => p.id === top5State?.playerId);
  const surprisePlayer = state.players.find((p) => p.id === surpriseInfo?.playerId);
  const quizPlayer = state.players.find((p) => p.id === quizPayload?.playerId);

  return (
    <div className="app-shell">
      <DiceOverlay state={state} />
      <div className="topbar">
        <span className="title display">🎪 Quizzettone</span>
        <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
          Codice partita: <strong style={{ color: "var(--gold-soft)" }}>{state.code}</strong>
        </span>
        <span className="coin-pill">🪙 {state.me.coins}</span>
        <PartyMenu state={state} />
        <StatusMenu state={state} />
        <CollectionMenu state={state} />
        <FullCollectionMenu state={state} />
      </div>

      <div className="main-area">
        {error && <div className="error-banner">{error}</div>}

        {shieldPromptInfo ? (
          <ShieldPromptScreen message={shieldPromptInfo.message} onRespond={respondShield} />
        ) : welcomeInfo ? (
          <WelcomeScreen
            world={currentWorld}
            isMine={welcomeInfo.playerId === state.me.id}
            playerName={welcomePlayer?.name ?? "?"}
          />
        ) : top5SpinInfo ? (
          <Top5Wheel
            isMine={top5SpinInfo.playerId === state.me.id}
            playerName={top5SpinPlayer?.name ?? "?"}
          />
        ) : top5CategoryInfo ? (
          <Top5CategoryReveal
            title={top5CategoryInfo.title}
            isMine={top5CategoryInfo.playerId === state.me.id}
            playerName={top5CategoryPlayer?.name ?? "?"}
          />
        ) : top5State ? (
          <Top5Game
            state={top5State}
            isHost={state.me.isHost}
            playerName={top5StatePlayer?.name ?? "?"}
          />
        ) : wheelInfo ? (
          <Wheel
            worldName={currentWorld?.name ?? ""}
            worldEmoji={currentWorld?.emoji ?? "🎡"}
            playerName={wheelPlayer?.name ?? "?"}
            isMine={wheelInfo.playerId === state.me.id}
          />
        ) : wheelResultInfo ? (
          <WheelResultScreen
            resultType={wheelResultInfo.resultType}
            isMine={wheelResultInfo.playerId === state.me.id}
            playerName={wheelResultPlayer?.name ?? "?"}
          />
        ) : surpriseInfo ? (
          <SurpriseScreen
            text={surpriseInfo.text}
            effectLabel={surpriseInfo.effectLabel}
            isMine={surpriseInfo.playerId === state.me.id}
            playerName={surprisePlayer?.name ?? "?"}
            onClose={closeSurprise}
          />
        ) : chooseTargetInfo ? (
          <ChooseTargetScreen payload={chooseTargetInfo} onSelect={submitChoice} />
        ) : quizPayload ? (
          quizPayload.playerId === state.me.id ? (
            <QuizMinigame
              payload={quizPayload}
              result={quizResult}
              onClose={closeQuiz}
            />
          ) : (
            <QuizSpectatorView payload={quizPayload} result={quizResult} playerName={quizPlayer?.name ?? "?"} />
          )
        ) : (
          state.me.pendingShop ? <Cittadella state={state} /> : <Board state={state} />
        )}
      </div>

      {packOpened && (
        <div className="reveal-overlay" onClick={() => setPackOpened(null)}>
          <h2 className="display" style={{ fontSize: "2rem" }}>
            Hai aperto un pacchetto!
          </h2>
          <div className="card-grid" style={{ maxWidth: 560 }}>
            {packOpened.cards.map((entry, i) => (
              <CardView key={i} card={entry.card} capped={entry.capped} />
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
