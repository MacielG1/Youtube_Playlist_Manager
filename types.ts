export type PlaylistAPI = {
  id: string;
  snippet: {
    channelId: string;
    title: string;
    thumbnails?: Thumbnails;
    resourceId?: {
      videoId: string;
    };
    description?: string;
    publishedAt?: string;
  };
  contentDetails?: {
    itemCount?: number;
  };
};
export type VideoAPI = {
  id: string;
  snippet: {
    title: string;
    thumbnails?: Thumbnails;
    description?: string;
    channelTitle: string;
    publishedAt: string;
    channelId: string;
  };
  contentDetails: {
    duration: string;
  };
};

export type Playlist = {
  id: string;
  title: string;
  thumbnails: Thumbnails;
  description?: string;
  videosData?: Video[];
  duration?: string;
  channel?: string;
  publishedAt?: string;
};
export type Video = {
  id: string;
  title: string;
  thumbnails: Thumbnails;
  description: string;
  channel: string;
  channelId?: string;
  publishedAt: string;
};

export type Items = {
  items: Playlist[];
};

export type Thumbnail = {
  url: string;
  width: number;
  height: number;
};
export type Thumbnails = {
  default?: Thumbnail;
  medium?: Thumbnail;
  high?: Thumbnail;
  standard?: Thumbnail;
  maxres?: Thumbnail;
};

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
