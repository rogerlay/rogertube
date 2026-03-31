import { useState } from "react";
import { X, GripVertical, Trash2, Plus, Pencil, Check, Rss } from "lucide-react";
import type { Channel, Feed } from "@shared/schema";

type Tab = "youtube" | "rss" | "digest";

interface ManageChannelsDialogProps {
  channels: Channel[];
  feeds: Feed[];
  onRename: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onDeleteFeed: (id: string) => Promise<void>;
  onAdd: () => void;
  onClose: () => void;
}

export default function ManageChannelsDialog({
  channels,
  feeds,
  onRename,
  onDelete,
  onDeleteFeed,
  onAdd,
  onClose,
}: ManageChannelsDialogProps) {
  const [tab, setTab] = useState<Tab>("youtube");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const startEdit = (ch: Channel) => {
    setEditingId(ch.id);
    setEditName(ch.name);
  };

  const commitEdit = async (id: string) => {
    if (editName.trim()) await onRename(id, editName.trim());
    setEditingId(null);
  };

  const AVATAR_COLORS = [
    "bg-red-500", "bg-blue-500", "bg-green-500", "bg-purple-500",
    "bg-orange-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500",
  ];
  const avatarColor = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-1">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-yt-text">Manage Feeds & Channels</h2>
            <p className="text-xs text-gray-400 dark:text-yt-muted mt-0.5">Add, edit, remove, or drag to reorder.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-yt-hover text-gray-400 dark:text-yt-muted mt-0.5"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5 pt-3 pb-0">
          {(["youtube", "rss", "digest"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tab === t
                  ? "bg-gray-900 dark:bg-white text-white dark:text-yt-dark"
                  : "text-gray-500 dark:text-yt-muted hover:bg-gray-100 dark:hover:bg-yt-hover"
              }`}
            >
              {t === "youtube" && <span>📺</span>}
              {t === "rss" && <span>📰</span>}
              {t === "digest" && <span>📓</span>}
              {t === "youtube" ? "YouTube" : t === "rss" ? "RSS Feeds" : "Digest"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-3 py-3 min-h-0 mt-2">
          {/* YouTube tab */}
          {tab === "youtube" && (
            <>
              <button
                onClick={() => { onClose(); onAdd(); }}
                className="flex items-center gap-2 w-full px-3 py-2.5 mb-2 rounded-xl border border-dashed border-gray-200 dark:border-yt-border text-sm text-gray-500 dark:text-yt-muted hover:border-yt-red hover:text-yt-red transition-colors"
              >
                <Plus size={16} /> Add YouTube Channel
              </button>

              {channels.map((ch) => (
                <div
                  key={ch.id}
                  className="flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-yt-hover group"
                >
                  {/* Drag handle */}
                  <GripVertical size={14} className="text-gray-300 dark:text-yt-border flex-shrink-0 cursor-grab" />

                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full ${avatarColor(ch.name)} flex items-center justify-center text-white text-xs font-bold uppercase flex-shrink-0`}>
                    {ch.name.charAt(0)}
                  </div>

                  {/* Name + ID */}
                  <div className="flex-1 min-w-0">
                    {editingId === ch.id ? (
                      <input
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitEdit(ch.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        className="w-full text-sm bg-transparent border-b border-yt-red text-gray-900 dark:text-yt-text focus:outline-none"
                      />
                    ) : (
                      <p className="text-sm font-medium text-gray-900 dark:text-yt-text truncate">{ch.name}</p>
                    )}
                    <p className="text-xs text-gray-400 dark:text-yt-muted font-mono truncate">{ch.id}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 flex-shrink-0">
                    {editingId === ch.id ? (
                      <button onClick={() => commitEdit(ch.id)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-yt-border text-green-500">
                        <Check size={13} />
                      </button>
                    ) : (
                      <button onClick={() => startEdit(ch)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-yt-border text-gray-400 dark:text-yt-muted">
                        <Pencil size={13} />
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(ch.id)}
                      className="p-1 rounded hover:bg-red-50 dark:hover:bg-yt-border text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
              {channels.length === 0 && (
                <p className="text-sm text-center text-gray-400 dark:text-yt-muted py-6">No channels yet</p>
              )}
            </>
          )}

          {/* RSS Feeds tab */}
          {tab === "rss" && (
            <>
              {feeds.map((feed) => (
                <div
                  key={feed.id}
                  className="flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-yt-hover group"
                >
                  <GripVertical size={14} className="text-gray-300 dark:text-yt-border flex-shrink-0" />
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white flex-shrink-0">
                    <Rss size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-yt-text truncate">{feed.title}</p>
                    <p className="text-xs text-gray-400 dark:text-yt-muted truncate font-mono">{feed.url}</p>
                  </div>
                  <button
                    onClick={() => onDeleteFeed(feed.id)}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-yt-border text-red-400 hover:text-red-600 flex-shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              {feeds.length === 0 && (
                <p className="text-sm text-center text-gray-400 dark:text-yt-muted py-6">No RSS feeds configured</p>
              )}
            </>
          )}

          {/* Digest tab */}
          {tab === "digest" && (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-yt-muted gap-2">
              <span className="text-3xl">📓</span>
              <p className="text-sm">Digest view coming soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
