import { useState, useEffect, useCallback, useRef } from "react";
import type { Video, Channel } from "@shared/schema";

const REFRESH_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

export function useVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchVideos = useCallback(async () => {
    try {
      const [videosRes, channelsRes] = await Promise.all([
        fetch("/api/videos"),
        fetch("/api/channels"),
      ]);
      if (!videosRes.ok) throw new Error(`Videos HTTP ${videosRes.status}`);
      if (!channelsRes.ok) throw new Error(`Channels HTTP ${channelsRes.status}`);
      const [vids, chs] = await Promise.all([videosRes.json(), channelsRes.json()]);
      setVideos(vids);
      setChannels(chs);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load videos");
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshVideos = useCallback(async () => {
    setLoading(true);
    try {
      await fetch("/api/videos/refresh", { method: "POST" });
      await fetchVideos();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }, [fetchVideos]);

  const refetchChannels = useCallback(async () => {
    try {
      const res = await fetch("/api/channels");
      const chs = await res.json();
      setChannels(chs);
    } catch (err) {
      console.error("[channels] refetch failed:", err);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
    timerRef.current = setInterval(fetchVideos, REFRESH_INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchVideos]);

  return { videos, channels, loading, error, refreshVideos, refetchChannels, fetchVideos };
}
