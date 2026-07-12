interface Props {
  isMine: boolean;
  playerName: string;
}

const REEL_ITEMS = ["🎬", "🌍", "⛰️", "⚽", "🌊", "🎮", "🎵", "🏆", "🎲", "🔥"];

export function Top5Wheel({ isMine, playerName }: Props) {
  return (
    <div className="wheel-wrap">
      <h1 className="display" style={{ fontSize: "2.1rem" }}>
        🎰 Top 5 in arrivo...
      </h1>

      <div className="top5-reel-frame">
        <div className="top5-reel-strip">
          {[...REEL_ITEMS, ...REEL_ITEMS, ...REEL_ITEMS].map((item, i) => (
            <div className="top5-reel-item" key={i}>
              {item}
            </div>
          ))}
        </div>
        <div className="top5-reel-shade" />
      </div>

      <p style={{ color: "var(--cream)" }}>
        {isMine ? (
          "Sta per uscire la tua categoria..."
        ) : (
          <>
            Categoria per <strong style={{ color: "var(--gold-soft)" }}>{playerName}</strong> in arrivo...
          </>
        )}
      </p>
    </div>
  );
}
