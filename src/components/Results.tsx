import type { RoomState } from "../../shared/types";
import { ResultsFooter } from "./Lobby";

interface Props {
  room: RoomState;
}

export function Results({ room }: Props) {
  const winner = room.winner ?? room.players[0];

  return (
    <div className="app">
      <div className="bg-orbs" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <main className="results">
        <header className="results-hero">
          <p className="eyebrow">Partita terminata</p>
          <h2>Grandioso!</h2>
          {winner && (
            <p className="winner-line">
              Vincitore: <strong>{winner.name}</strong> con {winner.score} punti
            </p>
          )}
        </header>

        <section className="card podium">
          <h3>Classifica finale</h3>
          <ol>
            {room.players.map((player, index) => (
              <li key={player.id} className={index === 0 ? "first" : ""}>
                <span className="rank">{index + 1}</span>
                <span className="name">{player.name}</span>
                <span className="score">{player.score} pt</span>
              </li>
            ))}
          </ol>
        </section>

        <ResultsFooter room={room} />
      </main>
    </div>
  );
}
