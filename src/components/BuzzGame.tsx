import { useEffect, useRef, useState } from "react";
import type { BuzzQuestionPayload, ParticolareMediaControlPayload, PlayerSummary } from "../../shared/types";
import { socket } from "../socket";

interface Props {
  payload: BuzzQuestionPayload;
  isHost: boolean;
  myId: string;
  players: PlayerSummary[];
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<void> | null = null;

// Stesso loader condiviso usato da ParticolareGame: l'IFrame Player API di
// YouTube va caricata una sola volta per l'intera app.
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

const YT_CONTAINER_ID = "buzz-yt-player";

// IL GRANDIOSO BUZZ: gioca TUTTA la sala insieme (non solo il giocatore di
// turno). Ognuno può premere il buzzer per prenotarsi la risposta; un
// pannello laterale mostra chi ha buzzato e in che ordine. Una sola domanda,
// che vale fissa 100 monete: l'host la assegna a uno dei giocatori (anche a
// nessuno) dopo aver sentito le risposte a voce.
export function BuzzGame({ payload, isHost, myId, players }: Props) {
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

  useEffect(() => {
    const onMediaControl = (msg: ParticolareMediaControlPayload) => {
      const player = playerRef.current;
      if (!player) return;
      if (msg.action === "play") player.playVideo?.();
      else if (msg.action === "pause") player.pauseVideo?.();
      else if (msg.action === "rewind") player.seekTo?.(0, true);
    };
    socket.on("buzz:mediaControl", onMediaControl);
    return () => {
      socket.off("buzz:mediaControl", onMediaControl);
    };
  }, []);

  const sendControl = (action: "play" | "pause" | "rewind") => {
    socket.emit("buzz:mediaControl", { action });
  };

  const hasBuzzed = payload.buzzOrder.includes(myId);
  const canBuzz = !payload.revealed;

  const nameFor = (playerId: string) => players.find((p) => p.id === playerId)?.name ?? "?";

  return (
    <div className="wheel-wrap">
      <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", flexWrap: "wrap", justifyContent: "center" }}>
        <div style={{ flex: "1 1 380px", maxWidth: 480, display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <div className="ocho-title-panel">
            <h1 className="display" style={{ fontSize: "1.6rem", textAlign: "center" }}>
              🔔 {payload.categoryEmoji} {payload.categoryName}
            </h1>
          </div>

          {payload.media.kind === "image" ? (
            <div className="ocho-prompt-panel" style={{ textAlign: "center" }}>
              <img
                src={payload.media.detailUrl}
                alt="Dettaglio da indovinare"
                style={{ maxWidth: "100%", maxHeight: "38vh", borderRadius: "0.5rem" }}
              />
              {payload.revealed && payload.media.fullUrl && (
                <>
                  <p className="subtle" style={{ marginTop: "0.6rem" }}>Foto intera:</p>
                  <img
                    src={payload.media.fullUrl}
                    alt="Foto intera"
                    style={{ maxWidth: "100%", maxHeight: "38vh", borderRadius: "0.5rem" }}
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
                    ? { width: "100%", maxWidth: 420, aspectRatio: "16 / 9", margin: "0 auto" }
                    : { width: 1, height: 1, overflow: "hidden", position: "absolute", left: -9999, top: -9999 }
                }
              />
              {isHost && (
                <div style={{ display: "flex", gap: "0.6rem", justifyContent: "center", marginTop: "0.6rem" }}>
                  <button className="btn-outline" onClick={() => sendControl("rewind")}>⏮ Riavvolgi</button>
                  <button className="btn-outline" onClick={() => sendControl("play")}>▶️ Play</button>
                  <button className="btn-outline" onClick={() => sendControl("pause")}>⏸ Pausa</button>
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

          <button
            className={hasBuzzed ? "btn-outline" : "btn"}
            disabled={hasBuzzed || !canBuzz}
            onClick={() => socket.emit("buzz:press")}
            style={{ fontSize: "1.3rem", padding: "0.9rem 2.4rem" }}
          >
            {hasBuzzed ? "Hai già buzzato!" : "🔔 BUZZ!"}
          </button>

          {isHost && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", alignItems: "center", width: "100%" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem", justifyContent: "center" }}>
                <button className="btn-outline" onClick={() => socket.emit("buzz:reset")}>
                  Resetta buzz
                </button>
                {!payload.revealed && (
                  <button className="btn-outline" onClick={() => socket.emit("buzz:reveal")}>
                    Svela risposta
                  </button>
                )}
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ color: "var(--cream)", marginBottom: "0.6rem" }}>
                  A chi assegni i 100 🪙?
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", justifyContent: "center" }}>
                  {players.map((p) => (
                    <button
                      key={p.id}
                      className="btn-outline"
                      onClick={() => socket.emit("buzz:resolve", { winnerId: p.id })}
                    >
                      {p.name}
                    </button>
                  ))}
                  <button
                    className="btn-outline"
                    onClick={() => socket.emit("buzz:resolve", { winnerId: null })}
                  >
                    Nessuno
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            flex: "0 0 220px",
            background: "var(--panel)",
            border: "2px solid var(--gold)",
            borderRadius: "0.75rem",
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            minHeight: 160,
          }}
        >
          <p style={{ fontWeight: 700, color: "var(--gold-soft)", margin: 0 }}>🔔 Ordine buzz</p>
          {payload.buzzOrder.length === 0 ? (
            <p className="subtle" style={{ margin: 0 }}>
              Nessuno ha ancora buzzato
            </p>
          ) : (
            payload.buzzOrder.map((playerId, i) => (
              <p key={playerId} style={{ color: "var(--cream)", margin: 0 }}>
                {i + 1}. {nameFor(playerId)}
              </p>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
