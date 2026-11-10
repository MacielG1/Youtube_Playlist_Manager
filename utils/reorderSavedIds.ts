export default function reorderSavedIds(savedIds: string[], reorderedIds: string[]): string[] | null {
  const savedSet = new Set(savedIds);
  for (const id of reorderedIds) {
    if (!savedSet.has(id)) return null;
  }
  const reorderSet = new Set(reorderedIds);
  let cursor = 0;
  return savedIds.map((id) => (reorderSet.has(id) ? reorderedIds[cursor++] : id));
}
