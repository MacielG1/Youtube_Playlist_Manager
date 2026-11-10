const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const ID_PATTERN = /^[A-Za-z0-9_-]+$/;

export type ParsedYouTubeInput =
  | { type: "video"; id: string }
  | { type: "playlist"; id: string }
  | { type: "channel"; id: string }
  | { type: "channelName"; id: string }
  | { type: "invalid" };

const CHANNEL_ID_PATTERN = /^UC[A-Za-z0-9_-]{1,99}$/;

export default function parseYouTubeInput(raw: string): ParsedYouTubeInput {
  const input = raw.trim();
  if (!input || input.length > 100) return { type: "invalid" };

  let url: URL | null = null;
  try {
    url = new URL(input);
  } catch {
    url = null;
  }

  if (!url) {
    if (input.includes("://")) return { type: "invalid" };
    if (input === "@") return { type: "invalid" };
    if (input.startsWith("@")) return { type: "channel", id: input };
    return { type: "channelName", id: input }; // if not url is a entered name
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return { type: "invalid" };

  const host = url.hostname.toLowerCase();
  const isYouTube = host === "youtube.com" || host.endsWith(".youtube.com") || host === "youtu.be";
  if (!isYouTube) return { type: "invalid" };

  const list = url.searchParams.get("list");
  if (list !== null) {
    if (ID_PATTERN.test(list) && list.length <= 100) return { type: "playlist", id: list };
    return { type: "invalid" };
  }

  const videoParam = url.searchParams.get("v");
  if (videoParam && VIDEO_ID_PATTERN.test(videoParam)) return { type: "video", id: videoParam };

  const parts = url.pathname.split("/").filter(Boolean);

  if (host === "youtu.be") {
    const id = parts[0] ?? "";
    if (VIDEO_ID_PATTERN.test(id)) return { type: "video", id };
    return { type: "invalid" };
  }

  if (parts[0] === "shorts" || parts[0] === "embed" || parts[0] === "live") {
    const id = parts[1] ?? "";
    if (VIDEO_ID_PATTERN.test(id)) return { type: "video", id };
    return { type: "invalid" };
  }

  if (parts[0] === "channel") {
    if (parts[1] && CHANNEL_ID_PATTERN.test(parts[1])) return { type: "channel", id: parts[1] };
    return { type: "invalid" };
  }

  if (parts[0] === "user" && parts[1]) {
    return { type: "channelName", id: parts[1] };
  }

  if (parts[0] && parts[0].startsWith("@")) {
    return { type: "channel", id: parts[0] };
  }

  return { type: "invalid" };
}
