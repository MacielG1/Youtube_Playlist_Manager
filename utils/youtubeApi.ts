import { NextResponse } from "next/server";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
const UPSTREAM_TIMEOUT_MS = 15000;

export const ID_PATTERN = /^[A-Za-z0-9_-]+$/;
export const MAX_IDS = 50;
export const MAX_ID_LENGTH = 100;

export class YouTubeApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "YouTubeApiError";
    this.status = status;
  }
}

export function getYouTubeApiKey(): string {
  const apiKey = process.env.YOUTUBE_API;
  if (!apiKey) {
    throw new YouTubeApiError(503, "YouTube API key is not configured");
  }
  return apiKey;
}

export async function readJsonBody(req: Request): Promise<Record<string, unknown>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new YouTubeApiError(400, "Malformed JSON body");
  }
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    throw new YouTubeApiError(400, "Invalid JSON body");
  }
  return body as Record<string, unknown>;
}

export function validateId(raw: unknown, field: string): string {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > MAX_ID_LENGTH || !ID_PATTERN.test(raw)) {
    throw new YouTubeApiError(400, `Invalid ${field}`);
  }
  return raw;
}

export function parseIdList(raw: unknown, field: string): string[] {
  if (typeof raw !== "string" || raw.length > 10000) {
    throw new YouTubeApiError(400, `Invalid ${field}`);
  }
  const unique = new Set<string>();
  for (const member of raw.split(",")) {
    const id = member.trim();
    if (id.length === 0 || id.length > MAX_ID_LENGTH || !ID_PATTERN.test(id)) {
      throw new YouTubeApiError(400, `Invalid ${field} member`);
    }
    unique.add(id);
  }
  if (unique.size === 0 || unique.size > MAX_IDS) {
    throw new YouTubeApiError(400, `Invalid ${field} count`);
  }
  return [...unique];
}

export interface UpstreamMetadataItem {
  id: string;
  snippet: {
    title: string;
    thumbnails?: import("@/types").Thumbnails;
    resourceId?: { videoId?: string };
    description?: string;
    publishedAt?: string;
    channelTitle?: string;
    channelId?: string;
  };
  contentDetails?: { duration?: string; itemCount?: number };
}

export function requireItemsArray(data: unknown): unknown[] {
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    throw new YouTubeApiError(502, "Malformed upstream response");
  }
  const items = (data as Record<string, unknown>).items;
  if (!Array.isArray(items)) {
    throw new YouTubeApiError(502, "Malformed upstream response");
  }
  return items;
}

export function requireMetadataItem(item: unknown): asserts item is UpstreamMetadataItem {
  if (item === null || typeof item !== "object") {
    throw new YouTubeApiError(502, "Malformed upstream item");
  }
  const candidate = item as Record<string, unknown>;
  const snippet = candidate.snippet;
  if (typeof candidate.id !== "string" || snippet === null || typeof snippet !== "object" || typeof (snippet as Record<string, unknown>).title !== "string") {
    throw new YouTubeApiError(502, "Malformed upstream item");
  }
}

export async function youtubeApiFetch(path: string, params: Record<string, string>): Promise<Response> {
  const search = new URLSearchParams({ ...params, key: getYouTubeApiKey() });
  let res: Response;
  try {
    res = await fetch(`${YOUTUBE_API_BASE}/${path}?${search.toString()}`, {
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch (e) {
    if (e instanceof DOMException && (e.name === "TimeoutError" || e.name === "AbortError")) {
      throw new YouTubeApiError(504, "Upstream request timed out");
    }
    throw new YouTubeApiError(502, "Upstream request failed");
  }
  if (!res.ok) {
    if (res.status === 429) throw new YouTubeApiError(429, "Upstream rate limited");
    if (res.status === 404) throw new YouTubeApiError(404, "Upstream resource not found");
    throw new YouTubeApiError(502, "Upstream request failed");
  }
  return res;
}

export function apiErrorResponse(error: unknown, context: string): NextResponse {
  if (error instanceof YouTubeApiError) {
    return new NextResponse(error.message, { status: error.status });
  }
  console.error(`Unexpected error in ${context}`);
  return new NextResponse("Error", { status: 502 });
}
