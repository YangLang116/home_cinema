import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardMedia,
  Chip,
  Rating,
  Divider,
  Button,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Modal,
  IconButton,
  Fade,
  Tooltip,
  Snackbar,
  Alert,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import SourceIcon from '@mui/icons-material/Source';
import { Movie, TvShow, MediaType } from '../types';
import { getProxiedCoverUrl, getMovieDetail, getTvShowDetail } from '../services/api';
import { GridContainer, GridItem } from '../components/GridWrapper';
import ClipboardJS from 'clipboard';

// 缺省封面图片地址
const DEFAULT_COVER = '/default-cover.svg';

interface MediaDetailPageProps {
  type: MediaType;
}

// 判断是否为电影类型
function isMovie(media: Movie | TvShow): media is Movie {
  return typeof (media as Movie).download_link === 'string';
}

// 判断是否为电视剧类型
function isTvShow(media: Movie | TvShow): media is TvShow {
  return Array.isArray((media as TvShow).download_link);
}

// 将剧集分组（例如按季）
function groupEpisodes(episodes: { name: string; link: string }[]) {
  const groups: Record<string, { name: string; link: string }[]> = {};

  episodes.forEach(episode => {
    // 尝试从名称中提取季信息（例如 S01E01, 第1季第1集, 等）
    const seasonRegex = /[sS](\d+)|第(\d+)季/;
    const match = episode.name.match(seasonRegex);

    let season = '剧集';
    if (match) {
      season = `第${match[1] || match[2]}季`;
    }

    if (!groups[season]) {
      groups[season] = [];
    }

    groups[season].push(episode);
  });

  return groups;
}

