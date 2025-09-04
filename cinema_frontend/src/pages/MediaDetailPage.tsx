import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Card,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  Typography
} from '@mui/material';
import { BaseMedia, Movie, TvShow, MediaType } from '../types';
import { getCoverUrl, getMovieDetail, getTvShowDetail } from '../services/api';
import { GridContainer, GridItem } from '../components/GridWrapper';
import MediaCover from '../components/detail/MediaCover';
import MediaInfo from '../components/MediaInfo';
import MovieDownloadLinks from '../components/detail/MovieDownloadLinks';
import TvShowDownloadLinks from '../components/detail/TvShowDownloadLinks';
import { useClipboard } from '../hooks/useClipboard';
import { isMovie, isTvShow } from '../utils/mediaTypeUtils';

// 联合类型，表示电影或电视剧
type MediaItem = BaseMedia & (Movie | TvShow);

interface MediaDetailPageProps {
  type: MediaType;
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
          const mediaWithProxiedCover = {
            ...result,
            cover: getCoverUrl(result.cover)
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

  const isCorrectMediaType =
    (type === 'movie' && isMovie(media)) ||
    (type === 'tvshow' && isTvShow(media));

  if (!isCorrectMediaType) {
    console.warn(`媒体类型不匹配: URL请求类型为${type}，但获取到的数据类型为${isMovie(media) ? 'movie' : 'tvshow'}`);
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
              <MediaInfo media={media} />
              
              <Divider sx={{ mx: 3, my: 2 }} />

              <Box sx={{ px: 3, pb: 3 }}>
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