"use client";
import type { Items, Playlist, PlaylistAPI } from "@/types";
import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import YouTube, { type YouTubeEvent, type YouTubeProps, type YouTubePlayer } from "react-youtube";
import dynamic from "next/dynamic";
import { useAudioToggle } from "@/providers/SettingsProvider";
import { shuffle } from "@/utils/shuffle";
import { safeGetItem, safeParse, safeSetItem } from "@/utils/safeLocalStorage";
import useIsClient from "@/hooks/useIsClient";
import { del, get, set, setMany } from "idb-keyval";
import { useMediaQuery } from "usehooks-ts";
import fetchVideosIds from "@/utils/fetchVideosIds";
import getVideosSlice from "@/utils/getVideosSlice";
import seekTime from "@/utils/seekTime";
import LogoButton from "./LogoButton";
import savePlaylistsProgress from "@/utils/savePlaylistProgress";
import useProgressSaver from "@/hooks/useProgressSaver";
import restorePlaylist from "@/utils/restorePlaylist";
import loadPlaylist from "@/utils/loadPlaylist";
import mapPlaylistPositions from "@/utils/mapPlaylistPositions";
import ModalDelete from "./modals/ModalDelete";
import onDeleteItems from "@/utils/onDeleteItem";
import reduceStringSize from "@/utils/reduceStringLength";
import Description from "./Description";
import Link from "next/link";

import Spin from "@/assets/icons/Spin";
import Rewind10 from "@/assets/icons/Rewind10";
import PointerLeft from "@/assets/icons/PointerLeft";
import PointerRight from "@/assets/icons/PointerRight";
import Skip10 from "@/assets/icons/Skip10";
import Youtube from "@/assets/icons/Youtube";
import Channel from "@/assets/icons/Channel";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "./ToolTip";
import Shuffle from "@/assets/icons/Shuffle";
import VideoDate from "./VideoDate";

import RemoveVideo from "@/assets/icons/RemoveVideo";
import ResetPlaylistModal from "./modals/ResetPlaylistModal";
import Close from "@/assets/icons/Close";
import toast, { type Toast } from "react-hot-toast";
import { toastRefresh } from "@/utils/toastStyles";

const VideosListSidebar = dynamic(() => import("./VideosListSidebar"), {
  ssr: false,
  loading: () => <div className="w-[200px]" />,
});

const REFETCH_INTERVAL_MS = 0; // 0 = mount-only check. >0 = polling interval for testing
const STALE_THRESHOLD_MS = 10 * 60 * 60 * 1000; // 10 hours

function readPlaylistSnapshot(playlistId: string) {
  const progress = safeParse<Record<string, unknown>>(safeGetItem(`pl=${playlistId}`), {});
  const cache = safeParse<Record<string, unknown>>(safeGetItem(`plVideos=${playlistId}`), {});
  const ids = Array.isArray(cache.videosIds) ? cache.videosIds.filter((id): id is string => typeof id === "string" && /^[A-Za-z0-9_-]{1,100}$/.test(id)) : [];
  return {
    ids,
    currentItem: Number.isInteger(progress.currentItem) && Number(progress.currentItem) >= 0 && Number(progress.currentItem) < 200 ? Number(progress.currentItem) : 0,
    currentPage: Number.isSafeInteger(progress.currentPage) && Number(progress.currentPage) >= 1 ? Number(progress.currentPage) : 1,
    initialTime: typeof progress.initialTime === "number" && Number.isFinite(progress.initialTime) && progress.initialTime >= 0 ? progress.initialTime : 0,
    isChannel: progress.isChannel === true || playlistId.startsWith("UU"),
    stale: typeof cache.updatedTime !== "number" || Date.now() - cache.updatedTime > STALE_THRESHOLD_MS,
  };
}

