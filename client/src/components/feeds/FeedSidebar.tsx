import { Rss, Folder, ChevronRight } from "lucide-react";
import type { Feed, FeedItem } from "@shared/schema";

export type FeedSelection = "ALL" | string; // "ALL" or feedId

interface FeedSidebarProps {
  feeds: Feed[];
  feedItems: FeedItem[];
  readIds: string[];
  selected: FeedSelection;
  onSelect: (sel: FeedSelection) => void;
}

export default function FeedSidebar({ feeds, feedItems, readIds, selected, onSelect }: FeedSidebarProps) {
  // Group feeds by folderId
  const folders = Array.from(new Set(feeds.map((f) => f.folderId).filter(Boolean))) as string[];
  const unfoldered = feeds.filter((f) => !f.folderId);

  function unreadCount(items: FeedItem[]): number {
    return items.filter((item) => !readIds.includes(item.id)).length;
  }

  function itemsForFeed(feedId: string): FeedItem[] {
    return feedItems.filter((item) => item.feedId === feedId);
  }

  function itemsForFolder(folderId: string): FeedItem[] {
    const feedIds = feeds.filter((f) => f.folderId === folderId).map((f) => f.id);
    return feedItems.filter((item) => feedIds.includes(item.feedId));
  }

  const totalUnread = unreadCount(feedItems);

  return (
    <aside className="w-56 flex-shrink-0 border-r border-gray-100 dark:border-yt-border overflow-y-auto">
      <div className="p-3 space-y-1">
        {/* All Feeds */}
        <SidebarItem
          active={selected === "ALL"}
          onClick={() => onSelect("ALL")}
          icon={<Rss size={14} />}
          label="All Feeds"
          count={totalUnread}
        />

        {/* Folders */}
        {folders.map((folderId) => {
          const folderFeeds = feeds.filter((f) => f.folderId === folderId);
          const folderUnread = unreadCount(itemsForFolder(folderId));
          return (
            <div key={folderId}>
              <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-yt-muted mt-3">
                <Folder size={12} />
                {folderId}
                {folderUnread > 0 && (
                  <span className="ml-auto bg-yt-red text-white text-[10px] rounded-full px-1.5 py-0.5 leading-none">
                    {folderUnread}
                  </span>
                )}
              </div>
              {folderFeeds.map((feed) => {
                const feedUnread = unreadCount(itemsForFeed(feed.id));
                return (
                  <SidebarItem
                    key={feed.id}
                    active={selected === feed.id}
                    onClick={() => onSelect(feed.id)}
                    icon={<ChevronRight size={12} />}
                    label={feed.title}
                    count={feedUnread}
                    indent
                  />
                );
              })}
            </div>
          );
        })}

        {/* Unfoldered feeds */}
        {unfoldered.length > 0 && (
          <div>
            <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-yt-muted mt-3">
              Other
            </div>
            {unfoldered.map((feed) => {
              const feedUnread = unreadCount(itemsForFeed(feed.id));
              return (
                <SidebarItem
                  key={feed.id}
                  active={selected === feed.id}
                  onClick={() => onSelect(feed.id)}
                  icon={<Rss size={12} />}
                  label={feed.title}
                  count={feedUnread}
                />
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}

function SidebarItem({
  active,
  onClick,
  icon,
  label,
  count,
  indent = false,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: number;
  indent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-left transition-colors ${
        indent ? "pl-5" : ""
      } ${
        active
          ? "bg-yt-red/10 text-yt-red font-medium"
          : "text-gray-700 dark:text-yt-text hover:bg-gray-100 dark:hover:bg-yt-hover"
      }`}
    >
      <span className="flex-shrink-0 text-gray-400 dark:text-yt-muted">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {count > 0 && (
        <span className="flex-shrink-0 bg-yt-red text-white text-[10px] font-semibold rounded-full px-1.5 py-0.5 leading-none">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
