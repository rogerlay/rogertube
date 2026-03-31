import { useState, useEffect, useCallback } from "react";
import type { Preferences } from "@shared/schema";

export function usePreferences() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [watchPositions, setWatchPositions] = useState<Record<string, number>>({});
  const [favoriteNotes, setFavoriteNotes] = useState<Record<string, string>>({});
  const [readIds, setReadIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/preferences")
      .then((r) => r.json())
      .then((prefs: Preferences) => {
        setFavorites(prefs.favorites ?? []);
        setWatchPositions(prefs.watchPositions ?? {});
        setFavoriteNotes(prefs.favoriteNotes ?? {});
        setReadIds(prefs.readIds ?? []);
        setLoaded(true);
      })
      .catch(console.error);
  }, []);

  const patchPreferences = useCallback(async (patch: Partial<Preferences>) => {
    try {
      const updated: Preferences = await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      }).then((r) => r.json());
      return updated;
    } catch (err) {
      console.error("[preferences] patch failed:", err);
    }
  }, []);

  const handleToggleFavorite = useCallback(
    async (videoId: string) => {
      const next = favorites.includes(videoId)
        ? favorites.filter((id) => id !== videoId)
        : [...favorites, videoId];
      setFavorites(next);
      // Do NOT touch favoriteNotes here
      await patchPreferences({ favorites: next });
    },
    [favorites, patchPreferences]
  );

  const handleUpdateWatchPosition = useCallback(
    async (videoId: string, seconds: number) => {
      setWatchPositions((prev) => ({ ...prev, [videoId]: seconds }));
      await patchPreferences({ watchPositions: { [videoId]: seconds } });
    },
    [patchPreferences]
  );

  const handleSaveFavoriteNote = useCallback(
    async (videoId: string, note: string) => {
      setFavoriteNotes((prev) => ({ ...prev, [videoId]: note }));
      await patchPreferences({ favoriteNotes: { [videoId]: note } });
    },
    [patchPreferences]
  );

  const handleMarkRead = useCallback(
    async (itemId: string) => {
      if (readIds.includes(itemId)) return;
      const next = [...readIds, itemId];
      setReadIds(next);
      try {
        await fetch("/api/read-state/mark", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId }),
        });
      } catch (err) {
        console.error("[read-state] mark failed:", err);
      }
    },
    [readIds]
  );

  return {
    loaded,
    favorites,
    watchPositions,
    favoriteNotes,
    readIds,
    handleToggleFavorite,
    handleUpdateWatchPosition,
    handleSaveFavoriteNote,
    handleMarkRead,
  };
}