const MediaDetailPage: React.FC<MediaDetailPageProps> = ({ type }) => {
  const { id } = useParams<{ id: string }>();
  const [media, setMedia] = useState<Movie | TvShow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openFullImage, setOpenFullImage] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [selectedEpisodes, setSelectedEpisodes] = useState<Record<string, boolean>>({});
  const [selectionMode, setSelectionMode] = useState(false);

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

  // 用于存储 ClipboardJS 实例
  const clipboardRef = useRef<ClipboardJS | null>(null);

  useEffect(() => {
    return () => {
      // 组件卸载时销毁 ClipboardJS 实例
      clipboardRef.current?.destroy();
    };
  }, []);

  // 处理选择/取消选择单个剧集
  const handleToggleEpisode = (episodeId: string) => {
    setSelectedEpisodes(prev => ({
      ...prev,
      [episodeId]: !prev[episodeId]
    }));
  };

  // 处理选择/取消选择整季剧集
  const handleToggleSeason = (episodes: { name: string; link: string }[]) => {
    const episodeIds = episodes.map(ep => ep.link); // 使用链接作为ID
    const allSelected = episodeIds.every(id => selectedEpisodes[id]);

    const newSelectedEpisodes = { ...selectedEpisodes };

    // 如果全部已选中，则取消全部；否则选中全部
    episodeIds.forEach(id => {
      newSelectedEpisodes[id] = !allSelected;
    });

    setSelectedEpisodes(newSelectedEpisodes);
  };

  // 全选/取消全选
  const handleSelectAll = () => {
    if (!media || !isTvShow(media)) return;

    const allEpisodeIds = media.download_link.map(ep => ep.link);
    const allSelected = allEpisodeIds.every(id => selectedEpisodes[id]);

    const newSelectedEpisodes: Record<string, boolean> = {};

    // 如果全部已选中，则取消全部；否则选中全部
    allEpisodeIds.forEach(id => {
      newSelectedEpisodes[id] = !allSelected;
    });

    setSelectedEpisodes(newSelectedEpisodes);
  };

  // 下载选中的剧集
  const handleDownloadSelected = () => {
    if (!media || !isTvShow(media)) return;

    const selectedLinks = media.download_link
      .filter(episode => selectedEpisodes[episode.link])
      .map(episode => episode.link)
      .join('\n');

    if (selectedLinks) {
      copyText(selectedLinks);
      showSnackbar(`已复制${Object.values(selectedEpisodes).filter(Boolean).length}个下载链接`, 'success');
    } else {
      showSnackbar('请先选择要下载的剧集', 'error');
    }
  };

  // 获取已选择的剧集数量
  const getSelectedCount = () => {
    return Object.values(selectedEpisodes).filter(Boolean).length;
  };

  // 复制所有下载链接
  const handleCopyAllLinks = () => {
    if (!media) return;
    let allLinks = '';
    if (isMovie(media)) {
      // 电影只有一个下载链接
      allLinks = media.download_link;
    } else if (isTvShow(media)) {
      // 电视剧有多个下载链接，每行一个链接，不包含集数名称
      allLinks = media.download_link
        .map(episode => episode.link)
        .join('\n');
    }
    if (allLinks) {
      copyText(allLinks);
    }
  };

  // 封装复制逻辑
  const copyText = (text: string) => {
    const fakeButton = document.createElement('button');
    clipboardRef.current = new ClipboardJS(fakeButton, {
      text: () => text
    });

    clipboardRef.current.on('success', () => {
      showSnackbar('下载链接已复制到剪贴板', 'success');
      clipboardRef.current?.destroy();
    });

    clipboardRef.current.on('error', () => {
      showSnackbar('复制失败，请手动复制链接', 'error');
      clipboardRef.current?.destroy();
    });

    // 触发复制操作
    fakeButton.click();
  };

  // 显示通知消息
  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // 关闭通知
  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  // 打开封面全屏预览
  const handleOpenFullImage = () => {
    if (!imageError && !imageLoading) {
      // 预加载图片，防止闪屏
      const img = new Image();
      img.src = media?.cover || '';
      img.onload = () => {
        setOpenFullImage(true);
      };
      // 如果图片已经加载过，直接显示
      if (img.complete) {
        setOpenFullImage(true);
      }
    }
  };

  // 关闭封面全屏预览
  const handleCloseFullImage = () => {
    setOpenFullImage(false);
  };

  // 处理图片加载完成
  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // 处理图片加载错误
  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
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
              <Box
                className="cover-container"
                sx={{
                  position: 'relative',
                  height: 'auto',
                  aspectRatio: '2/3',
                  borderRadius: 1,
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  m: { xs: 2, sm: 2, md: 2 },
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(0, 0, 0, 0.03)',
                  cursor: !imageError && !imageLoading ? 'pointer' : 'default',
                  '&:hover': !imageError && !imageLoading ? {
                    transform: 'scale(1.02)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                    '& .hover-overlay': {
                      opacity: 1
                    },
                    '& .fullscreen-icon': {
                      opacity: 1
                    },
                    '& .fullscreen-text': {
                      opacity: 1
                    }
                  } : {}
                }}
                onClick={!imageError && !imageLoading ? handleOpenFullImage : undefined}
              >
                {imageLoading && (
                  <Box sx={{
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    zIndex: 0
                  }}>
                    <CircularProgress size={40} />
                  </Box>
                )}
                {imageError ? (
                  <CardMedia
                    component="img"
                    image={DEFAULT_COVER}
                    alt={media.name}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      zIndex: 0
                    }}
                  />
                ) : (
                  <CardMedia
                    component="img"
                    image={media.cover || DEFAULT_COVER}
                    alt={media.name}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      zIndex: 0,
                      transition: 'all 0.3s ease',
                    }}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                  />
                )}

                {/* 只在非错误、非加载状态下显示悬浮效果 */}
                {!imageError && !imageLoading && (
                  <>
                    {/* 添加悬浮效果叠加层 */}
                    <Box
                      className="hover-overlay"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 60%)',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                        zIndex: 1,
                        pointerEvents: 'none', // 确保点击事件可以穿透到下层
                      }}
                    />
                    {/* 全屏查看提示文字 */}
                    <Box
                      className="fullscreen-text"
                      sx={{
                        position: 'absolute',
                        bottom: 48,
                        left: 0,
                        width: '100%',
                        textAlign: 'center',
                        color: 'white',
                        opacity: 0,
                        zIndex: 2,
                        pointerEvents: 'none',
                        transition: 'opacity 0.3s ease',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        textShadow: '0 1px 3px rgba(0,0,0,0.7)',
                      }}
                    >
                      点击查看大图
                    </Box>
                    <IconButton
                      className="fullscreen-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenFullImage();
                      }}
                      sx={{
                        position: 'absolute',
                        right: 8,
                        bottom: 8,
                        color: 'white',
                        bgcolor: 'rgba(0, 0, 0, 0.5)',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                        zIndex: 2,
                        '&:hover': {
                          bgcolor: 'rgba(0, 0, 0, 0.7)',
                        }
                      }}
                      aria-label="全屏查看"
                    >
                      <FullscreenIcon />
                    </IconButton>
                  </>
                )}
              </Box>
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
                  <GridItem xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                      <SourceIcon fontSize="small" sx={{ mr: 0.5, color: 'primary.main', opacity: 0.8 }} />
                      来源: {media.source || '未知'}
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

                {/* 下载按钮 */}
                <Box sx={{ mt: 3 }}>
                  {isMovie(media) ? (
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<DownloadIcon />}
                        onClick={() => copyText(media.download_link)}
                        sx={{ borderRadius: 2 }}
                      >
                        复制下载链接
                      </Button>
                    </Box>
                  ) : isTvShow(media) ? (
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                          剧集下载
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={selectionMode}
                                onChange={() => setSelectionMode(!selectionMode)}
                                color="primary"
                                size="small"
                              />
                            }
                            label="多选模式"
                          />
                          {selectionMode && (
                            <>
                              <Tooltip title="全选/取消全选">
                                <Button
                                  variant="outlined"
                                  color="primary"
                                  size="small"
                                  startIcon={<SelectAllIcon />}
                                  onClick={handleSelectAll}
                                  sx={{ borderRadius: 2 }}
                                >
                                  全选/取消
                                </Button>
                              </Tooltip>
                              <Tooltip title="复制选中的下载链接">
                                <Button
                                  variant="contained"
                                  color="primary"
                                  size="small"
                                  startIcon={<DownloadIcon />}
                                  onClick={handleDownloadSelected}
                                  disabled={getSelectedCount() === 0}
                                  sx={{ borderRadius: 2 }}
                                >
                                  下载选中({getSelectedCount()})
                                </Button>
                              </Tooltip>
                            </>
                          )}
                          {!selectionMode && (
                            <Tooltip title="复制所有下载链接">
                              <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                startIcon={<ContentCopyIcon />}
                                onClick={handleCopyAllLinks}
                                sx={{ borderRadius: 2 }}
                              >
                                一键复制全部
                              </Button>
                            </Tooltip>
                          )}
                        </Box>
                      </Box>

                      {media.download_link.length > 10 ? (
                        // 当剧集数量较多时，使用分组手风琴组件
                        Object.entries(groupEpisodes(media.download_link)).map(([season, episodes]) => (
                          <Accordion key={season} sx={{ mb: 1, bgcolor: 'rgba(0, 180, 216, 0.05)' }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                <Typography>{season} ({episodes.length}集)</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                                  {selectionMode && (
                                    <Checkbox
                                      checked={episodes.every(ep => selectedEpisodes[ep.link])}
                                      indeterminate={
                                        episodes.some(ep => selectedEpisodes[ep.link]) &&
                                        !episodes.every(ep => selectedEpisodes[ep.link])
                                      }
                                      onChange={() => handleToggleSeason(episodes)}
                                      onClick={(e) => e.stopPropagation()}
                                      size="small"
                                    />
                                  )}
                                  {!selectionMode && (
                                    <Tooltip title={`复制${season}所有链接`}>
                                      <IconButton
                                        size="small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const seasonLinks = episodes
                                            .map(episode => episode.link)
                                            .join('\n');
                                          copyText(seasonLinks);
                                        }}
                                      >
                                        <ContentCopyIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </Box>
                              </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 1 }}>
                                {episodes.map((episode, index) => (
                                  <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                                    {selectionMode && (
                                      <Checkbox
                                        checked={!!selectedEpisodes[episode.link]}
                                        onChange={() => handleToggleEpisode(episode.link)}
                                        size="small"
                                      />
                                    )}
                                    <Button
                                      variant="outlined"
                                      color="primary"
                                      size="small"
                                      startIcon={<DownloadIcon />}
                                      onClick={() => selectionMode ? handleToggleEpisode(episode.link) : copyText(episode.link)}
                                      sx={{
                                        borderRadius: 2,
                                        justifyContent: 'flex-start',
                                        textAlign: 'left',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        flex: 1
                                      }}
                                    >
                                      {episode.name}
                                    </Button>
                                  </Box>
                                ))}
                              </Box>
                            </AccordionDetails>
                          </Accordion>
                        ))
                      ) : (
                        // 当剧集数量较少时，直接显示按钮列表
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {media.download_link.map((episode, index) => (
                            <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                              {selectionMode && (
                                <Checkbox
                                  checked={!!selectedEpisodes[episode.link]}
                                  onChange={() => handleToggleEpisode(episode.link)}
                                  size="small"
                                />
                              )}
                              <Button
                                variant="outlined"
                                color="primary"
                                startIcon={<DownloadIcon />}
                                onClick={() => selectionMode ? handleToggleEpisode(episode.link) : copyText(episode.link)}
                                sx={{ borderRadius: 2, justifyContent: 'flex-start', flex: 1 }}
                              >
                                {episode.name}
                              </Button>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
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

      {/* 封面全屏预览模态框 */}
      <Modal
        open={openFullImage}
        onClose={handleCloseFullImage}
        closeAfterTransition
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}
      >
        <Fade in={openFullImage} timeout={300}>
          <Box sx={{
            position: 'relative',
            maxWidth: '90vw',
            maxHeight: '90vh',
            outline: 'none',
            bgcolor: 'background.paper',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)'
          }}>
            <IconButton
              onClick={handleCloseFullImage}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                color: 'white',
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 10,
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.7)',
                }
              }}
            >
              <CloseIcon />
            </IconButton>
            <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
              <img
                src={media.cover || DEFAULT_COVER}
                alt={media.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: '80vh',
                  margin: 'auto',
                  display: 'block',
                  objectFit: 'contain'
                }}
              />
            </Box>
          </Box>
        </Fade>
      </Modal>

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