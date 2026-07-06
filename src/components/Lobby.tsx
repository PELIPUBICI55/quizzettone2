import { useState } from "react";
import type { RoomState } from "../../shared/types";
import { buildJoinUrl } from "../../shared/links";
import { getLocalPlayerId, playAgain, startGame } from "../socket";

interface Props {
  room: RoomState;
}

export function Lobby({ room }: Props) {
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const playerId = getLocalPlayerId();
  const me = room.players.find((p) => p.id === playerId);
  const isHost = me?.isHost ?? false;
  const joinUrl = buildJoinUrl(room.code);

  const flashCopied = (kind: "code" | "link") => {
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 2000);
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(room.code);
    flashCopied("code");
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(joinUrl);
    flashCopied("link");
  };

  const shareLink = async () => {
    const payload = {
      title: "Quizzettone",
      text: `Unisciti alla mia partita di Quizzettone! Codice: ${room.code}`,
      url: joinUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(payload);
        return;
      } catch {
        // User cancelled or share failed — fall back to copy.
      }
    }

    await copyLink();
  };

  return (
    <div className="app">
      <div className="bg-orbs" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <main className="lobby">
        <header className="lobby-header">
          <p className="eyebrow">Stanza pronta</p>
          <h2>In attesa dei giocatori</h2>
        </header>

        <section className="card room-code-card">
          <p className="label">Invita i tuoi amici</p>
          <p className="room-code">{room.code}</p>
          <p className="join-url">{joinUrl}</p>
          <div className="code-actions">
            <button className="btn btn-primary" onClick={shareLink}>
              Condividi link
            </button>
            <button className="btn btn-secondary" onClick={copyLink}>
              {copied === "link" ? "Link copiato!" : "Copia link"}
            </button>
            <button className="btn btn-secondary" onClick={copyCode}>
              {copied === "code" ? "Codice copiato!" : "Copia codice"}
            </button>
          </div>
          <p className="share-hint">
            I tuoi amici aprono il link, inseriscono il nome e entrano come giocatori.
          </p>
        </section>

        <section className="card">
          <h3>Giocatori ({room.players.length})</h3>
          <ul className="player-list">
            {room.players.map((player) => (
              <li key={player.id} className={player.isHost ? "host" : ""}>
                <span>{player.name}</span>
                {player.isHost && <span className="badge">Host</span>}
              </li>
            ))}
          </ul>
        </section>

        {isHost ? (
          <button className="btn btn-primary btn-large" onClick={startGame}>
            Inizia il Quizzettone!
          </button>
        ) : (
          <p className="waiting">In attesa che l&apos;host avvii la partita...</p>
        )}
      </main>
    </div>
  );
}

export function ResultsFooter({ room }: Props) {
  const playerId = getLocalPlayerId();
  const isHost = room.players.find((p) => p.id === playerId)?.isHost ?? false;
  return isHost ? (
    <button className="btn btn-primary btn-large" onClick={playAgain}>
      Gioca ancora
    </button>
  ) : (
    <p className="waiting">In attesa che l&apos;host avvii una nuova partita...</p>
  );
}
