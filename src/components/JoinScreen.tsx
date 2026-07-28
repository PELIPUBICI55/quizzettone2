import { useRef, useState } from "react";
import { socket } from "../socket";
import { clientId } from "../clientId";

export function JoinScreen({ onError }: { onError: (msg: string) => void }) {
  const [mode, setMode] = useState<"create" | "join" | "restore">("create");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    if (!name.trim()) {
      onError("Inserisci un nome per continuare.");
      return;
    }
    setLoading(true);
    if (!socket.connected) socket.connect();

    if (mode === "create") {
      socket.emit("party:create", { name, clientId }, (res) => {
        setLoading(false);
        if (!res.ok) onError(res.error ?? "Errore nella creazione della partita.");
      });
    } else if (mode === "join") {
      if (!code.trim()) {
        setLoading(false);
        onError("Inserisci il codice della partita.");
        return;
      }
      socket.emit("party:join", { code: code.trim(), name, clientId }, (res) => {
        setLoading(false);
        if (!res.ok) onError(res.error ?? "Errore nell'ingresso alla partita.");
      });
    } else {
      const file = fileInputRef.current?.files?.[0];
      if (!file) {
        setLoading(false);
        onError("Scegli il file di salvataggio (.json) prima di continuare.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        let data: unknown;
        try {
          data = JSON.parse(String(reader.result));
        } catch {
          setLoading(false);
          onError("Il file scelto non è un salvataggio valido (JSON non leggibile).");
          return;
        }
        socket.emit("party:restore", { data, name, clientId }, (res) => {
          setLoading(false);
          if (!res.ok) onError(res.error ?? "Errore nel caricamento del salvataggio.");
        });
      };
      reader.onerror = () => {
        setLoading(false);
        onError("Impossibile leggere il file scelto.");
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="join-screen">
      <div className="join-panel panel">
        <h1>Quizzettone</h1>
        <p className="subtitle">Grandioso Giuoco di conoscenze generali</p>

        <div className="join-tabs">
          <button
            className={mode === "create" ? "active" : ""}
            onClick={() => setMode("create")}
          >
            Crea partita (Host)
          </button>
          <button
            className={mode === "join" ? "active" : ""}
            onClick={() => setMode("join")}
          >
            Entra con codice
          </button>
          <button
            className={mode === "restore" ? "active" : ""}
            onClick={() => setMode("restore")}
          >
            Carica partita salvata
          </button>
        </div>

        <input
          placeholder="Il tuo nome"
          value={name}
          maxLength={20}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && mode !== "restore" && submit()}
        />

        {mode === "join" && (
          <input
            placeholder="Codice partita (es. AB3F9)"
            value={code}
            maxLength={6}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        )}

        {mode === "restore" && (
          <>
            <p className="subtle" style={{ fontSize: "0.85rem" }}>
              Scegli il file .json scaricato in precedenza con il pulsante "💾 Salva". Se eri tu
              l'host, ti riaggancerai automaticamente al tuo posto.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
              style={{ padding: "0.5rem 0" }}
            />
            {fileName && (
              <p className="subtle" style={{ fontSize: "0.8rem" }}>
                File scelto: {fileName}
              </p>
            )}
          </>
        )}

        <button className="btn" style={{ width: "100%" }} onClick={submit} disabled={loading}>
          {loading
            ? "Un attimo…"
            : mode === "create"
              ? "Crea partita"
              : mode === "join"
                ? "Entra"
                : "Carica e riprendi"}
        </button>
      </div>
    </div>
  );
}
