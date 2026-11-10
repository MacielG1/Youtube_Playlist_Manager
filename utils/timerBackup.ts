import type { PlaylistItem, SavedItem, VideoItem } from "@/types";

const SAVED_ID_PATTERN = /^[A-Za-z0-9_-]+$/;
const MAX_SAVED_ID_LENGTH = 100;
const FORBIDDEN_IDS = new Set(["__proto__", "constructor", "prototype"]);

export type TimerBackup = {
  savedPlaylists: string[];
  savedVideos: string[];
  allPlaylistData: SavedItem[];
  allVideoData: SavedItem[];
};

export type TimerBackupResult = { ok: true; value: TimerBackup } | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isValidSavedId(value: unknown): value is string {
  return typeof value === "string" && value.length <= MAX_SAVED_ID_LENGTH && SAVED_ID_PATTERN.test(value) && !FORBIDDEN_IDS.has(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function parseIdList(raw: unknown): string[] | null {
  if (!Array.isArray(raw)) return null;
  const unique = new Set<string>();
  for (const entry of raw) {
    if (!isValidSavedId(entry)) return null;
    unique.add(entry);
  }
  return [...unique];
}

export function normalizePlaylistData(raw: unknown, keyId: string): PlaylistItem | null {
  if (!isRecord(raw)) return null;
  if (!isFiniteNumber(raw.initialTime) || raw.initialTime < 0) return null;
  if (!Number.isInteger(raw.currentItem) || (raw.currentItem as number) < 0 || (raw.currentItem as number) > 199) return null;
  if (raw.currentPage !== undefined && (!Number.isInteger(raw.currentPage) || (raw.currentPage as number) < 1)) return null;
  if (raw.isChannel !== undefined && typeof raw.isChannel !== "boolean") return null;
  if (raw.playbackSpeed !== undefined && (!isFiniteNumber(raw.playbackSpeed) || raw.playbackSpeed <= 0 || raw.playbackSpeed > 4)) return null;
  if (raw.playlistId !== undefined && raw.playlistId !== keyId) return null;

  const data: PlaylistItem = {
    currentItem: raw.currentItem as number,
    initialTime: raw.initialTime,
  };
  if (raw.currentPage !== undefined) data.currentPage = raw.currentPage as number;
  if (raw.isChannel !== undefined) data.isChannel = raw.isChannel as boolean;
  if (raw.playbackSpeed !== undefined) data.playbackSpeed = raw.playbackSpeed;
  if (raw.playlistId !== undefined) data.playlistId = keyId;
  return data;
}

export function normalizeVideoData(raw: unknown, keyId: string): VideoItem | null {
  if (!isRecord(raw)) return null;
  if (!isFiniteNumber(raw.initialTime) || raw.initialTime < 0) return null;
  if (raw.playbackSpeed !== undefined && (!isFiniteNumber(raw.playbackSpeed) || raw.playbackSpeed <= 0 || raw.playbackSpeed > 4)) return null;
  if (raw.videoId !== undefined && raw.videoId !== keyId) return null;

  const data: VideoItem = { initialTime: raw.initialTime };
  if (raw.playbackSpeed !== undefined) data.playbackSpeed = raw.playbackSpeed;
  if (raw.videoId !== undefined) data.videoId = keyId;
  return data;
}

function parseSavedEntries(raw: unknown, prefix: "pl=" | "v=", allowedIds: Set<string>, normalize: (data: unknown, keyId: string) => PlaylistItem | VideoItem | null): SavedItem[] | null {
  if (!Array.isArray(raw)) return null;
  const entriesByKey = new Map<string, SavedItem>();
  for (const entry of raw) {
    if (!isRecord(entry) || typeof entry.key !== "string") return null;
    if (!entry.key.startsWith(prefix)) return null;
    const keyId = entry.key.slice(prefix.length);
    if (!isValidSavedId(keyId) || !allowedIds.has(keyId)) return null;
    const data = normalize(entry.data, keyId);
    if (data === null) return null;
    entriesByKey.set(entry.key, { key: entry.key, data });
  }
  return [...entriesByKey.values()];
}

export function parseTimerBackup(raw: unknown): TimerBackupResult {
  if (!isRecord(raw)) {
    return { ok: false, error: "Invalid File" };
  }

  const savedPlaylists = parseIdList(raw.savedPlaylists);
  const savedVideos = parseIdList(raw.savedVideos);
  if (savedPlaylists === null || savedVideos === null) {
    return { ok: false, error: "Invalid File" };
  }

  const allPlaylistData = parseSavedEntries(raw.allPlaylistData, "pl=", new Set(savedPlaylists), normalizePlaylistData);
  const allVideoData = parseSavedEntries(raw.allVideoData, "v=", new Set(savedVideos), normalizeVideoData);
  if (allPlaylistData === null || allVideoData === null) {
    return { ok: false, error: "Invalid File" };
  }

  return {
    ok: true,
    value: { savedPlaylists, savedVideos, allPlaylistData, allVideoData },
  };
}

export function mergeTimerBackup(current: { playlists: string[]; videos: string[] }, imported: TimerBackup): { playlists: string[]; videos: string[]; entries: Array<readonly [string, string]> } {
  const existingPlaylists = new Set(current.playlists);
  const playlists = [...current.playlists, ...imported.savedPlaylists.filter((id) => !existingPlaylists.has(id))];

  const existingVideos = new Set(current.videos);
  const videos = [...current.videos, ...imported.savedVideos.filter((id) => !existingVideos.has(id))];

  const entries: Array<readonly [string, string]> = [];
  for (const item of imported.allPlaylistData) {
    entries.push([item.key, JSON.stringify(item.data)]);
  }
  for (const item of imported.allVideoData) {
    entries.push([item.key, JSON.stringify(item.data)]);
  }

  return { playlists, videos, entries };
}
