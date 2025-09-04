import { BaseMedia, Movie, TvShow } from '../types';

type MediaItem = BaseMedia & (Movie | TvShow);

export function isMovie(media: MediaItem): media is Movie {
  if (!media.download_link) return false;

  const sources = Object.keys(media.download_link);
  if (sources.length === 0) return false;

  const firstSourceValue = media.download_link[sources[0]];
  return typeof firstSourceValue === 'string';
}

export function isTvShow(media: MediaItem): media is TvShow {
  if (!media.download_link) return false;

  const sources = Object.keys(media.download_link);
  if (sources.length === 0) return false;

  const firstSourceValue = media.download_link[sources[0]];
  return Array.isArray(firstSourceValue);
}

export function isMovieArray(data: any[]): data is Movie[] {
  if (data.length === 0) return false;
  if (!('download_link' in data[0])) return false;
  
  const firstItem = data[0] as Movie;
  const sources = Object.keys(firstItem.download_link);
  if (sources.length === 0) return false;
  
  const firstSourceValue = firstItem.download_link[sources[0]];
  return typeof firstSourceValue === 'string';
}

export function isTvShowArray(data: any[]): data is TvShow[] {
  if (data.length === 0) return false;
  if (!('download_link' in data[0])) return false;
  
  const firstItem = data[0] as TvShow;
  const sources = Object.keys(firstItem.download_link);
  if (sources.length === 0) return false;
  
  const firstSourceValue = firstItem.download_link[sources[0]];
  return Array.isArray(firstSourceValue);
}
