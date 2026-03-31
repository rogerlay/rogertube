import { Sun, Moon, Settings, ArrowUpDown, TrendingUp } from "lucide-react";
import type { AppMode } from "../App";
import type { SortMode } from "./youtube/VideoGrid";

interface HeaderProps {
  mode: AppMode;
  setMode: (m: AppMode) => void;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  onOpenSettings: () => void;
  sortMode: SortMode;
  setSortMode: (s: SortMode) => void;
  feedsUnread: number;
}

export default function Header({
  mode,
  setMode,
  darkMode,
  setDarkMode,
  onOpenSettings,
  sortMode,
  setSortMode,
  feedsUnread,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-2 border-b bg-white dark:bg-yt-dark border-gray-200 dark:border-yt-border shadow-sm gap-3">
      {/* Logo */}
      <div className="flex items-center gap-2 select-none flex-shrink-0">
        <svg viewBox="0 0 28 20" width="28" height="20">
          <rect width="28" height="20" rx="4" fill="#FF0000" />
          <polygon points="11,5 22,10 11,15" fill="white" />
        </svg>
        <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-yt-text">
          Roger<span className="text-yt-red">Tube</span>
        </span>
      </div>

      {/* Mode toggle */}
      <nav className="flex items-center rounded-full border border-gray-200 dark:border-yt-border overflow-hidden text-sm font-medium flex-shrink-0">
        <button
          onClick={() => setMode("youtube")}
          className={`px-4 py-1.5 transition-colors ${
            mode === "youtube"
              ? "bg-yt-red text-white"
              : "text-gray-600 dark:text-yt-muted hover:bg-gray-100 dark:hover:bg-yt-hover"
          }`}
        >
          YouTube
        </button>
        <button
          onClick={() => setMode("feeds")}
          className={`relative px-4 py-1.5 transition-colors ${
            mode === "feeds"
              ? "bg-yt-red text-white"
              : "text-gray-600 dark:text-yt-muted hover:bg-gray-100 dark:hover:bg-yt-hover"
          }`}
        >
          Feeds
          {feedsUnread > 0 && (
            <span className="absolute -top-1 -right-1 bg-yt-red text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none border border-white dark:border-yt-dark">
              {feedsUnread > 99 ? "99" : feedsUnread}
            </span>
          )}
        </button>
      </nav>

      {/* Right actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Sort buttons — only in YouTube mode */}
        {mode === "youtube" && (
          <>
            <button
              onClick={() => setSortMode("newest")}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                sortMode === "newest"
                  ? "bg-gray-900 dark:bg-yt-text text-white dark:text-yt-dark"
                  : "text-gray-500 dark:text-yt-muted hover:bg-gray-100 dark:hover:bg-yt-hover"
              }`}
              title="Sort by newest"
            >
              <ArrowUpDown size={13} /> Newest
            </button>
            <button
              onClick={() => setSortMode("views")}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                sortMode === "views"
                  ? "bg-gray-900 dark:bg-yt-text text-white dark:text-yt-dark"
                  : "text-gray-500 dark:text-yt-muted hover:bg-gray-100 dark:hover:bg-yt-hover"
              }`}
              title="Sort by views"
            >
              <TrendingUp size={13} /> Views
            </button>
          </>
        )}

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full text-gray-600 dark:text-yt-muted hover:bg-gray-100 dark:hover:bg-yt-hover"
          title="Toggle theme"
        >
          {darkMode ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-full text-gray-600 dark:text-yt-muted hover:bg-gray-100 dark:hover:bg-yt-hover"
          title="Manage channels & feeds"
        >
          <Settings size={17} />
        </button>
      </div>
    </header>
  );
}
