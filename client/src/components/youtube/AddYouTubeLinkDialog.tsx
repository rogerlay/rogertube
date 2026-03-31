import { useState } from "react";
import { X, Link } from "lucide-react";
import type { Video } from "@shared/schema";

interface AddYouTubeLinkDialogProps {
  onAdd: (video: Video) => void;
  onClose: () => void;
}

export default function AddYouTubeLinkDialog({ onAdd, onClose }: AddYouTubeLinkDialogProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/videos/add-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add video");
      }
      const { video } = await res.json();
      onAdd(video);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to add video");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-yt-card rounded-xl shadow-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Link size={18} className="text-yt-red" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-yt-text">Add YouTube Link</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-yt-hover text-gray-500 dark:text-yt-muted"
          >
            <X size={18} />
          </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-yt-muted mb-4">
          Paste any YouTube video URL to add it to your favorites.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-yt-muted mb-1.5">
              YouTube URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
              className="w-full rounded-lg border-2 border-yt-red bg-white dark:bg-yt-dark text-gray-900 dark:text-yt-text text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yt-red/50 placeholder-gray-400 dark:placeholder-yt-muted"
              autoFocus
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg text-gray-600 dark:text-yt-muted hover:bg-gray-100 dark:hover:bg-yt-hover"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="px-5 py-2 text-sm rounded-lg bg-yt-red text-white font-medium disabled:opacity-50 hover:bg-red-600"
            >
              {loading ? "Adding…" : "Add to Favorites"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
