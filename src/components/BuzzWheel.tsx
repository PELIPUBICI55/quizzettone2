import { PARTICOLARE_CATEGORIES } from "../../shared/particolareCategories";

// A differenza di ParticolareWheel, qui non c'è un "isMine"/playerName: IL
// GRANDIOSO BUZZ coinvolge tutta la sala insieme, quindi la ruota è identica
// per tutti.
const REEL_ITEMS = PARTICOLARE_CATEGORIES.map((c) => c.emoji);

export function BuzzWheel() {
  return (
    <div className="wheel-wrap">
      <h1 className="display" style={{ fontSize: "2.1rem" }}>🔔 Il Grandioso Buzz in arrivo...</h1>
      <div className="top5-reel-frame">
        <div className="top5-reel-strip">
          {[...REEL_ITEMS, ...REEL_ITEMS, ...REEL_ITEMS].map((item, i) => (
            <div className="top5-reel-item" key={i}>{item}</div>
          ))}
        </div>
        <div className="top5-reel-shade" />
      </div>
      <p style={{ color: "var(--cream)" }}>Sta per uscire la categoria... tenetevi pronti a buzzare!</p>
    </div>
  );
}
