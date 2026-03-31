import { Star } from "lucide-react";
import type { Channel } from "@shared/schema";

export type ViewMode = "ALL" | "FAVORITES" | string;

interface ChannelChipsProps {
  channels: Channel[];
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  favoritesCount: number;
}

export default function ChannelChips({ channels, viewMode, setViewMode, favoritesCount }: ChannelChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2 px-4">
      <Chip active={viewMode === "ALL"} onClick={() => setViewMode("ALL")}>
        All
      </Chip>
      <Chip active={viewMode === "FAVORITES"} onClick={() => setViewMode("FAVORITES")}>
        <Star size={13} className="inline mr-1 fill-current" />
        Favorites{favoritesCount > 0 ? ` (${favoritesCount})` : ""}
      </Chip>
      {channels.map((ch) => (
        <Chip key={ch.id} active={viewMode === ch.id} onClick={() => setViewMode(ch.id)}>
          {ch.name}
        </Chip>
      ))}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
        active
          ? "bg-gray-900 text-white dark:bg-yt-text dark:text-yt-dark"
          : "bg-gray-100 text-gray-700 dark:bg-yt-card dark:text-yt-text hover:bg-gray-200 dark:hover:bg-yt-hover"
      }`}
    >
      {children}
    </button>
  );
}
