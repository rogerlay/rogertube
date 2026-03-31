import { Link } from "lucide-react";
import type { Video } from "@shared/schema";
import VideoCard from "./VideoCard";
import type { ViewMode } from "./ChannelChips";

export type SortMode = "newest" | "views";

interface VideoGridProps {
  videos: Video[];
  viewMode: ViewMode;
  sortMode: SortMode;
  favorites: string[];
  watchPositions: Record<string, number>;
  favoriteNotes: Record<string, string>;
  onToggleFavorite: (id: string) => void;
  onOpenVideo: (video: Video) => void;
  onAddYouTubeLink?: () => void;
}

export default function VideoGrid({
  videos,
  viewMode,
  sortMode,
  favorites,
  watchPositions,
  favoriteNotes,
  onToggleFavorite,
  onOpenVideo,
  onAddYouTubeLink,
}: VideoGridProps) {
  const filtered = videos.filter((v) => {
    if (viewMode === "ALL") return true;
    if (viewMode === "FAVORITES") return favorites.includes(v.id);
    return v.channelId === viewMode;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortMode === "views") {
      // Videos with view counts first (desc), then videos without by date
      const aHas = a.viewCount !== undefined;
      const bHas = b.viewCount !== undefined;
      if (aHas && bHas) return (b.viewCount ?? 0) - (a.viewCount ?? 0);
      if (aHas) return -1;
      if (bHas) return 1;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    }
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  const isFavoritesView = viewMode === "FAVORITES";

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400 dark:text-yt-muted">
        <p className="text-lg font-medium">No videos found</p>
        {isFavoritesView && (
          <>
            <p className="text-sm mt-1">Star a video to add it to favorites</p>
            {onAddYouTubeLink && (
              <button
                onClick={onAddYouTubeLink}
                className="mt-3 flex items-center gap-2 px-4 py-2 rounded-full bg-yt-red text-white text-sm font-medium hover:bg-red-600"
              >
                <Link size={14} /> Add YouTube Link
              </button>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="px-4 pb-4">
      {/* Add YouTube Link button in favorites view */}
      {isFavoritesView && onAddYouTubeLink && (
        <div className="pt-2 pb-1">
          <button
            onClick={onAddYouTubeLink}
            className="flex items-center gap-1.5 text-sm text-yt-red hover:underline font-medium"
          >
            <span className="text-base leading-none">🔴</span> Add YouTube Link
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pt-2">
        {sorted.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            isFavorite={favorites.includes(video.id)}
            note={favoriteNotes[video.id]}
            lastPositionSeconds={watchPositions[video.id]}
            durationSeconds={video.durationSeconds}
            showRemove={isFavoritesView}
            showNote={isFavoritesView}
            onToggleFavorite={onToggleFavorite}
            onRemove={onToggleFavorite}
            onClick={() => onOpenVideo(video)}
          />
        ))}
      </div>
    </div>
  );
}
