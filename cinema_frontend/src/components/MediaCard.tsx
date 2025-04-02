import React, { useState } from 'react';
import { Card, CardContent, CardMedia, Typography, Box, Rating, Chip, useMediaQuery, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Movie, TvShow, MediaType } from '../types';

interface MediaCardProps {
  media: Movie | TvShow;
  type: MediaType;
}

const DEFAULT_COVER = '/default-cover.svg';

const MediaCard: React.FC<MediaCardProps> = ({ media, type }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [imageError, setImageError] = useState(false);

  // 点击卡片时导航到详情页，并将媒体数据作为state传递
  const handleClick = () => {
    navigate(`/${type}/${encodeURIComponent(media.name)}`, { 
      state: { media } 
    });
  };

  // 将分类字符串转换为数组
  const categories = media.category ? media.category.split(',').map(cat => cat.trim()).filter(cat => cat) : [];

  // 检查是否有必要的属性
  const hasRequiredProps = media.name;
  if (!hasRequiredProps) {
    console.error('媒体数据缺少必要属性:', media);
    return null;
  }

  // 处理图片加载错误
  const handleImageError = () => {
    setImageError(true);
  };

  // 获取封面图片地址，优先使用媒体封面，如果为空或加载失败则使用缺省图
  const coverImage = (!media.cover || imageError) ? DEFAULT_COVER : media.cover;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        position: 'relative',
        border: '1px solid #333',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-10px)',
          boxShadow: '0 10px 20px rgba(0, 180, 216, 0.3)',
          '& .media-card-content': {
            opacity: 1,
          },
        },
      }}
      onClick={handleClick}
    >
      <Box sx={{ position: 'relative', paddingTop: '150%' }}>
        <CardMedia
          component="img"
          image={coverImage}
          alt={media.name}
          onError={handleImageError}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        <Box
          className="media-card-content"
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: 'rgba(0, 0, 0, 0.8)',
            p: isMobile ? 0.8 : 1.5,
            opacity: 0,
            transition: 'opacity 0.3s ease',
          }}
        >
          <Typography 
            variant="body2" 
            color="text.secondary" 
            gutterBottom
            sx={{ fontSize: isMobile ? '0.7rem' : 'inherit' }}
          >
            {media.release_date || '未知日期'} {media.duration ? `| ${media.duration}` : '| 未知时长'}
          </Typography>
          <Rating
            value={media.score ? media.score / 2 : 0}
            precision={0.5}
            readOnly
            size="small"
            sx={{ mb: 1 }}
          />
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ mb: 1, fontSize: isMobile ? '0.7rem' : 'inherit' }}
          >
            {media.area || '未知地区'} {media.language ? `| ${media.language}` : '| 未知语言'}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            {categories.length > 0 ? (
              categories.slice(0, isMobile ? 1 : 2).map((category) => (
                <Chip
                  key={category}
                  label={category}
                  size="small"
                  sx={{ 
                    bgcolor: 'rgba(0, 180, 216, 0.2)', 
                    fontSize: isMobile ? '0.6rem' : '0.7rem',
                    height: isMobile ? 20 : 24
                  }}
                />
              ))
            ) : (
              <Chip
                label="未分类"
                size="small"
                sx={{ 
                  bgcolor: 'rgba(0, 180, 216, 0.2)', 
                  fontSize: isMobile ? '0.6rem' : '0.7rem',
                  height: isMobile ? 20 : 24
                }}
              />
            )}
          </Box>
        </Box>
      </Box>
      <CardContent sx={{ flexGrow: 1, p: isMobile ? 1 : 1.5 }}>
        <Typography
          gutterBottom
          variant={isMobile ? 'subtitle2' : 'h6'}
          component="div"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontWeight: 'bold',
            fontSize: isMobile ? '0.8rem' : 'inherit'
          }}
        >
          {media.name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            fontSize: isMobile ? '0.7rem' : 'inherit'
          }}
        >
          {media.director ? `导演: ${media.director}` : '导演: 未知'}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default MediaCard; 