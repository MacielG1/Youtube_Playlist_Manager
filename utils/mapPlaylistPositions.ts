export default function mapPlaylistPositions(requestedIds: readonly string[], actualIds: unknown): number[] | null {
  if (!Array.isArray(actualIds)) return null;
  const positions: number[] = [];
  let previous = -1;
  for (const id of actualIds) {
    if (typeof id !== "string") return null;
    const position = requestedIds.indexOf(id, previous + 1);
    if (position < 0) return null;
    positions.push(position);
    previous = position;
  }
  return positions;
}
