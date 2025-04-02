import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  CircularProgress, 
  Container, 
  TextField, 
  InputAdornment, 
  IconButton, 
  Zoom, 
  Fab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Stack,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { 
  Search as SearchIcon, 
  Clear as ClearIcon, 
  KeyboardArrowUp as KeyboardArrowUpIcon,
  SortByAlpha as SortIcon,
  AccessTime as TimeIcon,
  Star as StarIcon
} from '@mui/icons-material';
import MediaCard from '../components/MediaCard';
import { useMedia } from '../hooks/useMedia';
import { MediaType, SortByType, SortOrderType } from '../types';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface MediaListPageProps {
  type: MediaType;
  title: string;
}

// 调试组件，显示加载状态
const DebugInfo = ({ loading, hasMore, searchQuery, page, data }: { 
  loading: boolean; 
  hasMore: boolean; 
  searchQuery: string;
  page: number;
  data: any[];
}) => {
  const [showDebug, setShowDebug] = useState(false);

  if (!showDebug) return (
    <Fab 
      size="small" 
      color="default" 
      sx={{ position: 'fixed', bottom: 20, left: 20, zIndex: 1000, opacity: 0.7 }}
      onClick={() => setShowDebug(true)}
    >
      <Box component="span" sx={{ fontSize: '0.7rem' }}>调试</Box>
    </Fab>
  );

  return (
    <Box 
      sx={{ 
        position: 'fixed', 
        bottom: 20, 
        left: 20, 
        zIndex: 1000, 
        bgcolor: 'background.paper',
        p: 2,
        borderRadius: 1,
        boxShadow: 3,
        maxWidth: 250,
        opacity: 0.9
      }}
    >
      <Typography variant="subtitle2" gutterBottom>调试信息</Typography>
      <Box sx={{ fontSize: '0.75rem' }}>
        <Box>加载中: {loading ? '是' : '否'}</Box>
        <Box>有更多: {hasMore ? '是' : '否'}</Box>
        <Box>搜索关键字: {searchQuery || '无'}</Box>
        <Box>当前页码: {page}</Box>
        <Box>数据项数: {data.length}</Box>
      </Box>
      <Box sx={{ mt: 1, textAlign: 'right' }}>
        <IconButton size="small" onClick={() => setShowDebug(false)}>
          <ClearIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};

const MediaListPage: React.FC<MediaListPageProps> = ({ type, title }) => {
  const { 
    data, 
    loading, 
    error, 
    loadMore, 
    searchQuery, 
    handleSearchChange, 
    hasMore,
    sortConfig,
    handleSortChange,
    page
  } = useMedia({ type });
  const [searchText, setSearchText] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // 创建一个用于观察的元素引用
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  // 使用自定义的 intersection observer 钩子
  useIntersectionObserver({
    target: loadMoreRef as React.RefObject<HTMLDivElement>,
    onIntersect: loadMore,
    enabled: hasMore && !loading && !searchQuery, // 只有在还有更多数据且不在加载状态时才启用
    threshold: 0.1, // 降低阈值，当元素有10%可见时就触发
    rootMargin: '300px 0px', // 增加下方边距，使元素在进入视口前就开始检测
  });

  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  }, []);

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    handleSearchChange(searchText);
  }, [handleSearchChange, searchText]);

  const handleClearSearch = useCallback(() => {
    setSearchText('');
    handleSearchChange('');
  }, [handleSearchChange]);

  const handleSortByChange = useCallback((event: SelectChangeEvent) => {
    const newValue = event.target.value as SortByType;
    if (newValue !== sortConfig.sort_by) {
      handleSortChange({ sort_by: newValue });
    }
  }, [handleSortChange, sortConfig.sort_by]);

  const handleSortOrderChange = useCallback((event: SelectChangeEvent) => {
    const newValue = event.target.value as SortOrderType;
    if (newValue !== sortConfig.sort_order) {
      handleSortChange({ sort_order: newValue });
    }
  }, [handleSortChange, sortConfig.sort_order]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  // 检测滚动位置以显示/隐藏回到顶部按钮
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 当类型变化时重置搜索文本
  useEffect(() => {
    setSearchText('');
  }, [type]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" component="h1">
            {title}
          </Typography>
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            {/* 排序控制 */}
            <Stack direction="row" spacing={2} alignItems="center">
              <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="sort-by-label">排序字段</InputLabel>
                <Select
                  labelId="sort-by-label"
                  id="sort-by"
                  value={sortConfig.sort_by}
                  onChange={handleSortByChange}
                  label="排序字段"
                  startAdornment={
                    sortConfig.sort_by === 'time' ? 
                    <TimeIcon sx={{ mr: 1, color: 'primary.main' }} /> : 
                    <StarIcon sx={{ mr: 1, color: 'primary.main' }} />
                  }
                >
                  <MenuItem value="time">上映时间</MenuItem>
                  <MenuItem value="score">评分</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="sort-order-label">排序方向</InputLabel>
                <Select
                  labelId="sort-order-label"
                  id="sort-order"
                  value={sortConfig.sort_order}
                  onChange={handleSortOrderChange}
                  label="排序方向"
                  startAdornment={<SortIcon sx={{ mr: 1, color: 'primary.main' }} />}
                >
                  <MenuItem value="desc">降序</MenuItem>
                  <MenuItem value="asc">升序</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          
            {/* 搜索框 */}
            <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                value={searchText}
                onChange={handleSearchInputChange}
                placeholder="搜索..."
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchText && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={handleClearSearch}>
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{ width: 300 }}
              />
            </Box>
          </Stack>
        </Box>

        {error && (
          <Box sx={{ my: 4, textAlign: 'center' }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}

        <Grid container spacing={isMobile ? 1 : 3}>
          {data.map((media, index) => (
            <Grid item xs={4} sm={6} md={4} lg={3} xl={2} key={`${media.name}-${index}`}>
              <MediaCard media={media} type={type} />
            </Grid>
          ))}
        </Grid>

        {/* 加载更多的触发元素 */}
        <Box
          ref={loadMoreRef}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            py: 4,
            visibility: loading || !hasMore ? 'hidden' : 'visible',
            height: 100, // 保持高度使其成为一个足够大的目标
          }}
        >
          {/* 添加一个可见的指示器，帮助理解加载触发区域 */}
          {hasMore && !loading && !searchQuery && (
            <Typography color="textSecondary" sx={{ opacity: 0.7 }}>
              向下滚动加载更多
            </Typography>
          )}
        </Box>

        {/* 加载状态指示器 */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* 没有更多数据的提示 */}
        {!hasMore && data.length > 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="textSecondary">没有更多内容了</Typography>
          </Box>
        )}

        {/* 无数据提示 */}
        {!loading && data.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="textSecondary">
              {searchQuery ? '没有找到匹配的结果' : '暂无数据'}
            </Typography>
          </Box>
        )}

        {/* 回到顶部按钮 */}
        <Zoom in={showScrollTop}>
          <Fab 
            color="primary" 
            size="small" 
            aria-label="回到顶部" 
            onClick={scrollToTop}
            sx={{ 
              position: 'fixed', 
              bottom: 20, 
              right: 20,
              zIndex: 1000
            }}
          >
            <KeyboardArrowUpIcon />
          </Fab>
        </Zoom>

        {/* 调试信息 */}
        <DebugInfo 
          loading={loading} 
          hasMore={hasMore} 
          searchQuery={searchQuery} 
          page={page}
          data={data}
        />
      </Box>
    </Container>
  );
};

export default MediaListPage; 