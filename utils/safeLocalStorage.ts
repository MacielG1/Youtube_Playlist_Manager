// Safe localStorage helpers — guard against corrupted JSON and quota errors.

const SAVED_ID_PATTERN = /^[A-Za-z0-9_-]+$/;
const MAX_SAVED_ID_LENGTH = 100;
const STORAGE_CHANGE_EVENT = "local-storage";

function emitStorageChange(key: string) {
  try {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(STORAGE_CHANGE_EVENT, { detail: { key } }));
    }
  } catch {
    return;
  }
}

export function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeRemoveItem(key: string): boolean {
  try {
    localStorage.removeItem(key);
    emitStorageChange(key);
    return true;
  } catch {
    return false;
  }
}

export function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (fallback === null) return parsed as T;
    if (parsed === null) return fallback;
    if (Array.isArray(fallback)) return (Array.isArray(parsed) ? parsed : fallback) as T;
    if (typeof fallback === "object") return (typeof parsed === "object" && !Array.isArray(parsed) ? parsed : fallback) as T;
    return (typeof parsed === typeof fallback ? parsed : fallback) as T;
  } catch {
    return fallback;
  }
}

export function getSavedIds(key: string): string[] {
  const parsed = safeParse<unknown[]>(safeGetItem(key), []);
  const unique = new Set<string>();
  for (const entry of parsed) {
    if (typeof entry === "string" && entry.length <= MAX_SAVED_ID_LENGTH && SAVED_ID_PATTERN.test(entry)) {
      unique.add(entry);
    }
  }
  return [...unique];
}

export function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    if (e instanceof DOMException && (e.name === "QuotaExceededError" || e.name === "NS_ERROR_DOM_QUOTA_REACHED")) {
      console.error("localStorage quota exceeded for key:", key);
    } else {
      console.error("localStorage.setItem failed for key:", key, e);
    }
    return false;
  }
  emitStorageChange(key);
  return true;
}

export function writeStorageBatch(entries: Array<readonly [string, string | null]>): void {
  const snapshot = new Map<string, string | null>();
  const applied: string[] = [];

  for (const [key] of entries) {
    if (snapshot.has(key)) continue;
    let original: string | null;
    try {
      original = localStorage.getItem(key);
    } catch (e) {
      throw new Error(`localStorage snapshot failed for key: ${key}`, { cause: e });
    }
    snapshot.set(key, original);
  }

  try {
    for (const [key, value] of entries) {
      try {
        if (value === null) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, value);
        }
      } catch (e) {
        throw new Error(`localStorage write failed for key: ${key}`, { cause: e });
      }
      if (!applied.includes(key)) applied.push(key);
    }
  } catch (writeError) {
    const rollbackFailures: string[] = [];
    for (let i = applied.length - 1; i >= 0; i--) {
      const key = applied[i];
      const original = snapshot.get(key) ?? null;
      try {
        if (original === null) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, original);
        }
      } catch {
        rollbackFailures.push(key);
      }
    }
    for (const key of applied) emitStorageChange(key);
    const message =
      rollbackFailures.length > 0
        ? `localStorage batch write failed; rollback incomplete for keys: ${rollbackFailures.join(", ")}`
        : "localStorage batch write failed; rolled back";
    throw new Error(message, { cause: writeError });
  }
  for (const key of applied) emitStorageChange(key);
}

export function subscribeStorageChange(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener(STORAGE_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(STORAGE_CHANGE_EVENT, callback);
  };
}
