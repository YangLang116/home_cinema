import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getMovieList, 
  getTvShowList, 
  searchMovie, 
  searchTvShow, 
  getCoverUrl,
  getMovieAreas,
  getTvShowAreas,
  getMovieCategories,
  getTvShowCategories
} from '../services/api';
import { 
  Movie, 
  TvShow, 
  MediaType, 
  BaseMedia,
  SortConfig, 
  AreaConfig, 
  CategoryConfig 
} from '../types';
import { isMovieArray, isTvShowArray } from '../utils/mediaTypeUtils';

function processMediaData<T extends BaseMedia>(data: T[]): T[] {
  return data.map(item => ({
    ...item,
    cover: getCoverUrl(item.cover)
  }));
}

interface UseMediaProps {
  type: MediaType;
  initialPage?: number;
  count?: number;
}

// 默认排序配置
const DEFAULT_SORT_CONFIG: SortConfig = {
  sort_by: 'time',
  sort_order: 'desc'
};

// 默认区域配置
const DEFAULT_AREA_CONFIG: AreaConfig = {
  area: ''
};

// 默认类别配置
const DEFAULT_CATEGORY_CONFIG: CategoryConfig = {
  category: ''
};

export const useMedia = ({ type, initialPage = 0, count = 36 }: UseMediaProps) => {
  const [data, setData] = useState<Movie[] | TvShow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [sortConfig, setSortConfig] = useState<SortConfig>(DEFAULT_SORT_CONFIG);
  const [areaConfig, setAreaConfig] = useState<AreaConfig>(DEFAULT_AREA_CONFIG);
  const [categoryConfig, setCategoryConfig] = useState<CategoryConfig>(DEFAULT_CATEGORY_CONFIG);
  const [areas, setAreas] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [areasLoading, setAreasLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // 使用ref来防止并发加载和检查是否已经加载了某个页码
  const loadingRef = useRef(false);
  const loadedPagesRef = useRef<Set<number>>(new Set([initialPage]));

  // 预加载标志，当用户滚动到接近底部时预加载下一页
  const isPreloading = useRef(false);

  // 标记重新加载数据请求，避免在依赖项中直接使用sortConfig
  const shouldReloadRef = useRef(false);

  // 获取区域列表
  const fetchAreas = useCallback(async () => {
    setAreasLoading(true);
    try {
      let areaList: string[] = [];
      if (type === 'movie') {
        areaList = await getMovieAreas();
      } else {
        areaList = await getTvShowAreas();
      }
      setAreas(areaList);
    } catch (error) {
      console.error('获取区域列表失败', error);
    } finally {
      setAreasLoading(false);
    }
  }, [type]);

  // 获取类别列表
  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      let categoryList: string[] = [];
      if (type === 'movie') {
        categoryList = await getMovieCategories();
      } else {
        categoryList = await getTvShowCategories();
      }
      setCategories(categoryList);
    } catch (error) {
      console.error('获取类别列表失败', error);
    } finally {
      setCategoriesLoading(false);
    }
  }, [type]);

  // 当类型变化时获取相应的区域和类别列表
  useEffect(() => {
    fetchAreas();
    fetchCategories();
  }, [type, fetchAreas, fetchCategories]);

  const fetchData = useCallback(async (currentPage: number, append: boolean = false) => {
    // 如果已经加载过这个页码或者正在加载中，则直接返回
    if (loadedPagesRef.current.has(currentPage) && append && data.length > 0 && !shouldReloadRef.current) {
      return Promise.resolve(); // 返回一个已解决的Promise
    }
    if (loadingRef.current) {
      return Promise.resolve(); // 返回一个已解决的Promise
    }

    // 重置重新加载标志
    shouldReloadRef.current = false;

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      if (type === 'movie') {
        const result = await getMovieList({
          page: currentPage,
          count,
          sort_by: sortConfig.sort_by,
          sort_order: sortConfig.sort_order,
          area: areaConfig.area,
          category: categoryConfig.category
        });
        const processedResult = processMediaData<Movie>(result);

        if (processedResult.length < count) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }

        if (append && isMovieArray(data)) {
          setData(prevData => [...prevData as Movie[], ...processedResult]);
        } else {
          setData(processedResult);
        }
      } else {
        const result = await getTvShowList({
          page: currentPage,
          count,
          sort_by: sortConfig.sort_by,
          sort_order: sortConfig.sort_order,
          area: areaConfig.area,
          category: categoryConfig.category
        });
        const processedResult = processMediaData<TvShow>(result);

        if (processedResult.length < count) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }

        if (append && isTvShowArray(data)) {
          setData(prevData => [...prevData as TvShow[], ...processedResult]);
        } else {
          setData(processedResult);
        }
      }

      // 记录已加载的页码
      loadedPagesRef.current.add(currentPage);
      setIsInitialLoad(false);
      isPreloading.current = false;
      return Promise.resolve(); // 成功后返回已解决的Promise
    } catch (err) {
      setError('获取数据失败，请稍后再试');
      console.error('获取数据失败', err);
      setHasMore(false);
      return Promise.reject(err); // 失败后返回已拒绝的Promise
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [type, count, data, sortConfig, areaConfig, categoryConfig]);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setPage(0);
      loadedPagesRef.current = new Set([0]);
      fetchData(0, false);
      return;
    }

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      if (type === 'movie') {
        const result = await searchMovie({ name: query });
        setData(processMediaData<Movie>(result));
      } else {
        const result = await searchTvShow({ name: query });
        setData(processMediaData<TvShow>(result));
      }
      setHasMore(false); // 搜索结果不支持分页
    } catch (err) {
      setError('搜索失败，请稍后再试');
      console.error('搜索失败', err);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [type, fetchData]);

  // 统一的数据加载触发器
  const triggerDataLoad = useCallback(() => {
    if (loadingRef.current) return;

    if (!searchQuery) {
      setPage(initialPage);
      loadedPagesRef.current = new Set([initialPage]);
      fetchData(initialPage, false);
    } else {
      handleSearch(searchQuery);
    }
  }, [fetchData, handleSearch, initialPage, searchQuery]);

  // 初始加载和类型/搜索/排序/区域/类别变化时
  useEffect(() => {
    // 使用ref防止重复加载
    // 标记当前加载的状态组合，用于调试
    // const loadingKey = `${type}-${searchQuery}-${sortConfig.sort_by}-${sortConfig.sort_order}-${areaConfig.area}-${categoryConfig.category}`;

    if (isInitialLoad && !loadingRef.current) {
      triggerDataLoad();
      setIsInitialLoad(false); // 加载后立即设置为false，防止下次依赖变更再次触发
    }
  }, [isInitialLoad, triggerDataLoad, type, searchQuery, sortConfig, areaConfig, categoryConfig]);

  // 处理排序变更
  const handleSortChange = useCallback((newSortConfig: Partial<SortConfig>) => {
    setSortConfig(prev => ({ ...prev, ...newSortConfig }));
    setPage(0);
    setData([]);
    setHasMore(true);
    setIsInitialLoad(true);
    loadedPagesRef.current = new Set();
    shouldReloadRef.current = true;
  }, []);

  // 处理区域变更
  const handleAreaChange = useCallback((newAreaConfig: Partial<AreaConfig>) => {
    setAreaConfig(prev => ({ ...prev, ...newAreaConfig }));
    setPage(0);
    setData([]);
    setHasMore(true);
    setIsInitialLoad(true);
    loadedPagesRef.current = new Set();
    shouldReloadRef.current = true;
  }, []);

  // 处理类别变更
  const handleCategoryChange = useCallback((newCategoryConfig: Partial<CategoryConfig>) => {
    setCategoryConfig(prev => ({ ...prev, ...newCategoryConfig }));
    setPage(0);
    setData([]);
    setHasMore(true);
    setIsInitialLoad(true);
    loadedPagesRef.current = new Set();
    shouldReloadRef.current = true;
  }, []);

  const loadMore = useCallback(() => {
    // 如果正在加载或没有更多数据或在搜索状态，则不加载
    if (loadingRef.current || !hasMore || searchQuery || isPreloading.current) return;

    // 标记为预加载状态，防止重复触发
    isPreloading.current = true;

    // 直接加载下一页，无需延迟
    const nextPage = page + 1;
    setPage(nextPage);
    fetchData(nextPage, true)
      .finally(() => {
        // 无论成功与否，都重置预加载状态
        setTimeout(() => {
          isPreloading.current = false;
        }, 200);
      });
  }, [hasMore, searchQuery, page, fetchData]);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(0);
    setHasMore(true);
    setIsInitialLoad(true);
    loadedPagesRef.current = new Set([0]);
  }, []);

  // 当类型变化时重置状态
  useEffect(() => {
    setData([]);
    setPage(initialPage);
    setError(null);
    setHasMore(true);
    setIsInitialLoad(true);
    setSearchQuery(''); // 重置搜索查询
    setSortConfig(DEFAULT_SORT_CONFIG);
    setAreaConfig(DEFAULT_AREA_CONFIG);
    setCategoryConfig(DEFAULT_CATEGORY_CONFIG);
    loadedPagesRef.current = new Set([initialPage]);
    isPreloading.current = false;
  }, [type, initialPage]);

  return {
    data,
    loading,
    error,
    page,
    loadMore,
    searchQuery,
    handleSearchChange,
    hasMore,
    sortConfig,
    handleSortChange,
    areas,
    areasLoading,
    areaConfig,
    handleAreaChange,
    categories,
    categoriesLoading,
    categoryConfig,
    handleCategoryChange
  };
}; 