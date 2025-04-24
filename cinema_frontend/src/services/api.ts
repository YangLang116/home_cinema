import axios from 'axios';
import { Movie, TvShow, PaginationParams, SearchParams } from '../types';

// 使用当前应用的主机地址和协议
const BASE_URL = `${window.location.protocol}//${window.location.hostname}:7000`;

// 处理封面图片URL，添加代理前缀
export const getProxiedCoverUrl = (coverUrl: string): string => {
  return `${BASE_URL}/media/proxy?url=${encodeURIComponent(coverUrl)}`;
};

// 电影相关API
export const getMovieList = async ({ page, count, sort_by, sort_order, area, category }: PaginationParams): Promise<Movie[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/movie/list`, {
      params: { page, count, sort_by, sort_order, area, category }
    });
    return response.data;
  } catch (error) {
    console.error('获取电影列表失败', error);
    return [];
  }
};

export const searchMovie = async ({ name }: SearchParams): Promise<Movie[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/movie/search`, {
      params: { name }
    });
    return response.data;
  } catch (error) {
    console.error('搜索电影失败', error);
    return [];
  }
};

export const getMovieAreas = async (): Promise<string[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/movie/areas`);
    return response.data.data || [];
  } catch (error) {
    console.error('获取电影区域列表失败', error);
    return [];
  }
};

export const getMovieCategories = async (): Promise<string[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/movie/categories`);
    return response.data.data || [];
  } catch (error) {
    console.error('获取电影类别列表失败', error);
    return [];
  }
};

// 电视剧相关API
export const getTvShowList = async ({ page, count, sort_by, sort_order, area, category }: PaginationParams): Promise<TvShow[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/tvshow/list`, {
      params: { page, count, sort_by, sort_order, area, category }
    });
    return response.data;
  } catch (error) {
    console.error('获取电视剧列表失败', error);
    return [];
  }
};

export const searchTvShow = async ({ name }: SearchParams): Promise<TvShow[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/tvshow/search`, {
      params: { name }
    });
    return response.data;
  } catch (error) {
    console.error('搜索电视剧失败', error);
    return [];
  }
};

export const getTvShowAreas = async (): Promise<string[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/tvshow/areas`);
    return response.data.data || [];
  } catch (error) {
    console.error('获取电视剧区域列表失败', error);
    return [];
  }
};

export const getTvShowCategories = async (): Promise<string[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/tvshow/categories`);
    return response.data.data || [];
  } catch (error) {
    console.error('获取电视剧类别列表失败', error);
    return [];
  }
};
