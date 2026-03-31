import { Star, FileText, X } from "lucide-react";
import type { Video } from "@shared/schema";

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function formatViewCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return `${n}`;
}

export interface VideoCardProps {
  video: Video;
  isFavorite: boolean;
  note?: string;
  lastPositionSeconds?: number;
  durationSeconds?: number | null;
  showRemove?: boolean;
  showNote?: boolean;
  onToggleFavorite: (id: string) => void;
  onRemove?: (id: string) => void;
  onClick: () => void;
}

export default function VideoCard({
  video,
  isFavorite,
  note,
  lastPositionSeconds,
  durationSeconds,
  showRemove,
  showNote,
  onToggleFavorite,
  onRemove,
  onClick,
}: VideoCardProps) {
  const progressPct =
    lastPositionSeconds && durationSeconds && durationSeconds > 0
      ? Math.min(100, (lastPositionSeconds / durationSeconds) * 100)
      : 0;

  const hasNote = isFavorite && note && note.trim().length > 0;

  return (
    <div
      className="group cursor-pointer rounded-xl overflow-hidden bg-transparent hover:bg-gray-100 dark:hover:bg-yt-card transition-colors"
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-200 dark:bg-yt-card rounded-xl overflow-hidden">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`;
          }}
        />

        {/* Progress bar */}
        {progressPct > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
            <div
              className="h-full bg-yt-red transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}

        {/* Note indicator */}
        {hasNote && (
          <div className="absolute top-2 left-2 bg-black/60 rounded-full p-1">
            <FileText size={11} className="text-yellow-300" />
          </div>
        )}

        {/* Remove from favorites (X) — shown in favorites view */}
        {showRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.(video.id);
            }}
            className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 rounded-full p-1 transition-colors"
            title="Remove from favorites"
          >
            <X size={12} className="text-white" />
          </button>
        )}
      </div>

      {/* Info row */}
      <div className="flex gap-2 p-2 pt-2">
        {/* Channel icon */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yt-red flex items-center justify-center text-white text-xs font-bold uppercase">
          {video.channelName.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-yt-text line-clamp-2 leading-snug">
            {video.title}
          </p>
          <p className="text-xs text-gray-500 dark:text-yt-muted mt-0.5">{video.channelName}</p>
          <p className="text-xs text-gray-500 dark:text-yt-muted">
            {video.viewCount !== undefined && (
              <span>{formatViewCount(video.viewCount)} views · </span>
            )}
            {formatRelativeTime(video.publishedAt)}
          </p>
        </div>

        {/* Favorite star — shown on hover when not in remove-mode */}
        {!showRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(video.id);
            }}
            className="flex-shrink-0 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-yt-hover transition-opacity"
            title={isFavorite ? "Remove favorite" : "Add favorite"}
          >
            <Star
              size={16}
              className={isFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-400 dark:text-yt-muted"}
            />
          </button>
        )}
      </div>

      {/* Note shown in favorites grid */}
      {showNote && note && note.trim() && (
        <div className="mx-2 mb-2 px-2 py-1.5 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/40">
          <p className="text-xs text-yellow-800 dark:text-yellow-300 line-clamp-2 leading-snug">{note.trim()}</p>
        </div>
      )}
    </div>
  );
}
