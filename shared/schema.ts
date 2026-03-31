export interface Channel {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Video {
  id: string;
  channelId: string;
  channelName: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
  durationSeconds: number | null;
  viewCount?: number;
  userAdded?: boolean;
}

export interface Feed {
  id: string;
  title: string;
  url: string;
  folderId?: string;
}

export interface FeedItem {
  id: string;
  feedId: string;
  title: string;
  link: string;
  publishedAt: string;
  content: string;
  snippet: string;
  author?: string;
  imageUrl?: string;
}

export interface Preferences {
  favorites: string[];
  watchPositions: Record<string, number>;
  favoriteNotes: Record<string, string>;
  readIds: string[];
}
