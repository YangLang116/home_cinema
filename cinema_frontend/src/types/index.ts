export interface BaseMedia {
  id: number;
  actors: string;
  area: string;
  category: string;
  cover: string;
  director: string | null;
  duration: string;
  language: string;
  name: string;
  release_date: string;
  score: number;
  summary: string;
  source: string;
}

export interface Movie extends BaseMedia {
  download_link: Record<string, string>;
}

export interface TvShow extends BaseMedia {
  download_link: Record<string, { name: string; link: string }[]>;
}

export type MediaType = 'movie' | 'tvshow';

export interface PaginationParams {
  page: number;
  count: number;
  sort_by?: SortByType;
  sort_order?: SortOrderType;
  area?: string;
  category?: string;
}

export interface SearchParams {
  name: string;
}

export interface DetailParams {
  id: string;
}

export type SortByType = 'time' | 'score';
export type SortOrderType = 'asc' | 'desc';

export interface SortConfig {
  sort_by: SortByType;
  sort_order: SortOrderType;
}

export interface AreaConfig {
  area: string;
}

export interface CategoryConfig {
  category: string;
} 