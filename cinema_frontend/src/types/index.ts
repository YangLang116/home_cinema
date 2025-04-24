export interface Movie {
  actors: string;
  area: string;
  category: string;
  cover: string;
  director: string | null;
  download_link: string;
  duration: string;
  language: string;
  name: string;
  release_date: string;
  score: number;
  summary: string;
}

export interface TvShow {
  actors: string;
  area: string;
  category: string;
  cover: string;
  director: string | null;
  download_link: { name: string; link: string }[];
  duration: string;
  language: string;
  name: string;
  release_date: string;
  score: number;
  summary: string;
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