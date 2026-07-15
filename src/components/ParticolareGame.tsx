import { useEffect, useRef, useState } from "react";
import type { ParticolareMediaControlPayload, ParticolareQuestionPayload } from "../../shared/types";
import { socket } from "../socket";

interface Props {
  payload: ParticolareQuestionPayload;
  isHost: boolean;
  isMine: boolean;
  playerName: string;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<void> | null = null;

// Carica l'IFrame Player API di YouTube una sola volta per l'intera app
// (script globale + callback globale), condivisa da tutte le istanze del
// componente che si susseguono durante la partita.
function loadYoutubeApi(): Promise<void> {
  if (youtubeApiPromise) return youtubeApiPromise;
  youtubeApiPromise = new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve();
      return;
    }
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve();
    };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
  });
  return youtubeApiPromise;
}

const YT_CONTAINER_ID = "particolare-yt-player";

// Il videoId arriva SEMPRE nel payload, anche per i client non-host: serve
// l'audio ovunque. È questo componente a nascondere visivamente il player
// (dimensione 1x1 fuori schermo) quando non si è l'host, cosi nessuno
// spoilera la risposta guardando titolo/anteprima del video.
export function ParticolareGame({ payload, isHost, isMine, playerName }: Props) {
  const playerRef = useRef<any>(null);
  const [, forceRerender] = useState(0);

  useEffect(() => {
    if (payload.media.kind !== "youtube") return;
    const videoId = payload.media.videoId;
    let cancelled = false;

    loadYoutubeApi().then(() => {
      if (cancelled) return;
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      playerRef.current = new window.YT.Player(YT_CONTAINER_ID, {
        videoId,
        playerVars: { autoplay: 0, controls: isHost ? 1 : 0 },
        events: {
          onReady: () => forceRerender((n) => n + 1),
        },
      });
    });

    return () => {
      cancelled = true;
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload.media.kind === "youtube" ? payload.media.videoId : null, isHost]);

  // Ogni client (host incluso) resta sincronizzato sulle azioni play/pausa/
  // riavvolgi decise dall'host, applicandole al proprio player locale.
  useEffect(() => {
    const onMediaControl = (msg: ParticolareMediaControlPayload) => {
      const player = playerRef.current;
      if (!player) return;
      if (msg.action === "play") player.playVideo?.();
      else if (msg.action === "pause") player.pauseVideo?.();
      else if (msg.action === "rewind") player.seekTo?.(0, true);
    };
    socket.on("particolare:mediaControl", onMediaControl);
    return () => {
      socket.off("particolare:mediaControl", onMediaControl);
    };
  }, []);

  const sendControl = (action: "play" | "pause" | "rewind") => {
    socket.emit("particolare:mediaControl", { action });
  };

  const isLastQuestion = payload.questionIndex >= payload.totalQuestions - 1;

  return (
    <div className="wheel-wrap">
      <div className="ocho-title-panel">
        <h1 className="display" style={{ fontSize: "1.6rem", textAlign: "center" }}>
          {payload.categoryEmoji} {payload.categoryName}
        </h1>
      </div>

      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center" }}>
        Domanda {payload.questionIndex + 1} di {payload.totalQuestions} —{" "}
        {isMine ? (
          "rispondi a voce!"
        ) : (
          <>
            <strong style={{ color: "var(--gold-soft)" }}>{playerName}</strong> risponde a voce...
          </>
        )}
      </p>

      {payload.media.kind === "image" ? (
        <div className="ocho-prompt-panel" style={{ textAlign: "center" }}>
          <img
            src={payload.media.detailUrl}
            alt="Dettaglio da indovinare"
            style={{ maxWidth: "100%", maxHeight: "42vh", borderRadius: "0.5rem" }}
          />
          {payload.revealed && payload.media.fullUrl && (
            <>
              <p className="subtle" style={{ marginTop: "0.6rem" }}>
                Foto intera:
              </p>
              <img
                src={payload.media.fullUrl}
                alt="Foto intera"
                style={{ maxWidth: "100%", maxHeight: "42vh", borderRadius: "0.5rem" }}
              />
            </>
          )}
        </div>
      ) : (
        <div className="ocho-prompt-panel" style={{ textAlign: "center" }}>
          <p className="subtle">
            {isHost ? "Solo tu vedi il video (per non spoilerare agli altri):" : "Ascolta l'audio..."}
          </p>
          <div
            id={YT_CONTAINER_ID}
            style={
              isHost
                ? { width: "100%", maxWidth: 480, aspectRatio: "16 / 9", margin: "0 auto" }
                : { width: 1, height: 1, overflow: "hidden", position: "absolute", left: -9999, top: -9999 }
            }
          />
          {isHost && (
            <div style={{ display: "flex", gap: "0.6rem", justifyContent: "center", marginTop: "0.6rem" }}>
              <button className="btn-outline" onClick={() => sendControl("rewind")}>
                ⏮ Riavvolgi
              </button>
              <button className="btn-outline" onClick={() => sendControl("play")}>
                ▶️ Play
              </button>
              <button className="btn-outline" onClick={() => sendControl("pause")}>
                ⏸ Pausa
              </button>
            </div>
          )}
        </div>
      )}

      {payload.revealed && (
        <div className="wheel-text-panel">
          <p className="subtle">Risposta</p>
          <p style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--gold-soft)" }}>{payload.answer}</p>
        </div>
      )}

      {isHost ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", alignItems: "center" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem", justifyContent: "center" }}>
            {!payload.revealed && (
              <button className="btn-outline" onClick={() => socket.emit("particolare:reveal")}>
                Svela risposta
              </button>
            )}
            {!isLastQuestion && (
              <button className="btn-outline" onClick={() => socket.emit("particolare:nextQuestion")}>
                Prossima domanda
              </button>
            )}
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "var(--cream)", marginBottom: "0.6rem" }}>
              Quante monete assegni a <strong style={{ color: "var(--gold-soft)" }}>{playerName}</strong>?
            </p>
            <div style={{ display: "flex", gap: "0.8rem", justifyContent: "center" }}>
              <button className="btn-outline" onClick={() => socket.emit("particolare:resolve", { coinsAwarded: 0 })}>
                0 🪙
              </button>
              <button className="btn-outline" onClick={() => socket.emit("particolare:resolve", { coinsAwarded: 50 })}>
                50 🪙
              </button>
              <button className="btn" onClick={() => socket.emit("particolare:resolve", { coinsAwarded: 100 })}>
                100 🪙
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>In attesa dell'host...</p>
      )}
    </div>
  );
}
