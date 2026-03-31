import { ExternalLink } from "lucide-react";
import type { FeedItem } from "@shared/schema";
import AiSummaryCard from "./AiSummaryCard";

interface FeedReaderProps {
  item: FeedItem;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-MY", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function FeedReader({ item }: FeedReaderProps) {
  return (
    <div className="flex flex-col gap-4 p-5 overflow-y-auto h-full">
      {/* Title */}
      <div>
        <h1 className="text-lg font-bold text-gray-900 dark:text-yt-text leading-snug">{item.title}</h1>
        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400 dark:text-yt-muted">
          {item.author && <span>{item.author}</span>}
          <span>{formatDate(item.publishedAt)}</span>
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-yt-red hover:underline"
          >
            <ExternalLink size={11} /> Open original
          </a>
        </div>
      </div>

      {/* AI Summary */}
      <AiSummaryCard item={item} />

      {/* Content */}
      {item.content ? (
        <div
          className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-yt-text prose-a:text-yt-red prose-img:rounded-lg prose-img:max-h-80 prose-img:object-cover"
          dangerouslySetInnerHTML={{ __html: item.content }}
        />
      ) : item.snippet ? (
        <p className="text-sm text-gray-700 dark:text-yt-text leading-relaxed">{item.snippet}</p>
      ) : (
        <p className="text-sm text-gray-400 dark:text-yt-muted">No content available. Open the original article.</p>
      )}
    </div>
  );
}
