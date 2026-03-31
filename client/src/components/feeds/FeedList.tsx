import { useState } from "react";
import type { FeedItem, Feed } from "@shared/schema";
import type { FeedSelection } from "./FeedSidebar";

interface FeedListProps {
  feeds: Feed[];
  feedItems: FeedItem[];
  readIds: string[];
  selected: FeedSelection;
  selectedItem: FeedItem | null;
  onSelectItem: (item: FeedItem) => void;
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function FeedList({
  feeds,
  feedItems,
  readIds,
  selected,
  selectedItem,
  onSelectItem,
}: FeedListProps) {
  const [showAll, setShowAll] = useState(false);

  // Filter items by selection
  const scopedItems = feedItems.filter((item) => {
    if (selected === "ALL") return true;
    return item.feedId === selected;
  });

  const unreadItems = scopedItems.filter((item) => !readIds.includes(item.id));
  const displayItems = showAll ? scopedItems : unreadItems;

  const title =
    selected === "ALL"
      ? "All Feeds"
      : feeds.find((f) => f.id === selected)?.title ?? "Feed";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-yt-border flex-shrink-0">
        <h2 className="font-semibold text-sm text-gray-900 dark:text-yt-text truncate">{title}</h2>
        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() => setShowAll(false)}
            className={`px-2 py-1 rounded ${!showAll ? "bg-yt-red text-white" : "text-gray-500 dark:text-yt-muted hover:bg-gray-100 dark:hover:bg-yt-hover"}`}
          >
            Unread
          </button>
          <button
            onClick={() => setShowAll(true)}
            className={`px-2 py-1 rounded ${showAll ? "bg-yt-red text-white" : "text-gray-500 dark:text-yt-muted hover:bg-gray-100 dark:hover:bg-yt-hover"}`}
          >
            All
          </button>
        </div>
      </div>

      {/* Article list */}
      <div className="flex-1 overflow-y-auto">
        {displayItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            {!showAll && unreadItems.length === 0 && scopedItems.length > 0 ? (
              <>
                <p className="text-sm font-medium text-gray-600 dark:text-yt-muted">All caught up — no unread articles</p>
                <button
                  onClick={() => setShowAll(true)}
                  className="mt-2 text-xs text-yt-red hover:underline"
                >
                  Show all articles
                </button>
              </>
            ) : (
              <p className="text-sm text-gray-400 dark:text-yt-muted">No articles yet</p>
            )}
          </div>
        ) : (
          displayItems.map((item) => {
            const isRead = readIds.includes(item.id);
            const feedTitle = feeds.find((f) => f.id === item.feedId)?.title ?? "";
            const isSelected = selectedItem?.id === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectItem(item)}
                className={`w-full text-left px-4 py-3 border-b border-gray-50 dark:border-yt-border/50 transition-colors ${
                  isSelected
                    ? "bg-yt-red/5 border-l-2 border-l-yt-red"
                    : "hover:bg-gray-50 dark:hover:bg-yt-hover"
                }`}
              >
                <p className={`text-sm leading-snug line-clamp-2 ${isRead ? "text-gray-400 dark:text-yt-muted" : "font-medium text-gray-900 dark:text-yt-text"}`}>
                  {!isRead && <span className="inline-block w-1.5 h-1.5 rounded-full bg-yt-red mr-1.5 mb-0.5" />}
                  {item.title}
                </p>
                <p className="text-xs text-gray-400 dark:text-yt-muted mt-0.5">
                  {feedTitle} · {formatRelative(item.publishedAt)}
                </p>
                {item.snippet && (
                  <p className="text-xs text-gray-400 dark:text-yt-muted mt-0.5 line-clamp-1">{item.snippet}</p>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
