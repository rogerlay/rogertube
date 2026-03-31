import { useEffect, useRef, useCallback, useState } from "react";
import { X, Star, ExternalLink } from "lucide-react";
import type { Video } from "@shared/schema";

export interface VideoPlayerModalProps {
  video: Video;
  isFavorite: boolean;
  note?: string;
  lastPositionSeconds?: number;
  onToggleFavorite: (id: string) => void;
  onSaveNote: (videoId: string, note: string) => void;
  onUpdateWatchPosition: (videoId: string, seconds: number) => void;
  onClose: () => void;
}

export default function VideoPlayerModal({
  video,
  isFavorite,
  note = "",
  lastPositionSeconds = 0,
  onToggleFavorite,
  onSaveNote,
  onUpdateWatchPosition,
  onClose,
}: VideoPlayerModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const positionRef = useRef<number>(lastPositionSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [localNote, setLocalNote] = useState(note);
  const [playerReady, setPlayerReady] = useState(false);

  // Build embed URL with start time and enablejsapi
  const startSecs = Math.floor(lastPositionSeconds);
  const embedUrl = `https://www.youtube.com/embed/${video.id}?enablejsapi=1&start=${startSecs}&rel=0&modestbranding=1`;

  // Listen for YouTube IFrame API postMessages
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      if (!event.origin.includes("youtube.com")) return;
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        // info events carry currentTime
        if (data?.info?.currentTime !== undefined) {
          positionRef.current = data.info.currentTime;
        }
        // Player ready
        if (data?.event === "onReady") {
          setPlayerReady(true);
        }
        // On pause, save immediately
        if (data?.info?.playerState === 2) {
          onUpdateWatchPosition(video.id, positionRef.current);
        }
      } catch (_) {}
    },
    [video.id, onUpdateWatchPosition]
  );

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);

  // Poll position every 5s by querying the iframe
  useEffect(() => {
    if (!playerReady) return;
    intervalRef.current = setInterval(() => {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: "listening" }),
        "https://www.youtube.com"
      );
      onUpdateWatchPosition(video.id, positionRef.current);
    }, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playerReady, video.id, onUpdateWatchPosition]);

  // Save position on close
  const handleClose = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    onUpdateWatchPosition(video.id, positionRef.current);
    onClose();
  }, [video.id, onUpdateWatchPosition, onClose]);

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleClose();
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={handleBackdrop}
    >
      <div className="relative w-full max-w-4xl bg-white dark:bg-yt-card rounded-xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-4 pb-2">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-yt-text line-clamp-2 flex-1">
            {video.title}
          </h2>
          <div className="flex items-center gap-1 flex-shrink-0">
            <a
              href={`https://www.youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-full text-gray-500 dark:text-yt-muted hover:bg-gray-100 dark:hover:bg-yt-hover"
              title="Open on YouTube"
            >
              <ExternalLink size={16} />
            </a>
            <button
              onClick={() => onToggleFavorite(video.id)}
              className="p-1.5 rounded-full text-gray-500 dark:text-yt-muted hover:bg-gray-100 dark:hover:bg-yt-hover"
              title={isFavorite ? "Remove favorite" : "Add favorite"}
            >
              <Star
                size={16}
                className={isFavorite ? "fill-yellow-400 text-yellow-400" : ""}
              />
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-full text-gray-500 dark:text-yt-muted hover:bg-gray-100 dark:hover:bg-yt-hover"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Video embed */}
        <div className="aspect-video w-full bg-black">
          <iframe
            ref={iframeRef}
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={video.title}
          />
        </div>

        {/* Note area */}
        <div className="p-4">
          <label className="block text-xs font-medium text-gray-500 dark:text-yt-muted mb-1">
            Favorite note (remarks / reference)
          </label>
          <textarea
            value={localNote}
            onChange={(e) => setLocalNote(e.target.value)}
            onBlur={() => onSaveNote(video.id, localNote)}
            disabled={!isFavorite}
            rows={3}
            placeholder={isFavorite ? "Add a note…" : "Star this video to add a note"}
            className="w-full rounded-lg border border-gray-200 dark:border-yt-border bg-white dark:bg-yt-dark text-gray-900 dark:text-yt-text text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-yt-red disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
}
