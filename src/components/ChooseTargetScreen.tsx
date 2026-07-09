import type { ChooseTargetPayload } from "../../shared/types";

interface Props {
  payload: ChooseTargetPayload;
  onSelect: (optionId: string) => void;
}

export function ChooseTargetScreen({ payload, onSelect }: Props) {
  return (
    <div className="wheel-wrap">
      <h1 className="display" style={{ fontSize: "2rem" }}>
        🎯 Scegli
      </h1>
      <div className="wheel-text-panel">
        <p>{payload.prompt}</p>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", justifyContent: "center", maxWidth: 480 }}>
        {payload.options.map((opt) => (
          <button key={opt.id} className="btn-outline" onClick={() => onSelect(opt.id)}>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
