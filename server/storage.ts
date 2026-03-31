import type { Channel, Video, Feed, FeedItem, Preferences } from "../shared/schema";

// ── In-memory stores ─────────────────────────────────────────────────────────

let channels: Channel[] = [];
let videosByChannel: Record<string, Video[]> = {};
let userAddedVideos: Video[] = [];
let feeds: Feed[] = [];
let feedItemsByFeed: Record<string, FeedItem[]> = {};
let preferences: Preferences = {
  favorites: [],
  watchPositions: {},
  favoriteNotes: {},
  readIds: [],
};

// videoId -> { cachedAt: timestamp }
const videoCache: Record<string, number> = {};
const VIDEO_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

// ── Channel helpers ───────────────────────────────────────────────────────────

export function getChannels(): Channel[] {
  return [...channels];
}

export function getChannel(id: string): Channel | undefined {
  return channels.find((c) => c.id === id);
}

export function addChannel(channel: Channel): void {
  if (!channels.find((c) => c.id === channel.id)) {
    channels.push(channel);
  }
}

export function removeChannel(id: string): void {
  channels = channels.filter((c) => c.id !== id);
  delete videosByChannel[id];
  delete videoCache[id];
}

export function updateChannelName(id: string, name: string): Channel | undefined {
  const ch = channels.find((c) => c.id === id);
  if (ch) {
    ch.name = name;
    ch.updatedAt = new Date().toISOString();
    // Update channel name in cached videos
    const vids = videosByChannel[id];
    if (vids) {
      vids.forEach((v) => (v.channelName = name));
    }
  }
  return ch;
}

// ── Video helpers ─────────────────────────────────────────────────────────────

export function setChannelVideos(channelId: string, videos: Video[]): void {
  videosByChannel[channelId] = videos;
  videoCache[channelId] = Date.now();
}

export function getChannelVideos(channelId: string): Video[] {
  return videosByChannel[channelId] ?? [];
}

export function isVideoCacheValid(channelId: string): boolean {
  const cached = videoCache[channelId];
  if (!cached) return false;
  return Date.now() - cached < VIDEO_CACHE_TTL_MS;
}

export function invalidateVideoCache(channelId?: string): void {
  if (channelId) {
    delete videoCache[channelId];
  } else {
    for (const key of Object.keys(videoCache)) {
      delete videoCache[key];
    }
  }
}

export function getAllVideos(): Video[] {
  return [...Object.values(videosByChannel).flat(), ...userAddedVideos];
}

export function getUserAddedVideos(): Video[] {
  return [...userAddedVideos];
}

export function addUserVideo(video: Video): void {
  if (!userAddedVideos.find((v) => v.id === video.id)) {
    userAddedVideos.push(video);
  }
}

export function getUserVideo(id: string): Video | undefined {
  return userAddedVideos.find((v) => v.id === id);
}

// ── Feed helpers ──────────────────────────────────────────────────────────────

export function getFeeds(): Feed[] {
  return [...feeds];
}

export function getFeed(id: string): Feed | undefined {
  return feeds.find((f) => f.id === id);
}

export function addFeed(feed: Feed): void {
  if (!feeds.find((f) => f.id === feed.id)) {
    feeds.push(feed);
  }
}

export function removeFeed(id: string): void {
  feeds = feeds.filter((f) => f.id !== id);
  delete feedItemsByFeed[id];
}

export function setFeedItems(feedId: string, items: FeedItem[]): void {
  feedItemsByFeed[feedId] = items;
}

export function getFeedItems(feedId?: string): FeedItem[] {
  if (feedId) return feedItemsByFeed[feedId] ?? [];
  return Object.values(feedItemsByFeed).flat();
}

// ── Preferences helpers ───────────────────────────────────────────────────────

export function getPreferences(): Preferences {
  return { ...preferences };
}

export function updatePreferences(patch: Partial<Preferences>): Preferences {
  if (patch.favorites !== undefined) {
    preferences.favorites = patch.favorites;
  }
  if (patch.watchPositions !== undefined) {
    preferences.watchPositions = {
      ...preferences.watchPositions,
      ...patch.watchPositions,
    };
  }
  if (patch.favoriteNotes !== undefined) {
    // Shallow merge — do not replace entire object
    preferences.favoriteNotes = {
      ...preferences.favoriteNotes,
      ...patch.favoriteNotes,
    };
  }
  if (patch.readIds !== undefined) {
    preferences.readIds = patch.readIds;
  }
  return { ...preferences };
}

export function setFavoriteNote(videoId: string, note: string): void {
  preferences.favoriteNotes[videoId] = note;
}

export function markRead(itemId: string): void {
  if (!preferences.readIds.includes(itemId)) {
    preferences.readIds.push(itemId);
  }
}
