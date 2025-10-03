export const ANIME_STATUS = {
  WATCHING: 'watching',
  COMPLETED: 'completed',
  ON_HOLD: 'on-hold',
  DROPPED: 'dropped',
  PLAN_TO_WATCH: 'plan-to-watch',
} as const;

export const MANGA_STATUS = {
  READING: 'reading',
  COMPLETED: 'completed',
  ON_HOLD: 'on-hold',
  DROPPED: 'dropped',
  PLAN_TO_READ: 'plan-to-read',
} as const;

export type AnimeStatus = typeof ANIME_STATUS[keyof typeof ANIME_STATUS];
export type MangaStatus = typeof MANGA_STATUS[keyof typeof MANGA_STATUS];

export interface AnimeEntry {
  id: string;
  title: string;
  type: 'anime';
  status: AnimeStatus;
  rating?: number;
  progress: number;
  totalEpisodes?: number;
  genre: string[];
  imageUrl?: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
}

export interface MangaEntry {
  id: string;
  title: string;
  type: 'manga';
  status: MangaStatus;
  rating?: number;
  progress: number;
  totalChapters?: number;
  genre: string[];
  imageUrl?: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
}

export type Entry = AnimeEntry | MangaEntry;

export const MEDIA_TYPE = {
  ANIME: 'anime',
  MANGA: 'manga',
} as const;

export type MediaType = typeof MEDIA_TYPE[keyof typeof MEDIA_TYPE];

export type StatusType = AnimeStatus | MangaStatus;