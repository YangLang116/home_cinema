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
  useMediaQuery,
  Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { 
  Search as SearchIcon, 
  Clear as ClearIcon, 
  KeyboardArrowUp as KeyboardArrowUpIcon,
  SortByAlpha as SortIcon,
  AccessTime as TimeIcon,
  Star as StarIcon,
  Public as PublicIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import MediaCard from '../components/MediaCard';
import { useMedia } from '../hooks/useMedia';
import { MediaType, SortByType, SortOrderType } from '../types';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface MediaListPageProps {
  type: MediaType;
  title: string;
}

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
    areas,
    areasLoading,
    areaConfig,
    handleAreaChange,
    categories,
    categoriesLoading,
    categoryConfig,
    handleCategoryChange
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

  const handleAreaSelectChange = useCallback((event: SelectChangeEvent) => {
    const newValue = event.target.value;
    if (newValue !== areaConfig.area) {
      handleAreaChange({ area: newValue });
    }
  }, [handleAreaChange, areaConfig.area]);

  const handleCategorySelectChange = useCallback((event: SelectChangeEvent) => {
    const newValue = event.target.value;
    if (newValue !== categoryConfig.category) {
      handleCategoryChange({ category: newValue });
    }
  }, [handleCategoryChange, categoryConfig.category]);

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
    <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" component="h1" sx={{ mt: { xs: 0, sm: 1 } }}>
            {title}
          </Typography>
          
          <Stack direction="column" spacing={2} alignItems="flex-start" width={{ xs: '100%', sm: 'auto' }}>
            {/* 排序控制 - 移动端使用水平滚动容器 */}
            <Box 
              sx={{ 
                width: '100%', 
                overflowX: 'auto', 
                WebkitOverflowScrolling: 'touch',
                '&::-webkit-scrollbar': {
                  height: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '4px',
                }
              }}
            >
              <Stack 
                direction="row" 
                spacing={1} 
                alignItems="center" 
                sx={{ 
                  py: 1, 
                  minWidth: { xs: 'min-content' },
                  '& .MuiFormControl-root': {
                    minWidth: { xs: 110, sm: 120 }
                  }
                }}
              >
                <FormControl variant="outlined" size="small">
                  <InputLabel id="sort-by-label">排序类型</InputLabel>
                  <Select
                    labelId="sort-by-label"
                    id="sort-by"
                    value={sortConfig.sort_by}
                    onChange={handleSortByChange}
                    label="排序类型"
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
                
                <FormControl variant="outlined" size="small">
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

                {/* 区域筛选下拉列表 */}
                <FormControl variant="outlined" size="small">
                  <InputLabel id="area-label">地区</InputLabel>
                  <Select
                    labelId="area-label"
                    id="area"
                    value={areaConfig.area}
                    onChange={handleAreaSelectChange}
                    label="地区"
                    startAdornment={<PublicIcon sx={{ mr: 1, color: 'primary.main' }} />}
                    disabled={areasLoading}
                    displayEmpty
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 400,
                        }
                      }
                    }}
                  >
                    {/* 全部选项 */}
                    <MenuItem 
                      value="" 
                      sx={{ 
                        fontWeight: !areaConfig.area ? 'bold' : 'normal',
                        bgcolor: !areaConfig.area ? 'rgba(0, 180, 216, 0.08)' : 'inherit'
                      }}
                    >
                      全部
                    </MenuItem>
                    
                    <Divider />
                    
                    {/* 直接显示所有区域，不分组，但按字母顺序排序 */}
                    {[...areas].sort().map((area) => (
                      <MenuItem 
                        key={area} 
                        value={area}
                        sx={{ 
                          fontWeight: areaConfig.area === area ? 'bold' : 'normal',
                          bgcolor: areaConfig.area === area ? 'rgba(0, 180, 216, 0.08)' : 'inherit'
                        }}
                      >
                        {area}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* 类别筛选下拉列表 */}
                <FormControl variant="outlined" size="small">
                  <InputLabel id="category-label">类别</InputLabel>
                  <Select
                    labelId="category-label"
                    id="category"
                    value={categoryConfig.category}
                    onChange={handleCategorySelectChange}
                    label="类别"
                    startAdornment={<CategoryIcon sx={{ mr: 1, color: 'primary.main' }} />}
                    disabled={categoriesLoading}
                    displayEmpty
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 400,
                        }
                      }
                    }}
                  >
                    {/* 全部选项 */}
                    <MenuItem 
                      value="" 
                      sx={{ 
                        fontWeight: !categoryConfig.category ? 'bold' : 'normal',
                        bgcolor: !categoryConfig.category ? 'rgba(0, 180, 216, 0.08)' : 'inherit'
                      }}
                    >
                      全部
                    </MenuItem>
                    
                    <Divider />
                    
                    {/* 直接显示所有类别，按字母顺序排序 */}
                    {[...categories].sort().map((category) => (
                      <MenuItem 
                        key={category} 
                        value={category}
                        sx={{ 
                          fontWeight: categoryConfig.category === category ? 'bold' : 'normal',
                          bgcolor: categoryConfig.category === category ? 'rgba(0, 180, 216, 0.08)' : 'inherit'
                        }}
                      >
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Box>
          
            {/* 搜索框 */}
            <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <TextField
                value={searchText}
                onChange={handleSearchInputChange}
                placeholder="搜索..."
                variant="outlined"
                size="small"
                autoComplete="off"
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
                  ),
                  inputProps: {
                    autoComplete: "off",
                    onDoubleClick: (e: React.MouseEvent<HTMLInputElement>) => {
                      e.preventDefault();
                      return false;
                    }
                  }
                }}
                sx={{ width: '100%' }}
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
            <Grid item xs={6} sm={4} md={3} lg={2.4} xl={2} key={`${media.name}-${index}`}>
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
              {searchQuery 
                ? '没有找到匹配的结果' 
                : (areaConfig.area || categoryConfig.category) 
                  ? `没有找到符合条件的内容` 
                  : '暂无数据'
              }
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
      </Box>
    </Container>
  );
};

export default MediaListPage; 