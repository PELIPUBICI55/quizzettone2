import { useState } from "react";
import { socket } from "../socket";
import { clientId } from "../clientId";

export function JoinScreen({ onError }: { onError: (msg: string) => void }) {
  const [mode, setMode] = useState<"create" | "join">("create");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

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
    } else {
      if (!code.trim()) {
        setLoading(false);
        onError("Inserisci il codice della partita.");
        return;
      }
      socket.emit("party:join", { code: code.trim(), name, clientId }, (res) => {
        setLoading(false);
        if (!res.ok) onError(res.error ?? "Errore nell'ingresso alla partita.");
      });
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
        </div>

        <input
          placeholder="Il tuo nome"
          value={name}
          maxLength={20}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
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

        <button className="btn" style={{ width: "100%" }} onClick={submit} disabled={loading}>
          {loading ? "Un attimo…" : mode === "create" ? "Crea partita" : "Entra"}
        </button>
      </div>
    </div>
  );
}
