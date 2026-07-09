const STORAGE_KEY = "quizzettone-client-id";

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `c${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function loadOrCreateClientId(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const fresh = generateId();
    localStorage.setItem(STORAGE_KEY, fresh);
    return fresh;
  } catch {
    // localStorage non disponibile (es. modalità privata restrittiva):
    // ripieghiamo su un id valido solo per questa sessione di pagina.
    return generateId();
  }
}

export const clientId = loadOrCreateClientId();
