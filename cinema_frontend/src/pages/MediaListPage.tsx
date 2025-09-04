import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  CircularProgress, 
  Container, 
  Zoom, 
  Fab,
  Stack,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { KeyboardArrowUp as KeyboardArrowUpIcon } from '@mui/icons-material';
import MediaCard from '../components/MediaCard';
import MediaFilters from '../components/MediaFilters';
import SearchInput from '../components/SearchInput';
import { useMedia } from '../hooks/useMedia';
import { MediaType } from '../types';
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
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  useIntersectionObserver({
    target: loadMoreRef as React.RefObject<HTMLDivElement>,
    onIntersect: loadMore,
    enabled: hasMore && !loading && !searchQuery,
    threshold: 0.1,
    rootMargin: '800px 0px',
  });


  const handleClearSearch = useCallback(() => {
    setSearchText('');
    handleSearchChange('');
  }, [handleSearchChange]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setSearchText('');
    handleSearchChange('');
  }, [type, handleSearchChange]);

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
            <MediaFilters
              sortConfig={sortConfig}
              onSortChange={handleSortChange}
              areaConfig={areaConfig}
              onAreaChange={handleAreaChange}
              areas={areas}
              areasLoading={areasLoading}
              categoryConfig={categoryConfig}
              onCategoryChange={handleCategoryChange}
              categories={categories}
              categoriesLoading={categoriesLoading}
            />

            <SearchInput
              value={searchText}
              onChange={setSearchText}
              onSubmit={() => handleSearchChange(searchText)}
              onClear={handleClearSearch}
              placeholder="搜索..."
            />
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
            py: 2,
            visibility: loading || !hasMore ? 'hidden' : 'visible',
            height: 50,
          }}
        />

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