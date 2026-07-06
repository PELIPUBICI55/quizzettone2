export function buildJoinUrl(code: string, origin = typeof window !== "undefined" ? window.location.origin : ""): string {
  return `${origin}/join/${code.toUpperCase()}`;
}

export function parseInviteFromLocation(location: Pick<Location, "pathname" | "search">): string | null {
  const pathMatch = location.pathname.match(/^\/join\/([A-Z0-9]{4,6})$/i);
  if (pathMatch) return pathMatch[1].toUpperCase();

  const params = new URLSearchParams(location.search);
  const room = params.get("room");
  return room ? room.toUpperCase() : null;
}
