import type { CardDef } from "../../shared/types";
import { CardView } from "./CardView";

interface Props {
  card: CardDef;
  ownedCount?: number;
  locked?: boolean;
  spent?: boolean;
  onClose: () => void;
}

export function CardZoomModal({ card, ownedCount, locked, spent, onClose }: Props) {
  return (
    <div className="card-zoom-overlay" onClick={onClose}>
      <div className="card-zoom-wrapper" onClick={(e) => e.stopPropagation()}>
        <CardView card={card} ownedCount={ownedCount} locked={locked} spent={spent} />
      </div>
    </div>
  );
}