export default function YoutubePlayer({ params }: { params: { list: string; title: string } }) {
  const [snapshot] = useState(() => readPlaylistSnapshot(params.list));
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number | null>(null);
  const [currentVideoTitle, setCurrentVideoTitle] = useState("");
  const [isShuffled, setIsShuffled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialFetchDone, setIsInitialFetchDone] = useState(false);
  const [hasValidVideoIds, setHasValidVideoIds] = useState(false);
  const [embedError, setEmbedError] = useState(false);
  const embedErrorRef = useRef(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isFetchingVideos, setIsFetchingVideos] = useState(false);
  const [unavailableVideoIds, setUnavailableVideoIds] = useState<Set<string>>(new Set());
  const [autoSkipCountdown, setAutoSkipCountdown] = useState<number | null>(null);
  const [embedErrorReason, setEmbedErrorReason] = useState("");

  const [description, setDescription] = useState<string | null>(null);
  const [videosList, setVideosList] = useState<Items["items"]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const isMounted = useIsClient();
  const [isRemoving, setIsRemoving] = useState(false);
  const [currentVideoIdState, setCurrentVideoIdState] = useState<string>("");
  const [initialOptions, setInitialOptions] = useState<YouTubeProps["opts"] | null>(null);
  const [fetchError, setFetchError] = useState("");

  const { isAudioMuted } = useAudioToggle();
  const isPaused = useRef(false);
  const pageRef = useRef(snapshot.currentPage);
  const plLengthRef = useRef(snapshot.ids.length);
  const currentVideoId = useRef("");
  const pageAndIndexBeforeShuffle = useRef({ page: 1, index: 0 });

  const PlaylistPlayerRef = useRef<YouTube | null>(null);
  const isPlayingVideoRef = useRef<boolean | null>(false);
  const videosIdsRef = useRef<string[]>(snapshot.ids);
  const playlistVideosByIdRef = useRef(new Map<string, Playlist>());
  const autoSkipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSkipCountdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const skipAttemptCountRef = useRef(0);
  const pendingSkipTargetRef = useRef<number | null>(null);
  const lastFetchedCountRef = useRef<number>(0);
  const normalOrderVideosRef = useRef<Playlist[]>([]);
  const shuffledRef = useRef(false);
  const disposedRef = useRef(false);
  const mutedRef = useRef(isAudioMuted);
  const operationRef = useRef(false);
  const initialRestoreRef = useRef<{ ids: string[]; page: number; index: number; startSeconds: number } | null>(null);
  const restoreRef = useRef<{ player: YouTubePlayer; controller: AbortController } | null>(null);
  const restoreTargetRef = useRef<YouTubePlayer | null>(null);
  const loadedPageEndRef = useRef(0);
  const restoringRef = useRef(true);

  const queryClient = useQueryClient();
  const router = useRouter();

  const playlistId = params.list;
  const item = `pl=${playlistId}`;
  const currentChannelName = playlistId.startsWith("UU") ? "UC" + playlistId.slice(2) : playlistId;

  const isChannel = snapshot.isChannel;

  const initializePlaylist = useCallback((ids: string[]) => {
    if (disposedRef.current) return;
    videosIdsRef.current = ids;
    plLengthRef.current = ids.length;
    const savedAbsolute = (snapshot.currentPage - 1) * 200 + snapshot.currentItem;
    const absolute = savedAbsolute < ids.length ? savedAbsolute : 0;
    pageRef.current = Math.floor(absolute / 200) + 1;
    if (!initialRestoreRef.current && ids.length > 0) {
      initialRestoreRef.current = { ids: getVideosSlice(ids, Math.floor(absolute / 200) + 1), page: Math.floor(absolute / 200) + 1, index: absolute % 200, startSeconds: absolute === savedAbsolute ? snapshot.initialTime : 0 };
    }
    setInitialOptions((previous: YouTubeProps["opts"] | null) => previous ?? {
      height: "100%",
      width: "100%",
      playerVars: {
        autoplay: 0,
        origin: window.location.origin,
        mute: mutedRef.current,
      },
    });
    setHasValidVideoIds(ids.length > 0);
  }, [snapshot]);

  function updateEmbedError(value: boolean) {
    embedErrorRef.current = value;
    setEmbedError(value);
  }

  function updatePlaylistVideosCache(videos: Playlist[]) {
    playlistVideosByIdRef.current = new Map(videos.map((video) => [video.id, video]));
  }

  function getYouTubeEmbedErrorReason() {
    if (typeof document === "undefined") return "";
    return document.querySelector(".ytp-error-content-wrap-reason")?.textContent?.trim() ?? "";
  }

  function isYouTubeSessionBlocked(reason: string) {
    const normalizedReason = reason.toLowerCase();
    return normalizedReason.includes("sign in to confirm") || normalizedReason.includes("not a bot") || normalizedReason.includes("confirm you’re not a bot") || normalizedReason.includes("confirm you're not a bot");
  }

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  const refreshPlaylistFromYouTube = useCallback(async () => {
    try {
      const data = await fetchVideosIds(playlistId, undefined, isChannel, { allowCacheFallback: false, persistCache: false });
      if (disposedRef.current || shuffledRef.current || operationRef.current) return;

      const fetchedById = new Map<string, Playlist>(data.map((v: Playlist) => [v.id, v]));
      const existingIds = new Set(videosIdsRef.current);
      const newVideos = data.filter((v: Playlist) => !existingIds.has(v.id));

      lastFetchedCountRef.current = data.length;

      // Canonical order: keep the active order, append only new upstream IDs.
      const canonicalIds = [...videosIdsRef.current, ...newVideos.map((v: Playlist) => v.id)];

      for (const v of data) playlistVideosByIdRef.current.set(v.id, v);
      const canonicalVideos = canonicalIds.map((id) => fetchedById.get(id) ?? playlistVideosByIdRef.current.get(id)).filter((v): v is Playlist => Boolean(v));

      videosIdsRef.current = canonicalIds;
      plLengthRef.current = canonicalIds.length;

      const plVideos = safeParse<{ videosIds?: string[]; updatedTime?: number } & Record<string, unknown>>(safeGetItem(`plVideos=${playlistId}`), {});
      plVideos.videosIds = canonicalIds;
      plVideos.updatedTime = Date.now();
      safeSetItem(`plVideos=${playlistId}`, JSON.stringify(plVideos));

      setVideosList(canonicalVideos);
      // Update idb with the canonical ordered metadata (for next session)
      void set(`pl=${playlistId}`, canonicalVideos).catch(() => {});
    } catch (error) {
      console.warn("[refreshPlaylistFromYouTube] Background refresh failed:", error);
    }
  }, [playlistId, isChannel]);

  useEffect(() => {
    let cancelled = false;
    disposedRef.current = false;
    async function run() {
      const hasCachedIds = videosIdsRef.current.length > 0;

      // Fast path: render iframe immediately from localStorage-cached IDs
      if (hasCachedIds) {
        initializePlaylist(videosIdsRef.current);
        setIsInitialFetchDone(true);
        setIsLoading(false);
      } else {
        setIsLoading(true);
        setIsFetchingVideos(true);
      }

      try {
        if (hasCachedIds) {
          // Background: fill videosList (thumbnails/desc) from idb cache
          const cachedData = await get(`pl=${playlistId}`).catch(() => undefined);
          if (cancelled) return;
          if (Array.isArray(cachedData)) {
            updatePlaylistVideosCache(cachedData);
            setVideosList(cachedData);
            lastFetchedCountRef.current = cachedData.length;
          }

          if (snapshot.stale || !Array.isArray(cachedData)) {
            await refreshPlaylistFromYouTube();
          }
        } else {
          const data = await fetchVideosIds(playlistId, videosIdsRef, isChannel);
          if (cancelled) return;
          if (!data) {
            console.log("No data");
            return;
          }

          initializePlaylist(data.map((video: PlaylistAPI) => video.id));
          updatePlaylistVideosCache(data);
          setVideosList(data);
          await set(`pl=${playlistId}`, data).catch(() => {});
          if (cancelled) return;
          lastFetchedCountRef.current = data.length;

          if (videosIdsRef.current.length > 0) {
            setHasValidVideoIds(true);
          }
        }
      } catch (error) {
        console.error("Error loading playlist data:", error);
        if (!cancelled) setFetchError(error instanceof Error ? error.message : "Unable to load playlist.");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setIsFetchingVideos(false);
          setIsInitialFetchDone(true);
        }
      }
    }
    run();
    return () => {
      cancelled = true;
      disposedRef.current = true;
    };
  }, [playlistId, isChannel, snapshot.stale, initializePlaylist, refreshPlaylistFromYouTube]);

  useEffect(() => {
    if (REFETCH_INTERVAL_MS <= 0) return;
    const interval = setInterval(() => {
      void refreshPlaylistFromYouTube();
    }, REFETCH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refreshPlaylistFromYouTube]);

  useEffect(() => {
    mutedRef.current = isAudioMuted;
    const player = PlaylistPlayerRef.current?.internalPlayer;
    if (player) {
      void Promise.resolve(isAudioMuted ? player.mute() : player.unMute()).catch(() => {});
    }
  }, [isAudioMuted]);

  const progressPlayerRef = useRef<YouTubePlayer | null>(null);
  const hasPlayedRef = useRef(false);
  useProgressSaver((flush) => {
    if (restoringRef.current) return;
    const player = progressPlayerRef.current;
    if (!player || !hasPlayedRef.current || isPlayingVideoRef.current === null) return;
    if (shuffledRef.current || operationRef.current) return;
    if (!flush && !isPlayingVideoRef.current) return;
    try {
      return savePlaylistsProgress(player, playlistId, pageRef.current);
    } catch (error) {
      console.error("Error saving playlist progress:", error);
    }
  });

  useEffect(() => {
    return () => {
      if (autoSkipTimerRef.current) clearTimeout(autoSkipTimerRef.current);
      if (autoSkipCountdownRef.current) clearInterval(autoSkipCountdownRef.current);
    };
  }, []);

  function cancelAutoSkip() {
    if (autoSkipTimerRef.current) {
      clearTimeout(autoSkipTimerRef.current);
      autoSkipTimerRef.current = null;
    }
    if (autoSkipCountdownRef.current) {
      clearInterval(autoSkipCountdownRef.current);
      autoSkipCountdownRef.current = null;
    }
    setAutoSkipCountdown(null);
    pendingSkipTargetRef.current = null;
  }

  function startAutoSkip(targetIndex: number) {
    cancelAutoSkip();
    pendingSkipTargetRef.current = targetIndex;

    let countdown = 3;
    setAutoSkipCountdown(countdown);

    autoSkipCountdownRef.current = setInterval(() => {
      countdown -= 1;
      setAutoSkipCountdown(countdown);
      if (countdown <= 0 && autoSkipCountdownRef.current) {
        clearInterval(autoSkipCountdownRef.current);
        autoSkipCountdownRef.current = null;
      }
    }, 1000);

    autoSkipTimerRef.current = setTimeout(() => {
      autoSkipTimerRef.current = null;
      setAutoSkipCountdown(null);
      skipToIndex(targetIndex);
    }, 3000);
  }

  async function skipToIndex(targetIndex: number) {
    try {
      cancelAutoSkip();

      if (targetIndex <= plLengthRef.current) {
        setCurrentVideoIndex(targetIndex);
        await playVideoAt(targetIndex);
      } else {
        toast.error("No more videos in the playlist");
        skipAttemptCountRef.current = 0;
      }
    } catch (error) {
      console.error("Error skipping to video:", error);
    }
  }

  useEffect(() => {
    return () => {
      restoreRef.current?.controller.abort();
    };
  }, []);

  async function onReady(e: YouTubeEvent) {
    if (!e.target || disposedRef.current) return;
    const owner = PlaylistPlayerRef.current?.getInternalPlayer();
    if (!owner) return;
    // Ignore late ready events from an iframe replaced by react-youtube.
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    try {
      const iframe = await owner.getIframe();
      if (disposedRef.current || PlaylistPlayerRef.current?.getInternalPlayer() !== owner || !iframe?.isConnected || e.target.getIframe() !== iframe) return;
    } catch {
      return;
    }
    const target = initialRestoreRef.current;
    if (!target || !target.ids.length) return;

    const existing = restoreRef.current;
    if (existing !== null && existing.player === e.target && !existing.controller.signal.aborted) return;
    existing?.controller.abort();

    const controller = new AbortController();
    restoreRef.current = { player: e.target, controller };
    restoreTargetRef.current = e.target;
    progressPlayerRef.current = e.target;
    restoringRef.current = true;
    hasPlayedRef.current = false;
    isPlayingVideoRef.current = false;
    setIsPlayerReady(false);
    setRestoreError(null);

    try {
      const restored = await restorePlaylist(e.target, target.ids, target.index, target.startSeconds, controller.signal);
      if (controller.signal.aborted || disposedRef.current || restoreRef.current?.player !== e.target) return;
      pageRef.current = target.page;
      const state = await e.target.getPlayerState();
      if (controller.signal.aborted || disposedRef.current || restoreRef.current?.player !== e.target) return;
      isPlayingVideoRef.current = state === 1;
      hasPlayedRef.current = state === 1;
      loadedPageEndRef.current = (target.page - 1) * 200 + target.ids.length;
      restoringRef.current = false;
      setIsPlayerReady(true);
      setCurrentVideoIndex((target.page - 1) * 200 + restored.canonicalIndex + 1);
      void onStateChange({ target: e.target, data: state });

      try {
        const plRate = safeParse<{ playbackSpeed?: number }>(safeGetItem(item), {})?.playbackSpeed || 1;
        await e.target.setPlaybackRate(plRate);
      } catch (err) {
        console.warn("Could not set playback rate:", err);
      }
    } catch (error) {
      if (controller.signal.aborted || disposedRef.current || restoreRef.current?.player !== e.target) return;
      controller.abort();
      restoringRef.current = true;
      setIsPlayerReady(false);
      console.error("Error in onReady:", error);
      setRestoreError("Could not restore playlist.");
      toast.error("Could not restore playlist. Reload to retry.");
    }
  }

  async function onPlay(e: YouTubeEvent) {
    try {
      if (!e.target || restoringRef.current || e.target !== restoreRef.current?.player) return;
      progressPlayerRef.current = e.target;
      hasPlayedRef.current = true;
      isPlayingVideoRef.current = true;
      if (!shuffledRef.current && !operationRef.current) await savePlaylistsProgress(e.target, playlistId, pageRef.current);
    } catch (error) {
      console.error("Error in onPlay:", error);
    }
  }

  async function onPause(e: YouTubeEvent) {
    try {
      if (!e.target || restoringRef.current || e.target !== restoreRef.current?.player) return;
      progressPlayerRef.current = e.target;
      isPlayingVideoRef.current = false;
      if (!hasPlayedRef.current) return;
      if (!shuffledRef.current && !operationRef.current) await savePlaylistsProgress(e.target, playlistId, pageRef.current);
    } catch (error) {
      console.error("Error in onPause:", error);
    }
  }

  async function onError(e: YouTubeEvent) {
    if (e.target && e.target !== restoreRef.current?.player) return;
    console.log("error", e.data);

    if (e.data === 100 || e.data === 101 || e.data === 150) {
      updateEmbedError(true);

      try {
        await new Promise((resolve) => setTimeout(resolve, 100));
        const errorReason = getYouTubeEmbedErrorReason();
        const isSessionBlocked = isYouTubeSessionBlocked(errorReason);
        setEmbedErrorReason(errorReason);

        const videoId = e.target.getVideoData()?.video_id;
        if (videoId) {
          setCurrentVideoIdState(videoId);
          if (!isSessionBlocked) {
            setUnavailableVideoIds((prev) => new Set(prev).add(videoId));
          }
        }

        const currentIndex = await e.target.getPlaylistIndex();
        const errorPlaylist = typeof e.target.getPlaylist === "function" ? e.target.getPlaylist() : undefined;
        const errorPositions = mapPlaylistPositions(videosIdsRef.current.slice((pageRef.current - 1) * 200, pageRef.current * 200), errorPlaylist);
        const errorLocal = errorPositions?.[currentIndex];
        const index = errorLocal !== undefined ? (pageRef.current - 1) * 200 + errorLocal + 1 : currentIndex + 1 + (pageRef.current - 1) * 200;
        setCurrentVideoIndex(index);

        if (index > plLengthRef.current) {
          setShowResetConfirm(true);
          return;
        }

        if (isSessionBlocked) {
          toast.error("YouTube blocked playback. Video was not skipped.", { duration: 4000 });
          return;
        }

        skipAttemptCountRef.current += 1;

        if (skipAttemptCountRef.current > 25) {
          toast.error("Too many unavailable videos in a row. Try a different section.", { duration: 4000 });
          skipAttemptCountRef.current = 0;
          return;
        }

        const nextIndex = index + 1;
        startAutoSkip(nextIndex);
      } catch (err) {
        console.warn("Could not get playlist index for error:", err);
      }

      return;
    }

    if (!isPlayerReady || !hasValidVideoIds) return;

    toast(
      (t: Toast) => (
        <div className="flex items-center gap-2">
          <span>Error, Please refresh!</span>
          <span
            onClick={() => {
              window.location.reload();
              toast.dismiss(t.id);
            }}
            className="cursor-pointer rounded-sm bg-indigo-600 px-2 py-1 text-sm text-white hover:bg-indigo-600"
          >
            Refresh
          </span>
        </div>
      ),
      toastRefresh,
    );
  }

  async function onStateChange(e: YouTubeEvent) {
    try {
      if (!e.target || restoringRef.current || e.target !== restoreRef.current?.player) return;

      progressPlayerRef.current = e.target;
      if (e.data === 1) hasPlayedRef.current = true;

      // -1 (unstarted)
      // 0 (ended)
      // 1 (playing)
      // 2 (paused)
      // 3 (buffering)
      // 5 (video cued)

      const rawIndex = await e.target.getPlaylistIndex();
      const actualPlaylist = typeof e.target.getPlaylist === "function" ? e.target.getPlaylist() : undefined;
      const statePositions = mapPlaylistPositions(videosIdsRef.current.slice((pageRef.current - 1) * 200, pageRef.current * 200), actualPlaylist);
      const canonicalLocal = statePositions?.[rawIndex];
      const index = canonicalLocal !== undefined ? (pageRef.current - 1) * 200 + canonicalLocal + 1 : rawIndex + 1 + (pageRef.current - 1) * 200;
      if (e.data === 1) {
        setCurrentVideoIndex(index);
        if (embedErrorRef.current) {
          updateEmbedError(false);
          cancelAutoSkip();
        }
        skipAttemptCountRef.current = 0;
      }

      const title = e.target.getVideoData()?.title;
      if (title) setCurrentVideoTitle(title);
      setCurrentTime(e.target.getCurrentTime());

      let videoId = e.target.getVideoData()?.video_id;
      if (!videoId) return;

      currentVideoId.current = videoId;
      setCurrentVideoIdState(videoId);

      const video = playlistVideosByIdRef.current.get(videoId);
      if (!video) {
        setDescription(null);
        setPublishedAt(null);
        return;
      }
      setDescription(video.description ?? null);
      setPublishedAt(video.publishedAt ?? null);
    } catch (error) {
      console.error("Error in onStateChange:", error);
    }
  }

  async function onEnd(e: YouTubeEvent) {
    try {
      if (!e.target || restoringRef.current || e.target !== restoreRef.current?.player || operationRef.current) return;
      isPlayingVideoRef.current = false;

      if (embedErrorRef.current) {
        return;
      }

      if (!shuffledRef.current) {
        await savePlaylistsProgress(e.target, playlistId, pageRef.current).catch(() => {});
      }

      const currentIndex = await e.target.getPlaylistIndex();
      const playlist = await e.target.getPlaylist();

      if (!playlist) return;

      const endPositions = mapPlaylistPositions(videosIdsRef.current.slice((pageRef.current - 1) * 200, pageRef.current * 200), playlist);
      const nextLocal = endPositions?.[currentIndex + 1];
      if (nextLocal !== undefined) {
        await playVideoAt((pageRef.current - 1) * 200 + nextLocal + 1);
        return;
      }

      // End of the loaded slice: first canonical index past the requested loaded extent, if it exists.
      // New videos appended within the same page reload at the old requested end; filtered holes are included in it.
      if (currentIndex + 1 >= playlist.length) {
        const nextAbsolute = loadedPageEndRef.current;
        if (nextAbsolute < plLengthRef.current) {
          await playVideoAt(nextAbsolute + 1);
        }
      }
    } catch (error) {
      console.error("Error in onEnd:", error);
    }
  }

  function onSpeedChange(e: YouTubeEvent) {
    if (restoringRef.current || (e.target && e.target !== restoreRef.current?.player)) return;
    const currentData = safeParse<{ playbackSpeed?: number } & Record<string, unknown>>(safeGetItem(item), {});
    currentData.playbackSpeed = e.data;

    safeSetItem(item, JSON.stringify(currentData));
  }

  async function previousVideo() {
    try {
      const player = PlaylistPlayerRef.current?.getInternalPlayer();
      if (!player) return;

      const [playlistIndex, playlist] = await Promise.all([player.getPlaylistIndex(), player.getPlaylist().catch(() => null)]);
      const prevPositions = mapPlaylistPositions(videosIdsRef.current.slice((pageRef.current - 1) * 200, pageRef.current * 200), playlist);
      const prevLocal = prevPositions?.[playlistIndex - 1];
      if (prevLocal !== undefined) {
        await playVideoAt((pageRef.current - 1) * 200 + prevLocal + 1);
        return;
      }

      // At the start of the loaded slice: last canonical index of the previous 200-item page.
      if (playlistIndex === 0) {
        const prevAbsolute = (pageRef.current - 1) * 200 - 1;
        if (prevAbsolute >= 0) {
          await playVideoAt(prevAbsolute + 1);
        }
      }
    } catch (error) {
      console.error("Error in previousVideo:", error);
    }
  }

  async function nextVideo() {
    try {
      const player = PlaylistPlayerRef.current?.getInternalPlayer();
      if (!player) return;

      const [playlistIndex, playlist] = await Promise.all([player.getPlaylistIndex(), player.getPlaylist().catch(() => null)]);
      const nextPositions = mapPlaylistPositions(videosIdsRef.current.slice((pageRef.current - 1) * 200, pageRef.current * 200), playlist);
      const nextLocal = nextPositions?.[playlistIndex + 1];
      if (nextLocal !== undefined) {
        await playVideoAt((pageRef.current - 1) * 200 + nextLocal + 1);
        return;
      }

      // At the end of the loaded slice: first canonical index past the requested loaded extent.
      if (Array.isArray(playlist) && playlistIndex + 1 >= playlist.length) {
        const nextAbsolute = loadedPageEndRef.current;
        if (nextAbsolute < plLengthRef.current) {
          await playVideoAt(nextAbsolute + 1);
        }
      }
    } catch (error) {
      console.error("Error in nextVideo:", error);
    }
  }

  async function nextVideoOnError() {
    try {
      const target = pendingSkipTargetRef.current;
      if (target !== null) {
        await skipToIndex(target);
        return;
      }

      const player = PlaylistPlayerRef.current?.getInternalPlayer();
      if (player) {
        const [playlistIndex, playlist] = await Promise.all([player.getPlaylistIndex(), player.getPlaylist().catch(() => null)]);
        const errNextPositions = mapPlaylistPositions(videosIdsRef.current.slice((pageRef.current - 1) * 200, pageRef.current * 200), playlist);
        const errNextLocal = errNextPositions?.[playlistIndex + 1];
        const nextAbs = errNextLocal !== undefined ? (pageRef.current - 1) * 200 + errNextLocal + 1 : loadedPageEndRef.current + 1;
        await skipToIndex(nextAbs);
      }
    } catch (error) {
      console.error("Error in nextVideoOnError:", error);
    }
  }

  async function playVideoAt(index: number) {
    if (operationRef.current || restoringRef.current) return;
    operationRef.current = true;
    const prevPage = pageRef.current;
    try {
      const player = PlaylistPlayerRef.current?.getInternalPlayer();
      if (!player) return;
      if (!Number.isInteger(index) || index < 1 || index > videosIdsRef.current.length) return;

      cancelAutoSkip();

      const zeroBasedIndex = index - 1;
      const targetPage = Math.floor(zeroBasedIndex / 200) + 1;
      const paginatedIndex = zeroBasedIndex % 200;
      let actualPosition = -1;
      try {
        const playlist = await player.getPlaylist();
        // Find the actual playlist position whose canonical slot on the target page is the requested local index.
        const targetSlice = videosIdsRef.current.slice((targetPage - 1) * 200, targetPage * 200);
        const positions = mapPlaylistPositions(targetSlice, playlist);
        if (positions) actualPosition = positions.indexOf(paginatedIndex);
      } catch (err) {
        console.warn("Could not get player playlist:", err);
      }

      if (targetPage === pageRef.current && actualPosition >= 0) {
        // Same canonical page and the target survived filtering — jump by its actual position.
        await player.playVideoAt(actualPosition);
      } else {
        pageRef.current = targetPage;
        // Filtered-safe loader handles missing target fallback.
        await loadPlaylist(player, videosIdsRef.current, targetPage, paginatedIndex);
        loadedPageEndRef.current = Math.min(targetPage * 200, videosIdsRef.current.length);
      }
    } catch (error) {
      pageRef.current = prevPage;
      console.error("Error in playVideoAt:", error);
    } finally {
      operationRef.current = false;
    }
  }

  async function resetPlaylist(reAddRemoved = false) {
    if (operationRef.current || restoringRef.current) return;
    operationRef.current = true;
    try {
      setIsLoading(true);
      cancelAutoSkip();

      // Refresh from YouTube; fall back to cache if fetch fails
      let pl = await get(`pl=${playlistId}`).catch(() => undefined);
      try {
        const freshData = await fetchVideosIds(playlistId, undefined, isChannel, {
          allowCacheFallback: !reAddRemoved,
          persistCache: false,
          removedVideoIds: reAddRemoved ? [] : undefined,
        });
        if (freshData) {
          pl = freshData;
        }
      } catch (err) {
        if (reAddRemoved) throw err;
        console.warn("Could not refresh playlist from YouTube, using cache:", err);
      }

      if (!pl || !pl.length) {
        throw new Error("No playable playlist data found for reset");
      }

      const player = PlaylistPlayerRef.current?.getInternalPlayer();
      if (!player) {
        console.error("Player not available for reset");
        return;
      }

      const targetIds = pl.map((video: PlaylistAPI) => video.id);

      const loaded = await loadPlaylist(player, targetIds, 1, 0);

      // Commit staged state only after the target load succeeds.
      updateEmbedError(false);
      pageRef.current = 1;
      videosIdsRef.current = targetIds;
      plLengthRef.current = targetIds.length;
      playlistVideosByIdRef.current = new Map(pl.map((video: PlaylistAPI) => [video.id, video]));
      normalOrderVideosRef.current = pl;
      setVideosList(pl);
      lastFetchedCountRef.current = pl.length;
      shuffledRef.current = false;
      setIsShuffled(false);
      loadedPageEndRef.current = Math.min(200, targetIds.length);

      void set(`pl=${playlistId}`, pl).catch(() => {});
      if (reAddRemoved) {
        void del(`plRemoved=${playlistId}`).catch(() => {});
      }

      const plVideos = safeParse<{ videosIds?: string[]; updatedTime?: number } & Record<string, unknown>>(safeGetItem(`plVideos=${playlistId}`), {});
      plVideos.videosIds = targetIds;
      plVideos.updatedTime = Date.now();
      safeSetItem(`plVideos=${playlistId}`, JSON.stringify(plVideos));

      const savedAbsolute = loaded.canonicalIndex;
      const existingPl = safeParse<Record<string, unknown>>(safeGetItem(item), {});
      safeSetItem(item, JSON.stringify({ ...existingPl, playlistId, currentItem: savedAbsolute % 200, currentPage: Math.floor(savedAbsolute / 200) + 1, initialTime: 0 }));
      setCurrentVideoIndex(savedAbsolute + 1);
    } catch (e) {
      console.error("Error resetting playlist:", e);
      toast.error("Failed to reset playlist. Try refreshing the page.");
    } finally {
      operationRef.current = false;
      setIsLoading(false);
    }
  }

  async function removeVideo() {
    if (isRemoving || operationRef.current || restoringRef.current) return;

    if (shuffledRef.current) {
      toast.error("Unshuffle before removing videos");
      return;
    }

    operationRef.current = true;
    setIsRemoving(true);
    try {
      cancelAutoSkip();
      const player = PlaylistPlayerRef.current?.getInternalPlayer();

      if (!player) return;

      const state = await player.getPlayerState();

      if (state === 5 || state === 3 || state === 0) return;

      const currentIndex = await player.getPlaylistIndex();
      const currentPlaylist = await player.getPlaylist();
      const currentVidId = Array.isArray(currentPlaylist) ? currentPlaylist[currentIndex] : undefined;

      if (!currentVidId) return;

      const [plRaw, removedRaw] = await Promise.all([
        get(`pl=${playlistId}`).catch(() => undefined),
        get(`plRemoved=${playlistId}`).catch(() => undefined),
      ]);
      if (!Array.isArray(plRaw) || plRaw.length === 0) {
        throw new Error("Playlist metadata not ready. Please retry.");
      }
      const plIds = new Set(plRaw.map((video: PlaylistAPI) => video.id));
      if (!plIds.has(currentVidId) || !videosIdsRef.current.every((id) => plIds.has(id))) {
        throw new Error("Playlist metadata not ready. Please retry.");
      }
      const pl = plRaw;
      const removedVideos = Array.isArray(removedRaw) ? removedRaw.filter((v: unknown): v is string => typeof v === "string") : [];

      const newPl = pl.filter((video: PlaylistAPI) => video.id !== currentVidId);
      const updatedRemovedVideos = [...new Set([...removedVideos, currentVidId])];

      await setMany([
        [`pl=${playlistId}`, newPl],
        [`plRemoved=${playlistId}`, updatedRemovedVideos],
      ]);

      const removedPositions = mapPlaylistPositions(videosIdsRef.current.slice((pageRef.current - 1) * 200, pageRef.current * 200), currentPlaylist);
      const removedLocal = removedPositions?.[currentIndex];
      const removedAbs = removedLocal !== undefined ? (pageRef.current - 1) * 200 + removedLocal : -1;
      videosIdsRef.current = newPl.map((video: PlaylistAPI) => video.id);
      plLengthRef.current = videosIdsRef.current.length;
      updatePlaylistVideosCache(newPl);

      const plVideos = safeParse<{ videosIds?: string[]; updatedTime?: number } & Record<string, unknown>>(safeGetItem(`plVideos=${playlistId}`), {});
      plVideos.videosIds = videosIdsRef.current;
      safeSetItem(`plVideos=${playlistId}`, JSON.stringify(plVideos));

      if (plLengthRef.current === 0) {
        setVideosList(newPl);
        await onDelete();
        return;
      }

      const targetGlobal = Math.min(removedAbs >= 0 ? removedAbs : (pageRef.current - 1) * 200 + currentIndex, newPl.length - 1);
      const targetPage = Math.floor(targetGlobal / 200) + 1;
      const targetLocal = targetGlobal % 200;
      pageRef.current = targetPage;
      currentVideoId.current = newPl[targetGlobal].id;

      const loaded = await loadPlaylist(player, videosIdsRef.current, targetPage, targetLocal);
      loadedPageEndRef.current = Math.min(targetPage * 200, videosIdsRef.current.length);

      const persistAbsolute = (targetPage - 1) * 200 + loaded.canonicalIndex;
      const existingPl = safeParse<Record<string, unknown>>(safeGetItem(item), {});
      safeSetItem(item, JSON.stringify({ ...existingPl, playlistId, currentItem: persistAbsolute % 200, currentPage: Math.floor(persistAbsolute / 200) + 1, initialTime: 0 }));

      setVideosList(newPl);
      await handleVideoPlayback("pause");
    } catch (error) {
      console.error("Error removing video:", error);
      toast.error("Failed to remove video");
    } finally {
      operationRef.current = false;
      if (!disposedRef.current) setIsRemoving(false);
    }
  }

  async function onDelete() {
    isPlayingVideoRef.current = null;
    router.replace("/");

    onDeleteItems(playlistId, "playlists");
    await del(item);
    await del(`plRemoved=${playlistId}`);

    queryClient.setQueryData<Items>(["playlists"], (oldData: Items | undefined) => {
      if (oldData) {
        return {
          ...oldData,
          items: oldData.items.filter((pl: Playlist) => pl.id !== playlistId),
        };
      }
      return oldData;
    });
  }

  const isVideoPaused = useCallback(async () => {
    if (restoringRef.current) return true;
    try {
      const player = PlaylistPlayerRef.current?.internalPlayer;
      if (!player) return true;

      const playerState = await player.getPlayerState();
      return playerState !== 1;
    } catch (error) {
      console.error("Error checking video pause state:", error);
      return true;
    }
  }, []);

  const handleVideoPlayback = useCallback(async (mode: "play" | "pause") => {
    if (restoringRef.current) return;
    try {
      const player = PlaylistPlayerRef.current?.internalPlayer;
      if (!player) return;

      const playerState = await player.getPlayerState();

      if (mode === "play" && playerState === 2) {
        await player.playVideo();
        isPaused.current = false;
      } else if (mode === "pause" && playerState === 1) {
        await player.pauseVideo();
        isPaused.current = true;
      }
    } catch (error) {
      console.error("Error handling video playback:", error);
    }
  }, []);

  async function onShuffle() {
    if (operationRef.current || restoringRef.current || shuffledRef.current) return;

    const playerState = await PlaylistPlayerRef.current?.internalPlayer.getPlayerState().catch(() => undefined);
    if (operationRef.current) return;
    if ((playerState !== 1 && playerState !== 2) || !plLengthRef.current || !videosIdsRef.current.length) {
      return;
    }

    const [localIndex, actualPlaylist] = await Promise.all([
      PlaylistPlayerRef.current?.internalPlayer.getPlaylistIndex().catch(() => undefined),
      PlaylistPlayerRef.current?.internalPlayer.getPlaylist().catch(() => undefined),
    ]);

    operationRef.current = true;
    shuffledRef.current = true;
    setIsShuffled(true);
    cancelAutoSkip();

    const savedPage = pageRef.current;
    const originalIds = videosIdsRef.current;
    const shufflePositions = mapPlaylistPositions(videosIdsRef.current.slice((savedPage - 1) * 200, savedPage * 200), actualPlaylist);
    const mappedLocal = Number.isInteger(localIndex) ? shufflePositions?.[localIndex as number] : undefined;
    const fallbackAbs = Number.isInteger(localIndex) ? (savedPage - 1) * 200 + (localIndex as number) : currentVideoIndex ? currentVideoIndex - 1 : 0;
    const abs = mappedLocal !== undefined ? (savedPage - 1) * 200 + mappedLocal : fallbackAbs;
    pageAndIndexBeforeShuffle.current = {
      page: Math.floor(abs / 200) + 1,
      index: abs % 200,
    };
    pageRef.current = 1;

    try {
      const cached = (await get(`pl=${playlistId}`).catch(() => undefined)) as Playlist[] | undefined;
      const data = Array.isArray(cached) && cached.length ? cached : videosList;
      normalOrderVideosRef.current = data;

      const shuffledVideos = shuffle(data);
      const shuffledIds = shuffledVideos.map((item) => item.id);

      await loadPlaylist(PlaylistPlayerRef.current?.getInternalPlayer(), shuffledIds, 1, 0);
      loadedPageEndRef.current = Math.min(200, shuffledIds.length);

      videosIdsRef.current = shuffledIds;
      updatePlaylistVideosCache(shuffledVideos);
      setVideosList(shuffledVideos);
    } catch (error) {
      console.error("Error shuffling playlist:", error);
      videosIdsRef.current = originalIds;
      pageRef.current = savedPage;
      shuffledRef.current = false;
      setIsShuffled(false);
      toast.error("Failed to shuffle playlist");
    } finally {
      operationRef.current = false;
    }
  }

  async function unShuffle() {
    if (operationRef.current || restoringRef.current || !shuffledRef.current) return;

    operationRef.current = true;
    cancelAutoSkip();

    const { page, index } = pageAndIndexBeforeShuffle.current;
    const originalIds = videosIdsRef.current;
    const originalPage = pageRef.current;

    try {
      const cached = (await get(`pl=${playlistId}`).catch(() => undefined)) as Playlist[] | undefined;
      const data = normalOrderVideosRef.current.length ? normalOrderVideosRef.current : Array.isArray(cached) && cached.length ? cached : videosList;

      const restoredIds = data.map((item) => item.id);
      pageRef.current = page;
      await loadPlaylist(PlaylistPlayerRef.current?.getInternalPlayer(), restoredIds, page, index);
      loadedPageEndRef.current = Math.min(page * 200, restoredIds.length);

      videosIdsRef.current = restoredIds;
      updatePlaylistVideosCache(data);
      setVideosList(data);
      shuffledRef.current = false;
      setIsShuffled(false);
    } catch (error) {
      console.error("Error unshuffling playlist:", error);
      videosIdsRef.current = originalIds;
      pageRef.current = originalPage;
      toast.error("Failed to unshuffle playlist");
    } finally {
      operationRef.current = false;
    }
  }

  const plOptions = initialOptions;

  // Memoize title computations
  const playlistTitle = useMemo(() => reduceStringSize(params.title, 100), [params.title]);

  const isSmaller = useMediaQuery("(max-width: 1780px)");

  if (!isMounted) return null;

  return (
    <>
      <div className="fixed top-0 left-0 z-20 h-12 w-full bg-background" />
      <LogoButton />
      <div className="flex flex-col items-center justify-center pt-12 3xl:pr-[100px]">
        <div className="videoPlayer flex w-full min-w-0 items-center justify-center p-[2.4px] pt-2 xl:max-w-[72vw] xl:pt-0 2xl:max-w-[100vw]">
          <div className="relative w-full overflow-auto pb-[56.25%]">
            {(isLoading || !isInitialFetchDone || isFetchingVideos) && (
              <div className="absolute inset-0 -mt-1 -ml-4 flex flex-col items-center justify-center">
                <Spin className="h-7 w-7 animate-spin text-indigo-500" />
                <span className="sr-only">Loading...</span>
              </div>
            )}
            {isInitialFetchDone && !isLoading && !isFetchingVideos && !hasValidVideoIds && (
              <div className="absolute inset-0 -mt-1 -ml-4 flex flex-col items-center justify-center gap-3">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">{fetchError || "Playlist is empty or unavailable."}</span>
                <button
                  onClick={() => window.location.reload()}
                  className="cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700"
                >
                  Retry
                </button>
              </div>
            )}
            {plOptions && isInitialFetchDone && hasValidVideoIds && videosIdsRef.current.length > 0 && (
              <>
                <YouTube
                  ref={PlaylistPlayerRef}
                  opts={plOptions}
                  onReady={onReady}
                  onPlay={onPlay}
                  onPause={onPause}
                  onEnd={onEnd}
                  onError={onError}
                  onStateChange={onStateChange}
                  onPlaybackRateChange={onSpeedChange}
                  className="absolute top-0 right-0 left-0 h-full w-full border-none"
                />

                {restoreError && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/70">
                    <span className="max-w-[90%] text-center text-sm text-neutral-200">{restoreError}</span>
                    <button
                      onClick={() => {
                        setRestoreError("");
                        const target = restoreTargetRef.current;
                        if (target) void onReady({ target, data: null } as unknown as YouTubeEvent);
                      }}
                      className="cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700"
                    >
                      Retry playback
                    </button>
                  </div>
                )}

                {embedError && (
                  <div className="absolute right-0 bottom-0 left-0 z-20 flex flex-col items-center justify-center pb-4">
                    <div className="relative max-w-[95%] rounded-lg border border-neutral-300 bg-neutral-100/95 px-6 py-4 shadow-lg dark:border-neutral-700 dark:bg-neutral-900/95">
                      <button
                        onClick={() => {
                          updateEmbedError(false);
                          cancelAutoSkip();
                          skipAttemptCountRef.current = 0;
                        }}
                        className="absolute top-2 right-2 cursor-pointer text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
                        aria-label="Close"
                      >
                        <Close className="h-5 w-5" />
                      </button>

                      <div className="text-center">
                        <h2 className="mb-2 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                          {isYouTubeSessionBlocked(embedErrorReason) ? "YouTube Blocked Playback" : "Video Unavailable"}
                          {autoSkipCountdown !== null && (
                            <span className="ml-2 text-sm font-normal text-neutral-500 dark:text-neutral-400">
                              (skipping in {autoSkipCountdown}s)
                            </span>
                          )}
                        </h2>
                        {embedErrorReason && <p className="mb-3 text-sm text-neutral-600 dark:text-neutral-400">{embedErrorReason}</p>}
                        <div className="flex flex-wrap justify-center gap-2">
                          {autoSkipCountdown !== null && (
                            <button
                              onClick={() => {
                                cancelAutoSkip();
                                skipAttemptCountRef.current = 0;
                              }}
                              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                            >
                              Cancel Skip
                            </button>
                          )}
                          <button
                            onClick={nextVideoOnError}
                            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                          >
                            <PointerRight className="h-5 w-5" />
                            Skip Now
                          </button>
                          <Link
                            href={`https://www.youtube.com/watch?v=${currentVideoIdState}&list=${playlistId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                              cancelAutoSkip();
                              skipAttemptCountRef.current = 0;
                            }}
                            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                          >
                            <Youtube className="h-5 w-5" />
                            Watch on YouTube
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {!isSmaller && <VideosListSidebar videosList={videosList} playVideoAt={playVideoAt} currentVideoIndex={currentVideoIndex} className="xl:absolute" playlistId={playlistId} unavailableVideoIds={unavailableVideoIds} />}
        </div>
        {!!plLengthRef.current && (
          <div className="flex max-w-[80vw] flex-col pt-1 md:max-w-[60vw] 2xl:max-w-[65vw] 2xl:pt-2">
            <div className="xs:gap-3 my-[4px] flex justify-center gap-1 py-2 max-md:flex-wrap sm:py-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <ResetPlaylistModal resetPlaylist={resetPlaylist} isVideoPaused={isVideoPaused} handleVideoPlayback={handleVideoPlayback} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Restart Playlist</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="-mr-[6px] flex h-8 w-8 cursor-pointer items-center justify-center text-neutral-600 outline-hidden transition duration-300 hover:text-neutral-950 focus:text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-200"
                      onClick={() => seekTime(isPlayingVideoRef, PlaylistPlayerRef, -10)}
                    >
                      <Rewind10 className="h-full w-full" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Rewind 10s</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="flex h-8 w-8 cursor-pointer items-center justify-center text-neutral-600 outline-hidden transition duration-300 hover:text-neutral-950 focus:text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-200"
                      onClick={previousVideo}
                    >
                      <PointerLeft className="h-full w-full" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Previous Video</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="flex h-8 w-8 cursor-pointer items-center justify-center text-neutral-600 outline-hidden transition duration-300 hover:text-neutral-950 focus:text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-200"
                      onClick={nextVideo}
                    >
                      <PointerRight className="h-full w-full" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Next Video</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="-ml-[6px] flex h-8 w-8 cursor-pointer items-center justify-center text-neutral-600 outline-hidden transition duration-300 hover:text-neutral-950 focus:text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-200"
                      onClick={() => seekTime(isPlayingVideoRef, PlaylistPlayerRef, 10)}
                    >
                      <Skip10 className="h-full w-full" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Skip 10s</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={`https://www.youtube.com/watch?v=${currentVideoIdState}&list=${playlistId}&t=${Math.floor(currentTime)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mx-[3px] mt-[1px] flex size-[30px] cursor-pointer items-center justify-center"
                    >
                      <Youtube className="h-full w-full text-neutral-600 transition duration-300 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-200" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>Open on Youtube</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={currentChannelName ? `https://www.youtube.com/channel/${currentChannelName}` : "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mx-[0px] mt-[1px] flex size-[30px] cursor-pointer items-center justify-center"
                    >
                      <Channel className="h-full w-full text-neutral-600 transition duration-300 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-200" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>Open Channel</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <ModalDelete
                        icon={<RemoveVideo className="mx-[2px] mb-[3px] size-[30px]" />}
                        deleteText="Remove"
                        type="Video"
                        extraText="From Playlist"
                        title={currentVideoTitle}
                        onDelete={removeVideo}
                        handleVideoPlayback={handleVideoPlayback}
                        isVideoPaused={isVideoPaused}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Remove Video from Playlist</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="flex h-8 w-8 cursor-pointer items-center justify-center text-neutral-600 outline-hidden transition duration-300 hover:text-neutral-950 focus:text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-200"
                      onClick={isShuffled ? unShuffle : onShuffle}
                    >
                      <Shuffle className={`mt-[1px] h-[30px] w-[30px] ${isShuffled && "text-indigo-500"}`} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{isShuffled ? "Unshuffle" : "Shuffle"}</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <ModalDelete
                        icon={<Close className="h-9 w-9" />}
                        deleteText="Remove"
                        type="Playlist"
                        title={currentVideoTitle}
                        onDelete={onDelete}
                        handleVideoPlayback={handleVideoPlayback}
                        isVideoPaused={isVideoPaused}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Delete Playlist</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <p className="min-w-[96px] px-1 pt-[1px] text-[1.35rem] tabular-nums whitespace-nowrap text-neutral-600 max-md:text-center dark:text-[#818386]">
                {currentVideoIndex && plLengthRef.current && !isNaN(plLengthRef.current) ? (
                  <span>
                    {currentVideoIndex} / {plLengthRef.current}
                  </span>
                ) : null}
              </p>
            </div>

            <div className="pb-5 max-2xl:-mt-1 2xl:pb-1">
              {currentVideoTitle && (
                <span className="flex justify-center text-center tracking-wide break-words text-neutral-800 dark:text-neutral-200">
                  {currentVideoTitle} - {playlistTitle}
                </span>
              )}
            </div>

            {publishedAt && <VideoDate publishedAt={publishedAt} />}

            {description && <Description description={description} className="pt-5 pb-2 2xl:pt-4" />}

            <div>{isSmaller && <VideosListSidebar videosList={videosList} playVideoAt={playVideoAt} currentVideoIndex={currentVideoIndex} playlistId={playlistId} unavailableVideoIds={unavailableVideoIds} />}</div>
          </div>
        )}
      </div>
      {showResetConfirm && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="pointer-events-auto max-w-[90vw] min-w-[320px] rounded-2xl border border-neutral-200 bg-white p-8 shadow-2xl dark:border-neutral-700 dark:bg-neutral-900">
            <h2 className="mb-4 text-center text-xl font-bold text-neutral-800 dark:text-neutral-100">An error has occurred</h2>
            <div className="flex justify-center gap-3">
              <button
                className="cursor-pointer rounded-lg bg-gray-200 px-5 py-2 font-medium text-gray-800 transition hover:bg-gray-300 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                onClick={() => setShowResetConfirm(false)}
              >
                Close
              </button>
              <button
                className="cursor-pointer rounded-lg bg-blue-500 px-5 py-2 font-medium text-white transition hover:bg-blue-600"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </button>
              <button
                className="cursor-pointer rounded-lg bg-indigo-600 px-5 py-2 font-medium text-white transition hover:bg-indigo-700"
                onClick={async () => {
                  setShowResetConfirm(false);
                  await resetPlaylist();
                }}
              >
                Reset Playlist
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
