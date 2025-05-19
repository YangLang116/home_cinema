import React, { useState } from 'react';
import { Box, CardMedia, CircularProgress } from '@mui/material';
import { BaseMedia } from '../../types';

// 缺省封面图片地址
const DEFAULT_COVER = '/default-cover.svg';

interface MediaCoverProps {
  media: BaseMedia;
}

const MediaCover: React.FC<MediaCoverProps> = ({ media }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // 处理图片加载完成
  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // 处理图片加载错误
  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  return (
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'rgba(0, 0, 0, 0.03)'
      }}
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
            zIndex: 0
          }}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
    </Box>
  );
};

export default MediaCover; 