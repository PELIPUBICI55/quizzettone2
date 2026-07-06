import { useEffect, useState } from "react";
import { parseInviteFromLocation } from "../shared/links";
import { createRoom, joinRoom } from "./socket";
import { useRoomState } from "./hooks/useRoomState";
import { Lobby } from "./components/Lobby";
import { Game } from "./components/Game";
import { Results } from "./components/Results";

type Screen = "home" | "join";

function clearInviteFromUrl() {
  window.history.replaceState({}, "", "/");
}

export default function App() {
  const room = useRoomState();
  const [screen, setScreen] = useState<Screen>("home");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const invited = parseInviteFromLocation(window.location);
    if (invited) {
      setInviteCode(invited);
      setCode(invited);
      setScreen("join");
    }
  }, []);

  const handleCreate = () => {
    setError("");
    setLoading(true);
    createRoom(name, (result) => {
      setLoading(false);
      if (!result.ok) setError(result.error);
      else clearInviteFromUrl();
    });
  };

  const handleJoin = () => {
    setError("");
    setLoading(true);
    joinRoom(code, name, (result) => {
      setLoading(false);
      if (!result.ok) setError(result.error);
      else clearInviteFromUrl();
    });
  };

  if (room) {
    if (room.phase === "lobby") return <Lobby room={room} />;
    if (room.phase === "finished") return <Results room={room} />;
    return <Game room={room} />;
  }

  const joiningViaLink = screen === "join" && inviteCode !== null;

  return (
    <div className="app">
      <div className="bg-orbs" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <main className="home">
        <header className="hero">
          <p className="eyebrow">Grandioso Giuoco di</p>
          <h1>Quizzettone</h1>
          <p className="subtitle">conoscenze generali</p>
          <p className="tagline">
            Crea una stanza, invita gli amici con un link e sfidati a colpi di cultura generale.
          </p>
        </header>

        {joiningViaLink && (
          <section className="invite-banner card">
            <p className="eyebrow">Invito ricevuto</p>
            <p>
              Sei stato invitato alla stanza{" "}
              <strong className="invite-code">{inviteCode}</strong>
            </p>
            <p className="invite-hint">Inserisci il tuo nome e unisciti alla partita.</p>
          </section>
        )}

        <section className="card panel">
          <label className="field">
            <span>Il tuo nome</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Es. Marco"
              maxLength={20}
              autoFocus
            />
          </label>

          {screen === "home" ? (
            <>
              <button
                className="btn btn-primary"
                disabled={!name.trim() || loading}
                onClick={handleCreate}
              >
                {loading ? "Creazione..." : "Crea partita"}
              </button>
              <button className="btn btn-ghost" onClick={() => setScreen("join")}>
                Unisciti con codice
              </button>
            </>
          ) : (
            <>
              {!joiningViaLink && (
                <label className="field">
                  <span>Codice stanza</span>
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Es. AB3K9"
                    maxLength={5}
                  />
                </label>
              )}
              <button
                className="btn btn-primary"
                disabled={!name.trim() || code.trim().length < 4 || loading}
                onClick={handleJoin}
              >
                {loading ? "Entrando..." : "Entra in partita"}
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setScreen("home");
                  setInviteCode(null);
                  clearInviteFromUrl();
                }}
              >
                Indietro
              </button>
            </>
          )}

          {error && <p className="error">{error}</p>}
        </section>

        <footer className="home-footer">
          <div className="pill">10 domande</div>
          <div className="pill">Multigiocatore online</div>
          <div className="pill">Punti per velocità</div>
        </footer>
      </main>
    </div>
  );
}
