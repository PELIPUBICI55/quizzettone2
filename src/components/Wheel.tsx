interface Props {
  worldName: string;
  worldEmoji: string;
  playerName: string;
  isMine: boolean;
}

export function Wheel({ worldName, worldEmoji, playerName, isMine }: Props) {
  return (
    <div className="wheel-wrap">
      <h2>
        {worldEmoji} {worldName}
      </h2>
      <p style={{ color: "var(--text-muted)" }}>
        {isMine
          ? "La ruota sta decidendo la prova che dovrai affrontare…"
          : `La ruota sta decidendo la prova per ${playerName}…`}
      </p>
      <div style={{ position: "relative" }}>
        <div className="wheel-pointer" />
        <div className="wheel spinning" />
      </div>
    </div>
  );
}
