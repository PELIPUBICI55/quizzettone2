import { useEffect, useRef, useState } from "react";
import type {
  CaroAmicoPersonaDef,
  CaroAmicoState,
  ChooseTargetPayload,
  GameStateSnapshot,
  MinigameType,
  PackOpenedPayload,
  QuizQuestionPayload,
  QuizResultPayload,
  TctEndedPayload,
  TctQuestionPayload,
  TctQuestionResultPayload,
  TctStartedPayload,
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
import { CaroAmicoSelfChoice } from "./components/CaroAmicoSelfChoice";
import { CaroAmicoWheel } from "./components/CaroAmicoWheel";
import { CaroAmicoPersonaReveal } from "./components/CaroAmicoPersonaReveal";
import { CaroAmicoGame } from "./components/CaroAmicoGame";
import { TctMinigame } from "./components/TctMinigame";
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
  const [top5CategoryInfo, setTop5CategoryInfo] = useState<{
    playerId: string;
    categoryId: string;
    categoryName: string;
    categoryEmoji: string;
  } | null>(null);
  const [top5State, setTop5State] = useState<Top5State | null>(null);
  const [caroAmicoSelfChoiceInfo, setCaroAmicoSelfChoiceInfo] = useState<{
    playerId: string;
    personas: CaroAmicoPersonaDef[];
    currentSelfId: string | null;
  } | null>(null);
  const [caroAmicoSpinInfo, setCaroAmicoSpinInfo] = useState<{
    playerId: string;
    durationMs: number;
  } | null>(null);
  const [caroAmicoPersonaInfo, setCaroAmicoPersonaInfo] = useState<{
    playerId: string;
    personaId: string;
    personaName: string;
    personaEmoji: string;
  } | null>(null);
  const [caroAmicoState, setCaroAmicoState] = useState<CaroAmicoState | null>(null);
  const [tctStartedInfo, setTctStartedInfo] = useState<TctStartedPayload | null>(null);
  const [tctQuestionInfo, setTctQuestionInfo] = useState<TctQuestionPayload | null>(null);
  const [tctQuestionResultInfo, setTctQuestionResultInfo] =
    useState<TctQuestionResultPayload | null>(null);
  const [tctEndedInfo, setTctEndedInfo] = useState<TctEndedPayload | null>(null);
  const [tctHasAnswered, setTctHasAnswered] = useState(false);
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
      setCaroAmicoSelfChoiceInfo(null);
      setCaroAmicoSpinInfo(null);
      setCaroAmicoPersonaInfo(null);
      setCaroAmicoState(null);
      setTctStartedInfo(null);
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
    const onTop5Category = (p: {
      playerId: string;
      categoryId: string;
      categoryName: string;
      categoryEmoji: string;
    }) => {
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
    const onCaroAmicoSelfChoice = (p: {
      playerId: string;
      personas: CaroAmicoPersonaDef[];
      currentSelfId: string | null;
    }) => {
      setWelcomeInfo(null);
      setCaroAmicoSelfChoiceInfo(p);
      setCaroAmicoSpinInfo(null);
      setCaroAmicoPersonaInfo(null);
      setCaroAmicoState(null);
    };
    const onCaroAmicoSpin = (p: { playerId: string; durationMs: number }) => {
      setCaroAmicoSelfChoiceInfo(null);
      setCaroAmicoSpinInfo(p);
      setCaroAmicoPersonaInfo(null);
      setCaroAmicoState(null);
    };
    const onCaroAmicoPersona = (p: {
      playerId: string;
      personaId: string;
      personaName: string;
      personaEmoji: string;
    }) => {
      setCaroAmicoSpinInfo(null);
      setCaroAmicoPersonaInfo(p);
      setCaroAmicoState(null);
    };
    const onCaroAmicoState = (p: CaroAmicoState) => {
      setCaroAmicoSpinInfo(null);
      setCaroAmicoPersonaInfo(null);
      setCaroAmicoState(p);
    };
    const onCaroAmicoEnded = () => {
      setCaroAmicoState(null);
      setCaroAmicoSpinInfo(null);
      setCaroAmicoPersonaInfo(null);
    };
    const onTctStarted = (p: TctStartedPayload) => {
      setWelcomeInfo(null);
      setTctStartedInfo(p);
      setTctQuestionInfo(null);
      setTctQuestionResultInfo(null);
      setTctEndedInfo(null);
    };
    const onTctQuestion = (p: TctQuestionPayload) => {
      setTctStartedInfo(null);
      setTctQuestionInfo(p);
      setTctQuestionResultInfo(null);
      setTctHasAnswered(false);
    };
    const onTctQuestionResult = (p: TctQuestionResultPayload) => {
      setTctQuestionInfo(null);
      setTctQuestionResultInfo(p);
    };
    const onTctEnded = (p: TctEndedPayload) => {
      setTctStartedInfo(null);
      setTctQuestionInfo(null);
      setTctQuestionResultInfo(null);
      setTctEndedInfo(p);
    };
    const onTctSkipped = (p: { reason: string }) => setError(p.reason);
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
    socket.on("caroamico:selfChoicePrompt", onCaroAmicoSelfChoice);
    socket.on("caroamico:spin", onCaroAmicoSpin);
    socket.on("caroamico:personaDrawn", onCaroAmicoPersona);
    socket.on("caroamico:state", onCaroAmicoState);
    socket.on("caroamico:ended", onCaroAmicoEnded);
    socket.on("tct:started", onTctStarted);
    socket.on("tct:question", onTctQuestion);
    socket.on("tct:questionResult", onTctQuestionResult);
    socket.on("tct:ended", onTctEnded);
    socket.on("tct:skipped", onTctSkipped);
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
      socket.off("caroamico:selfChoicePrompt", onCaroAmicoSelfChoice);
      socket.off("caroamico:spin", onCaroAmicoSpin);
      socket.off("caroamico:personaDrawn", onCaroAmicoPersona);
      socket.off("caroamico:state", onCaroAmicoState);
      socket.off("caroamico:ended", onCaroAmicoEnded);
      socket.off("tct:started", onTctStarted);
      socket.off("tct:question", onTctQuestion);
      socket.off("tct:questionResult", onTctQuestionResult);
      socket.off("tct:ended", onTctEnded);
      socket.off("tct:skipped", onTctSkipped);
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
    setCaroAmicoSelfChoiceInfo((prev) => (prev && prev.playerId !== state.me.id ? null : prev));
    setCaroAmicoSpinInfo((prev) => (prev && prev.playerId !== state.me.id ? null : prev));
    setCaroAmicoPersonaInfo((prev) => (prev && prev.playerId !== state.me.id ? null : prev));
    setCaroAmicoState((prev) => (prev && prev.playerId !== state.me.id ? null : prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.currentTurnPlayerId]);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 4000);
    return () => clearTimeout(t);
  }, [error]);

  useEffect(() => {
    if (!tctEndedInfo) return;
    const t = setTimeout(() => setTctEndedInfo(null), 6000);
    return () => clearTimeout(t);
  }, [tctEndedInfo]);

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
  const caroAmicoSelfChoicePlayer = state.players.find(
    (p) => p.id === caroAmicoSelfChoiceInfo?.playerId
  );
  const caroAmicoSpinPlayer = state.players.find((p) => p.id === caroAmicoSpinInfo?.playerId);
  const caroAmicoPersonaPlayer = state.players.find(
    (p) => p.id === caroAmicoPersonaInfo?.playerId
  );
  const caroAmicoStatePlayer = state.players.find((p) => p.id === caroAmicoState?.playerId);
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
        ) : tctStartedInfo || tctQuestionInfo || tctQuestionResultInfo || tctEndedInfo ? (
          <TctMinigame
            state={state}
            started={tctStartedInfo}
            question={tctQuestionInfo}
            questionResult={tctQuestionResultInfo}
            ended={tctEndedInfo}
            hasAnswered={tctHasAnswered}
            onAnswered={() => setTctHasAnswered(true)}
          />
        ) : welcomeInfo ? (
          <WelcomeScreen
            world={currentWorld}
            isMine={welcomeInfo.playerId === state.me.id}
            playerName={welcomePlayer?.name ?? "?"}
            players={state.players}
          />
        ) : caroAmicoSelfChoiceInfo ? (
          <CaroAmicoSelfChoice
            personas={caroAmicoSelfChoiceInfo.personas}
            currentSelfId={caroAmicoSelfChoiceInfo.currentSelfId}
            isMine={caroAmicoSelfChoiceInfo.playerId === state.me.id}
            playerName={caroAmicoSelfChoicePlayer?.name ?? "?"}
          />
        ) : caroAmicoSpinInfo ? (
          <CaroAmicoWheel
            isMine={caroAmicoSpinInfo.playerId === state.me.id}
            playerName={caroAmicoSpinPlayer?.name ?? "?"}
          />
        ) : caroAmicoPersonaInfo ? (
          <CaroAmicoPersonaReveal
            personaName={caroAmicoPersonaInfo.personaName}
            personaEmoji={caroAmicoPersonaInfo.personaEmoji}
            isMine={caroAmicoPersonaInfo.playerId === state.me.id}
            playerName={caroAmicoPersonaPlayer?.name ?? "?"}
          />
        ) : caroAmicoState ? (
          <CaroAmicoGame
            state={caroAmicoState}
            isHost={state.me.isHost}
            playerName={caroAmicoStatePlayer?.name ?? "?"}
          />
        ) : top5SpinInfo ? (
          <Top5Wheel
            isMine={top5SpinInfo.playerId === state.me.id}
            playerName={top5SpinPlayer?.name ?? "?"}
          />
        ) : top5CategoryInfo ? (
          <Top5CategoryReveal
            categoryName={top5CategoryInfo.categoryName}
            categoryEmoji={top5CategoryInfo.categoryEmoji}
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
