interface Props {
  worldName: string;
  worldEmoji: string;
}

export function Wheel({ worldName, worldEmoji }: Props) {
  return (
    <div className="wheel-wrap">
      <h2>
        {worldEmoji} {worldName}
      </h2>
      <p style={{ color: "var(--text-muted)" }}>
        La ruota sta decidendo la prova che dovrai affrontare…
      </p>
      <div style={{ position: "relative" }}>
        <div className="wheel-pointer" />
        <div className="wheel spinning" />
      </div>
    </div>
  );
}
