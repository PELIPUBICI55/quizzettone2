interface Props {
  message: string;
  onRespond: (use: boolean) => void;
}

export function ShieldPromptScreen({ message, onRespond }: Props) {
  return (
    <div className="wheel-wrap">
      <h1 className="display" style={{ fontSize: "2rem" }}>
        🛡️ Usare lo scudo?
      </h1>
      <div className="wheel-text-panel">
        <p>{message}</p>
      </div>
      <div style={{ display: "flex", gap: "1rem" }}>
        <button className="btn" onClick={() => onRespond(true)}>
          Sì, usa lo scudo
        </button>
        <button className="btn-outline" onClick={() => onRespond(false)}>
          No, subisci l'effetto
        </button>
      </div>
    </div>
  );
}
