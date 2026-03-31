import { useState, useCallback } from "react";
import type { AppMode } from "../App";
import type { Video, FeedItem } from "@shared/schema";

import Header from "../components/Header";
import ChannelChips from "../components/youtube/ChannelChips";
import VideoGrid, { type SortMode } from "../components/youtube/VideoGrid";
import VideoPlayerModal from "../components/youtube/VideoPlayerModal";
import AddChannelDialog from "../components/youtube/AddChannelDialog";
import ManageChannelsDialog from "../components/youtube/ManageChannelsDialog";
import AddYouTubeLinkDialog from "../components/youtube/AddYouTubeLinkDialog";
import FeedSidebar, { type FeedSelection } from "../components/feeds/FeedSidebar";
import FeedList from "../components/feeds/FeedList";
import FeedReader from "../components/feeds/FeedReader";

import { usePreferences } from "../hooks/usePreferences";
import { useVideos } from "../hooks/useVideos";
import { useFeeds } from "../hooks/useFeeds";
import type { ViewMode } from "../components/youtube/ChannelChips";

interface HomeProps {
  mode: AppMode;
  setMode: (m: AppMode) => void;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
}

export default function Home({ mode, setMode, darkMode, setDarkMode }: HomeProps) {
  // ── YouTube state ─────────────────────────────────────────────────────────
  const [videoViewMode, setVideoViewMode] = useState<ViewMode>("ALL");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showAddChannel, setShowAddChannel] = useState(false);
  const [showManageChannels, setShowManageChannels] = useState(false);
  const [showAddLink, setShowAddLink] = useState(false);

  // ── Feeds state ───────────────────────────────────────────────────────────
  const [feedSelection, setFeedSelection] = useState<FeedSelection>("ALL");
  const [selectedFeedItem, setSelectedFeedItem] = useState<FeedItem | null>(null);

  // ── Hooks ─────────────────────────────────────────────────────────────────
  const {
    favorites,
    watchPositions,
    favoriteNotes,
    readIds,
    handleToggleFavorite,
    handleUpdateWatchPosition,
    handleSaveFavoriteNote,
    handleMarkRead,
  } = usePreferences();

  const { videos, channels, loading: videosLoading, error: videosError, refreshVideos, refetchChannels, fetchVideos } = useVideos();
  const { feeds, feedItems, loading: feedsLoading, refetchFeeds } = useFeeds();

  const feedsUnread = feedItems.filter((item) => !readIds.includes(item.id)).length;

  // ── Channel actions ───────────────────────────────────────────────────────
  const handleAddChannel = useCallback(async (urlOrId: string, name?: string) => {
    const res = await fetch("/api/channels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urlOrId, name }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to add channel");
    }
    await refetchChannels();
    await refreshVideos();
  }, [refetchChannels, refreshVideos]);

  const handleRenameChannel = useCallback(async (id: string, name: string) => {
    await fetch(`/api/channels/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    await refetchChannels();
  }, [refetchChannels]);

  const handleDeleteChannel = useCallback(async (id: string) => {
    await fetch(`/api/channels/${id}`, { method: "DELETE" });
    await refetchChannels();
    if (videoViewMode === id) setVideoViewMode("ALL");
  }, [refetchChannels, videoViewMode]);

  const handleDeleteFeed = useCallback(async (id: string) => {
    await fetch(`/api/feeds/${id}`, { method: "DELETE" });
    await refetchFeeds();
  }, [refetchFeeds]);

  // ── Add YouTube Link ──────────────────────────────────────────────────────
  const handleAddYouTubeLink = useCallback(async (video: Video) => {
    // Add to favorites automatically
    await handleToggleFavorite(video.id);
    // Refresh the video list to include the user-added video
    await fetchVideos();
  }, [handleToggleFavorite, fetchVideos]);

  // ── Feed item select ──────────────────────────────────────────────────────
  const handleSelectFeedItem = useCallback((item: FeedItem) => {
    setSelectedFeedItem(item);
    handleMarkRead(item.id);
  }, [handleMarkRead]);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-yt-dark">
      <Header
        mode={mode}
        setMode={setMode}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenSettings={() => setShowManageChannels(true)}
        sortMode={sortMode}
        setSortMode={setSortMode}
        feedsUnread={feedsUnread}
      />

      {/* ── YouTube Mode ─────────────────────────────────────────────────── */}
      {mode === "youtube" && (
        <div className="flex flex-col flex-1 min-h-0">
          <ChannelChips
            channels={channels}
            viewMode={videoViewMode}
            setViewMode={setVideoViewMode}
            favoritesCount={favorites.length}
          />

          <div className="flex items-center justify-between px-4 py-1">
            <span className="text-xs text-gray-400 dark:text-yt-muted">
              {videosLoading
                ? "Loading videos…"
                : videosError
                ? `Error: ${videosError}`
                : `${videos.length} videos`}
            </span>
            <button
              onClick={refreshVideos}
              className="text-xs text-gray-500 dark:text-yt-muted hover:text-yt-red px-2 py-1 rounded"
            >
              Refresh
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <VideoGrid
              videos={videos}
              viewMode={videoViewMode}
              sortMode={sortMode}
              favorites={favorites}
              watchPositions={watchPositions}
              favoriteNotes={favoriteNotes}
              onToggleFavorite={handleToggleFavorite}
              onOpenVideo={setSelectedVideo}
              onAddYouTubeLink={() => setShowAddLink(true)}
            />
          </div>
        </div>
      )}

      {/* ── Feeds Mode ───────────────────────────────────────────────────── */}
      {mode === "feeds" && (
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <FeedSidebar
            feeds={feeds}
            feedItems={feedItems}
            readIds={readIds}
            selected={feedSelection}
            onSelect={(sel) => {
              setFeedSelection(sel);
              setSelectedFeedItem(null);
            }}
          />

          <div className="w-72 flex-shrink-0 border-r border-gray-100 dark:border-yt-border flex flex-col min-h-0">
            {feedsLoading ? (
              <div className="flex items-center justify-center flex-1 text-sm text-gray-400 dark:text-yt-muted">
                Loading feeds…
              </div>
            ) : (
              <FeedList
                feeds={feeds}
                feedItems={feedItems}
                readIds={readIds}
                selected={feedSelection}
                selectedItem={selectedFeedItem}
                onSelectItem={handleSelectFeedItem}
              />
            )}
          </div>

          <div className="flex-1 min-w-0 overflow-y-auto">
            {selectedFeedItem ? (
              <FeedReader item={selectedFeedItem} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 dark:text-yt-muted text-sm">
                Select an article to read
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      {selectedVideo && (
        <VideoPlayerModal
          video={selectedVideo}
          isFavorite={favorites.includes(selectedVideo.id)}
          note={favoriteNotes[selectedVideo.id]}
          lastPositionSeconds={watchPositions[selectedVideo.id]}
          onToggleFavorite={handleToggleFavorite}
          onSaveNote={handleSaveFavoriteNote}
          onUpdateWatchPosition={handleUpdateWatchPosition}
          onClose={() => setSelectedVideo(null)}
        />
      )}

      {showAddChannel && (
        <AddChannelDialog
          onAdd={handleAddChannel}
          onClose={() => setShowAddChannel(false)}
        />
      )}

      {showManageChannels && (
        <ManageChannelsDialog
          channels={channels}
          feeds={feeds}
          onRename={handleRenameChannel}
          onDelete={handleDeleteChannel}
          onDeleteFeed={handleDeleteFeed}
          onAdd={() => setShowAddChannel(true)}
          onClose={() => setShowManageChannels(false)}
        />
      )}

      {showAddLink && (
        <AddYouTubeLinkDialog
          onAdd={handleAddYouTubeLink}
          onClose={() => setShowAddLink(false)}
        />
      )}
    </div>
  );
}
