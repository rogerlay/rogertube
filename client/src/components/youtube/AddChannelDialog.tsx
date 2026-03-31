import { useState } from "react";
import { X } from "lucide-react";

interface AddChannelDialogProps {
  onAdd: (urlOrId: string, name?: string) => Promise<void>;
  onClose: () => void;
}

export default function AddChannelDialog({ onAdd, onClose }: AddChannelDialogProps) {
  const [urlOrId, setUrlOrId] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlOrId.trim()) return;
    setLoading(true);
    setError("");
    try {
      await onAdd(urlOrId.trim(), name.trim() || undefined);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to add channel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-yt-card rounded-xl shadow-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-yt-text">Add Channel</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-yt-hover text-gray-500 dark:text-yt-muted">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-yt-muted mb-1">
              Channel ID or URL
            </label>
            <input
              type="text"
              value={urlOrId}
              onChange={(e) => setUrlOrId(e.target.value)}
              placeholder="UCxxxxxx or https://youtube.com/channel/..."
              className="w-full rounded-lg border border-gray-200 dark:border-yt-border bg-white dark:bg-yt-dark text-gray-900 dark:text-yt-text text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yt-red"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-yt-muted mb-1">
              Display name (optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Channel name"
              className="w-full rounded-lg border border-gray-200 dark:border-yt-border bg-white dark:bg-yt-dark text-gray-900 dark:text-yt-text text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yt-red"
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg text-gray-600 dark:text-yt-muted hover:bg-gray-100 dark:hover:bg-yt-hover">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !urlOrId.trim()}
              className="px-4 py-2 text-sm rounded-lg bg-yt-red text-white font-medium disabled:opacity-50 hover:bg-red-600"
            >
              {loading ? "Adding…" : "Add Channel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
