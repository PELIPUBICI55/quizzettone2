import { useState } from "react";
import type { CardEffectType, GameStateSnapshot } from "../../shared/types";

interface Props {
  state: GameStateSnapshot;
}

const EFFECT_LABELS: Partial<Record<CardEffectType, { emoji: string; label: string }>> = {
  extraTime: { emoji: "⏱️", label: "Tempo extra pronto" },
  removeWrongOption: { emoji: "🛡️", label: "Aiuto attivo pronto" },
  doubleCoins: { emoji: "💰", label: "Monete raddoppiate pronte" },
  secondChance: { emoji: "🍀", label: "Seconda chance pronta" },
  skipQuestion: { emoji: "⏭️", label: "Salta domanda pronto" },
};

export function StatusMenu({ state }: Props) {
  const [open, setOpen] = useState(false);

  const totalActive = state.players.reduce(
    (sum, p) => sum + p.activeEffects.length + p.statuses.length,
    0
  );

  return (
    <div style={{ position: "relative" }}>
      <button className="btn-outline" onClick={() => setOpen((o) => !o)}>
        📊 Stati{totalActive > 0 ? ` (${totalActive})` : ""}
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 59 }} />
          <div
            className="panel"
            style={{
              position: "absolute",
              top: "calc(100% + 0.5rem)",
              right: 0,
              zIndex: 60,
              width: "min(90vw, 340px)",
              maxHeight: "70vh",
              overflowY: "auto",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Stati attivi</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              {state.players.map((p) => {
                const hasAny = p.activeEffects.length > 0 || p.statuses.length > 0;
                return (
                  <div key={p.id}>
                    <div style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.3rem" }}>
                      {p.name}
                      {p.id === state.me.id && " (tu)"}
                    </div>
                    {!hasAny ? (
                      <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", margin: 0 }}>
                        Nessuno stato attivo.
                      </p>
                    ) : (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                        {p.activeEffects.map((e, i) => {
                          const info = EFFECT_LABELS[e];
                          return (
                            <span className="effect-chip" key={`ae-${i}`}>
                              {info ? `${info.emoji} ${info.label}` : `${e} pronto`}
                            </span>
                          );
                        })}
                        {p.statuses.map((s) => (
                          <span className="effect-chip" key={s.id} title={s.description}>
                            {s.emoji} {s.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
