import { Router, Request, Response } from "express";
import xml2js from "xml2js";
import type { Channel, Video, Feed, FeedItem } from "../shared/schema";
import {
  getChannels,
  getChannel,
  addChannel,
  removeChannel,
  updateChannelName,
  setChannelVideos,
  getChannelVideos,
  isVideoCacheValid,
  invalidateVideoCache,
  getFeeds,
  getFeed,
  addFeed,
  removeFeed,
  setFeedItems,
  getFeedItems,
  getPreferences,
  updatePreferences,
  markRead,
  addUserVideo,
  getUserVideo,
  getUserAddedVideos,
  getAllVideos,
} from "./storage";

const router = Router();
const summaryCache = new Map<string, { bullets: string[]; cachedAt: number }>();
const SUMMARY_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// ── Utility ───────────────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function determineFeedItemId(link: string | undefined, guid: string | undefined, title: string): string {
  if (link) return Buffer.from(link).toString("base64");
  if (guid) return Buffer.from(guid).toString("base64");
  return Buffer.from(title).toString("base64");
}

async function fetchRss(url: string): Promise<any> {
  const res = await fetch(url, {
    headers: { "User-Agent": "RogerTube/1.0 RSS Reader" },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  const parsed = await xml2js.parseStringPromise(text, { explicitArray: false });
  return parsed;
}

// ── Channels ──────────────────────────────────────────────────────────────────

router.get("/channels", (_req: Request, res: Response) => {
  res.json(getChannels());
});

router.post("/channels", async (req: Request, res: Response) => {
  const { urlOrId, name } = req.body as { urlOrId: string; name?: string };
  if (!urlOrId) return res.status(400).json({ error: "urlOrId required" });

  let channelId = urlOrId.trim();

  // Extract from URL forms: https://youtube.com/channel/UCXXX or @handle
  const channelUrlMatch = channelId.match(/youtube\.com\/channel\/([^/?&]+)/);
  if (channelUrlMatch) channelId = channelUrlMatch[1];

  // @handle — try to resolve via YouTube RSS (just try the ID as-is if it's already an ID)
  const handleMatch = channelId.match(/@([\w.-]+)/);
  if (handleMatch) {
    // Can't resolve @handles without YouTube Data API; store with handle as ID and note
    channelId = handleMatch[1]; // best effort
  }

  // Remove any trailing slashes or query params
  channelId = channelId.replace(/[/?].*$/, "").trim();

  if (!channelId) return res.status(400).json({ error: "Could not parse channel ID" });

  const existing = getChannel(channelId);
  if (existing) return res.status(409).json({ error: "Channel already exists" });

  const now = new Date().toISOString();
  const channel: Channel = {
    id: channelId,
    name: name || channelId,
    createdAt: now,
    updatedAt: now,
  };
  addChannel(channel);
  res.status(201).json(channel);
});

router.put("/channels/:id", (req: Request, res: Response) => {
  const { name } = req.body as { name: string };
  if (!name) return res.status(400).json({ error: "name required" });
  const updated = updateChannelName(req.params.id, name);
  if (!updated) return res.status(404).json({ error: "Channel not found" });
  res.json(updated);
});

router.delete("/channels/:id", (req: Request, res: Response) => {
  const ch = getChannel(req.params.id);
  if (!ch) return res.status(404).json({ error: "Channel not found" });
  removeChannel(req.params.id);
  res.status(204).send();
});

// ── Videos ────────────────────────────────────────────────────────────────────

async function fetchChannelVideos(channel: Channel): Promise<Video[]> {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.id}`;
  try {
    const parsed = await fetchRss(url);
    const feed = parsed.feed;
    if (!feed || !feed.entry) {
      console.warn(`[videos] No entries for channel ${channel.id} (${channel.name})`);
      return [];
    }
    const entries = Array.isArray(feed.entry) ? feed.entry : [feed.entry];
    return entries.map((entry: any): Video => {
      const videoId = entry["yt:videoId"] || entry.id?.replace?.("yt:video:", "") || "";
      const mediaGroup = entry["media:group"];
      const durationRaw = mediaGroup?.["media:content"]?.$?.duration;
      // Views live under media:community > media:statistics (not directly in media:group)
      const viewCountRaw =
        mediaGroup?.["media:community"]?.["media:statistics"]?.$?.views ??
        mediaGroup?.["media:statistics"]?.$?.views;
      return {
        id: videoId,
        channelId: channel.id,
        channelName: channel.name,
        title: entry.title || "Untitled",
        thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        publishedAt: entry.published || new Date().toISOString(),
        durationSeconds: durationRaw ? parseInt(durationRaw, 10) : null,
        viewCount: viewCountRaw ? parseInt(viewCountRaw, 10) : undefined,
      };
    });
  } catch (err) {
    console.error(`[videos] Failed to fetch channel ${channel.id} (${channel.name}):`, err);
    return [];
  }
}

router.get("/videos", async (req: Request, res: Response) => {
  const channelId = req.query.channelId as string | undefined;
  const channels = getChannels();

  const targetChannels = channelId
    ? channels.filter((c) => c.id === channelId)
    : channels;

  // Fetch stale channels in parallel
  const fetchPromises = targetChannels.map(async (ch) => {
    if (!isVideoCacheValid(ch.id)) {
      const videos = await fetchChannelVideos(ch);
      setChannelVideos(ch.id, videos);
    }
  });
  await Promise.all(fetchPromises);

  const videos = channelId
    ? getChannelVideos(channelId)
    : [...targetChannels.flatMap((ch) => getChannelVideos(ch.id)), ...getUserAddedVideos()];

  const sorted = videos.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  res.json(sorted);
});

// Add a video by YouTube URL (direct to favorites)
function parseYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

router.post("/videos/add-link", async (req: Request, res: Response) => {
  const { url } = req.body as { url: string };
  if (!url) return res.status(400).json({ error: "url required" });

  const videoId = parseYouTubeVideoId(url.trim());
  if (!videoId) return res.status(400).json({ error: "Could not parse YouTube video ID from URL" });

  // Check if we already have this video
  const allExisting = getAllVideos();
  const existing = allExisting.find((v) => v.id === videoId);
  if (existing) return res.json({ video: existing, alreadyExists: true });

  // Fetch oEmbed data
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const oRes = await fetch(oembedUrl, { signal: AbortSignal.timeout(8000) });
    if (!oRes.ok) throw new Error(`oEmbed HTTP ${oRes.status}`);
    const oembed = await oRes.json() as any;

    const video: Video = {
      id: videoId,
      channelId: "user-added",
      channelName: oembed.author_name || "Unknown Channel",
      title: oembed.title || "Untitled",
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      publishedAt: new Date().toISOString(),
      durationSeconds: null,
      userAdded: true,
    };
    addUserVideo(video);
    return res.json({ video, alreadyExists: false });
  } catch (err: any) {
    console.error("[add-link] oEmbed failed:", err);
    // Fallback: create minimal video without oEmbed
    const video: Video = {
      id: videoId,
      channelId: "user-added",
      channelName: "Unknown Channel",
      title: `YouTube Video (${videoId})`,
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      publishedAt: new Date().toISOString(),
      durationSeconds: null,
      userAdded: true,
    };
    addUserVideo(video);
    return res.json({ video, alreadyExists: false });
  }
});

router.post("/videos/refresh", async (_req: Request, res: Response) => {
  invalidateVideoCache();
  const channels = getChannels();
  await Promise.all(
    channels.map(async (ch) => {
      const videos = await fetchChannelVideos(ch);
      setChannelVideos(ch.id, videos);
    })
  );
  res.json({ ok: true, refreshed: channels.length });
});

// ── Preferences ───────────────────────────────────────────────────────────────

router.get("/preferences", (_req: Request, res: Response) => {
  res.json(getPreferences());
});

router.post("/preferences", (req: Request, res: Response) => {
  const updated = updatePreferences(req.body);
  res.json(updated);
});

// ── Feeds ─────────────────────────────────────────────────────────────────────

router.get("/feeds", (_req: Request, res: Response) => {
  res.json(getFeeds());
});

router.post("/feeds", (req: Request, res: Response) => {
  const { id, title, url, folderId } = req.body as Partial<Feed>;
  if (!title || !url) return res.status(400).json({ error: "title and url required" });
  const feed: Feed = {
    id: id || Buffer.from(url).toString("base64").slice(0, 16),
    title,
    url,
    folderId,
  };
  addFeed(feed);
  res.status(201).json(feed);
});

router.delete("/feeds/:id", (req: Request, res: Response) => {
  const feed = getFeed(req.params.id);
  if (!feed) return res.status(404).json({ error: "Feed not found" });
  removeFeed(req.params.id);
  res.status(204).send();
});

// ── Feed Items ────────────────────────────────────────────────────────────────

function isYouTubeUrl(url: string): boolean {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

async function fetchAndParseFeed(feed: Feed): Promise<FeedItem[]> {
  try {
    const parsed = await fetchRss(feed.url);
    const items: FeedItem[] = [];

    // Handle both RSS 2.0 and Atom
    const channel = parsed.rss?.channel;
    const atomFeed = parsed.feed;

    if (channel) {
      // RSS 2.0
      const rawItems = channel.item ? (Array.isArray(channel.item) ? channel.item : [channel.item]) : [];
      for (const item of rawItems) {
        const link = typeof item.link === "string" ? item.link : item.link?._ || item.guid?._ || item.guid || "";
        if (isYouTubeUrl(link)) continue;

        const content = item["content:encoded"] || item.description || "";
        const snippet = stripHtml(content).slice(0, 300);
        const enclosure = item.enclosure?.$;
        const imageUrl =
          enclosure?.type?.startsWith("image") ? enclosure.url :
          item["media:content"]?.$?.url ||
          item["media:thumbnail"]?.$?.url ||
          undefined;

        items.push({
          id: determineFeedItemId(link || undefined, item.guid?._ || item.guid || undefined, item.title || ""),
          feedId: feed.id,
          title: item.title || "Untitled",
          link,
          publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          content,
          snippet,
          author: item.author || item["dc:creator"] || undefined,
          imageUrl,
        });
      }
    } else if (atomFeed) {
      // Atom
      const entries = atomFeed.entry ? (Array.isArray(atomFeed.entry) ? atomFeed.entry : [atomFeed.entry]) : [];
      for (const entry of entries) {
        const link =
          typeof entry.link === "string"
            ? entry.link
            : Array.isArray(entry.link)
            ? (entry.link.find((l: any) => l.$.rel === "alternate" || !l.$.rel)?.$.href || entry.link[0]?.$.href || "")
            : entry.link?.$?.href || "";

        if (isYouTubeUrl(link)) continue;

        const content = entry.content?._ || entry.content || entry.summary?._ || entry.summary || "";
        const snippet = stripHtml(content).slice(0, 300);

        items.push({
          id: determineFeedItemId(link || undefined, entry.id || undefined, entry.title?._ || entry.title || ""),
          feedId: feed.id,
          title: entry.title?._ || entry.title || "Untitled",
          link,
          publishedAt: entry.published || entry.updated || new Date().toISOString(),
          content,
          snippet,
          author: entry.author?.name || undefined,
          imageUrl: undefined,
        });
      }
    }

    return items;
  } catch (err) {
    console.error(`[feeds] Failed to fetch feed ${feed.id} (${feed.url}):`, err);
    return [];
  }
}

router.get("/feed-items", async (_req: Request, res: Response) => {
  const feeds = getFeeds();
  await Promise.all(
    feeds.map(async (feed) => {
      const items = await fetchAndParseFeed(feed);
      setFeedItems(feed.id, items);
    })
  );

  const allItems = getFeedItems();
  const sorted = allItems.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  res.json(sorted);
});

// ── Read State ────────────────────────────────────────────────────────────────

router.get("/read-state", (_req: Request, res: Response) => {
  const prefs = getPreferences();
  res.json({ readIds: prefs.readIds });
});

router.post("/read-state/mark", (req: Request, res: Response) => {
  const { itemId } = req.body as { itemId: string };
  if (!itemId) return res.status(400).json({ error: "itemId required" });
  markRead(itemId);
  res.json({ ok: true });
});

// ── AI Summary ────────────────────────────────────────────────────────────────

router.post("/summary", async (req: Request, res: Response) => {
  const { id, url, content, snippet, description, title } = req.body as {
    id?: string;
    url?: string;
    content?: string;
    snippet?: string;
    description?: string;
    title?: string;
  };

  const cacheKey = id || url || title || "";
  const apiKey = process.env.PERPLEXITY_API_KEY;
  console.log(`[summary] id=${id} url=${url} apiKey=${apiKey ? "present" : "MISSING"}`);

  // Check cache
  if (cacheKey) {
    const cached = summaryCache.get(cacheKey);
    if (cached && Date.now() - cached.cachedAt < SUMMARY_CACHE_TTL_MS) {
      return res.json({ bullets: cached.bullets });
    }
  }

  const rawText = content || snippet || description || title || "";
  const cleanText = stripHtml(rawText);
  console.log(`[summary] raw length=${rawText.length} clean length=${cleanText.length}`);

  if (cleanText.length < 80) {
    return res.json({ error: true, message: "Summary unavailable: not enough content" });
  }

  if (!apiKey) {
    return res.json({ error: true, message: "Summary unavailable: PERPLEXITY_API_KEY not set" });
  }

  try {
    const perplexityRes = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          {
            role: "user",
            content: `Summarize this article in 3-5 concise bullet points:\n\n${cleanText.slice(0, 4000)}`,
          },
        ],
        max_tokens: 400,
        temperature: 0.2,
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!perplexityRes.ok) {
      const errText = await perplexityRes.text();
      console.error(`[summary] Perplexity error ${perplexityRes.status}: ${errText}`);
      return res.json({ error: true, message: `Summary failed: HTTP ${perplexityRes.status}` });
    }

    const data = await perplexityRes.json() as any;
    const text: string = data.choices?.[0]?.message?.content || "";

    // Parse bullet points
    const bullets = text
      .split("\n")
      .map((l: string) => l.replace(/^[\s•\-*\d.]+/, "").trim())
      .filter((l: string) => l.length > 10);

    if (cacheKey) {
      summaryCache.set(cacheKey, { bullets, cachedAt: Date.now() });
    }

    res.json({ bullets });
  } catch (err: any) {
    console.error("[summary] Error:", err);
    res.json({ error: true, message: `Summary failed: ${err.message || "Unknown error"}` });
  }
});

export default router;
