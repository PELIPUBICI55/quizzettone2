import { useEffect, useState } from "react";
import type { RoomState } from "../shared/types";
import { onRoomState } from "./socket";

export function useRoomState() {
  const [room, setRoom] = useState<RoomState | null>(null);

  useEffect(() => onRoomState(setRoom), []);

  return room;
}
