import { useEffect, useState } from "react";

export function useCountdown(active: boolean, durationMs: number, resetKey: string | number) {
  const [remainingMs, setRemainingMs] = useState(durationMs);

  useEffect(() => {
    if (!active) return;

    const startedAt = Date.now();
    setRemainingMs(durationMs);

    const interval = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setRemainingMs(Math.max(0, durationMs - elapsed));
    }, 50);

    return () => clearInterval(interval);
  }, [active, durationMs, resetKey]);

  return remainingMs;
}
