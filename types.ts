export interface Playlist {
  id: string;
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails?: Thumbnails;
  };
}

export interface Items {
  items: Playlist[];
}

export interface Thumbnail {
  url: string;
  width: number;
  height: number;
}
export interface Thumbnails {
  default?: Thumbnail;
  medium?: Thumbnail;
  high?: Thumbnail;
  standard?: Thumbnail;
  maxres?: Thumbnail;
}

export type PlaylistItem = {
  currentItem: number;
  currentPage?: number;
  initialTime: number;
};

export type VideoItem = {
  initialTime: number;
};

export type SavedItem = {
  key: string;
  data: Playlist | VideoItem;
};

export type PlVideos = {
  videosIds?: string[];
  updatedTime?: number;
};

export type PlaylistInfo = {
  currentItem: number;
  initialTime: number;
  currentPage: number;
};
