import { useState, useEffect, useCallback, useRef } from "react";
import type { Feed, FeedItem } from "@shared/schema";

const REFRESH_INTERVAL_MS = 45 * 60 * 1000; // 45 minutes

export function useFeeds() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchFeeds = useCallback(async () => {
    try {
      const [feedsRes, itemsRes] = await Promise.all([
        fetch("/api/feeds"),
        fetch("/api/feed-items"),
      ]);
      if (!feedsRes.ok) throw new Error(`Feeds HTTP ${feedsRes.status}`);
      if (!itemsRes.ok) throw new Error(`Feed items HTTP ${itemsRes.status}`);
      const [f, items] = await Promise.all([feedsRes.json(), itemsRes.json()]);
      setFeeds(f);
      setFeedItems(items);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load feeds");
    } finally {
      setLoading(false);
    }
  }, []);

  const refetchFeeds = useCallback(async () => {
    try {
      const res = await fetch("/api/feeds");
      const f = await res.json();
      setFeeds(f);
    } catch (err) {
      console.error("[feeds] refetch failed:", err);
    }
  }, []);

  useEffect(() => {
    fetchFeeds();
    timerRef.current = setInterval(fetchFeeds, REFRESH_INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchFeeds]);

  return { feeds, feedItems, loading, error, refetchFeeds, fetchFeeds };
}
