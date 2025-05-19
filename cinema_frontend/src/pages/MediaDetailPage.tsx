import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  Chip,
  Rating,
  Divider,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { BaseMedia, Movie, TvShow, MediaType } from '../types';
import { getProxiedCoverUrl, getMovieDetail, getTvShowDetail } from '../services/api';
import { GridContainer, GridItem } from '../components/GridWrapper';
import MediaCover from '../components/detail/MediaCover';
import MovieDownloadLinks from '../components/detail/MovieDownloadLinks';
import TvShowDownloadLinks from '../components/detail/TvShowDownloadLinks';
import { useClipboard } from '../hooks/useClipboard';

// 联合类型，表示电影或电视剧
type MediaItem = BaseMedia & (Movie | TvShow);

interface MediaDetailPageProps {
  type: MediaType;
}

// 判断是否为电影类型
function isMovie(media: MediaItem): media is Movie {
  if (!media.download_link) return false;

  // 尝试获取第一个片源的值
  const sources = Object.keys(media.download_link);
  if (sources.length === 0) return false;

  // 检查第一个片源的值是否为字符串
  const firstSourceValue = media.download_link[sources[0]];
  return typeof firstSourceValue === 'string';
}

// 判断是否为电视剧类型
function isTvShow(media: MediaItem): media is TvShow {
  if (!media.download_link) return false;

  // 尝试获取第一个片源的值
  const sources = Object.keys(media.download_link);
  if (sources.length === 0) return false;

  // 检查第一个片源的值是否为数组
  const firstSourceValue = media.download_link[sources[0]];
  return Array.isArray(firstSourceValue);
}

const MediaDetailPage: React.FC<MediaDetailPageProps> = ({ type }) => {
  const { id } = useParams<{ id: string }>();
  const [media, setMedia] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const clipboard = useClipboard();
  const { message, isSuccess, clearMessage } = clipboard;
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // 使用 useMemo 缓存 clipboardFunctions，避免不必要的重新创建
  const clipboardFunctions = useMemo(() => ({
    copyText: clipboard.copyText,
    showMessage: clipboard.showMessage
  }), [clipboard.copyText, clipboard.showMessage]);

  useEffect(() => {
    // 通过API获取
    const fetchMediaDetail = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        let result;
        if (type === 'movie') {
          result = await getMovieDetail({ id });
        } else {
          result = await getTvShowDetail({ id });
        }
        if (result) {
          // 处理封面URL，添加代理
          const mediaWithProxiedCover = {
            ...result,
            cover: getProxiedCoverUrl(result.cover)
          };
          setMedia(mediaWithProxiedCover);
        } else {
          setError('未找到相关媒体信息');
        }
      } catch (err) {
        setError('获取媒体详情失败');
        console.error('获取媒体详情失败', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMediaDetail();
  }, [id, type]);

  // 监听剪贴板钩子的消息状态
  useEffect(() => {
    if (message) {
      setSnackbarMessage(message);
      setSnackbarSeverity(isSuccess ? 'success' : 'error');
      setSnackbarOpen(true);
    }
  }, [message, isSuccess]);

  const handleCloseSnackbar = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
    clearMessage();
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <CircularProgress color="primary" />
        </Box>
      </Container>
    );
  }

  if (error || !media) {
    return (
      <Container>
        <Box sx={{ pt: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            {error || '未找到媒体信息'}
          </Typography>
        </Box>
      </Container>
    );
  }

  // 将分类字符串转换为数组
  const categories = media.category ? media.category.split(',').map(cat => cat.trim()) : [];

  // 检查媒体类型是否与URL请求的类型一致
  const isCorrectMediaType =
    (type === 'movie' && isMovie(media)) ||
    (type === 'tvshow' && isTvShow(media));

  if (!isCorrectMediaType) {
    console.warn(`媒体类型不匹配: URL请求类型为${type}，但获取到的数据类型为${isMovie(media) ? 'movie' : 'tvshow'}`);
    // 继续渲染，因为我们已经获取了数据
  }

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
      <Box sx={{ py: 2 }}>
        <Card sx={{ bgcolor: 'background.paper', overflow: 'hidden', borderRadius: 2, boxShadow: 3 }}>
          <GridContainer>
            {/* 封面部分 */}
            <GridItem xs={12} sm={4} md={3}>
              <MediaCover media={media} />
            </GridItem>

            {/* 详情部分 */}
            <GridItem xs={12} sm={8} md={9}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                  {media.name}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Rating value={media.score ? media.score / 2 : 0} precision={0.5} readOnly />
                  <Typography variant="body1" sx={{ ml: 1 }}>
                    {media.score ? media.score.toFixed(1) : '暂无评分'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {categories.map((category) => (
                    <Chip
                      key={category}
                      label={category}
                      size="small"
                      sx={{ bgcolor: 'rgba(0, 180, 216, 0.2)' }}
                    />
                  ))}
                </Box>

                <GridContainer spacing={2} sx={{ mb: 2 }}>
                  <GridItem xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      导演: {media.director || '未知'}
                    </Typography>
                  </GridItem>
                  <GridItem xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      上映日期: {media.release_date || '未知'}
                    </Typography>
                  </GridItem>
                  <GridItem xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      地区: {media.area || '未知'}
                    </Typography>
                  </GridItem>
                  <GridItem xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      语言: {media.language || '未知'}
                    </Typography>
                  </GridItem>
                  <GridItem xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      时长: {media.duration || '未知'}
                    </Typography>
                  </GridItem>
                  <GridItem xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      演员: {media.actors || '未知'}
                    </Typography>
                  </GridItem>
                </GridContainer>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                  剧情简介
                </Typography>
                <Typography variant="body1" paragraph>
                  {media.summary || '暂无简介'}
                </Typography>

                {/* 下载链接部分 */}
                <Box sx={{ mt: 3 }}>
                  {isMovie(media) ? (
                    <MovieDownloadLinks movie={media} clipboard={clipboardFunctions} />
                  ) : isTvShow(media) ? (
                    <TvShowDownloadLinks tvShow={media} clipboard={clipboardFunctions} />
                  ) : (
                    <Typography color="error">
                      无法识别媒体类型，下载功能不可用
                    </Typography>
                  )}
                </Box>
              </Box>
            </GridItem>
          </GridContainer>
        </Card>
      </Box>

      {/* 添加消息通知组件 */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MediaDetailPage;