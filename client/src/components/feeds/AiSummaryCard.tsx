import { useState, useEffect } from "react";
import { Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import type { FeedItem } from "@shared/schema";

interface AiSummaryCardProps {
  item: FeedItem;
}

type SummaryState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; bullets: string[] }
  | { status: "error"; message: string };

export default function AiSummaryCard({ item }: AiSummaryCardProps) {
  const [state, setState] = useState<SummaryState>({ status: "idle" });

  const fetchSummary = async () => {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          url: item.link,
          content: item.content,
          snippet: item.snippet,
          title: item.title,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setState({ status: "error", message: data.message || "Summary unavailable" });
      } else {
        setState({ status: "success", bullets: data.bullets ?? [] });
      }
    } catch (err: any) {
      setState({ status: "error", message: err.message || "Network error" });
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [item.id]); // Re-fetch when article changes

  return (
    <div className="rounded-xl border border-gray-100 dark:border-yt-border bg-gray-50 dark:bg-yt-dark p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} className="text-yt-red" />
        <span className="text-xs font-semibold text-gray-600 dark:text-yt-muted uppercase tracking-wide">
          AI Summary
        </span>
      </div>

      {state.status === "loading" && (
        <div className="flex items-center gap-2 text-gray-400 dark:text-yt-muted text-sm">
          <RefreshCw size={14} className="animate-spin" />
          Summarizing…
        </div>
      )}

      {state.status === "success" && (
        <ul className="space-y-1.5">
          {state.bullets.map((bullet, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700 dark:text-yt-text">
              <span className="text-yt-red flex-shrink-0 mt-0.5">•</span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      )}

      {state.status === "error" && (
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm text-gray-500 dark:text-yt-muted">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5 text-amber-500" />
            <span>{state.message}</span>
          </div>
          <button
            onClick={fetchSummary}
            className="flex items-center gap-1.5 text-xs text-yt-red hover:underline"
          >
            <RefreshCw size={12} /> Retry summary
          </button>
        </div>
      )}
    </div>
  );
}
