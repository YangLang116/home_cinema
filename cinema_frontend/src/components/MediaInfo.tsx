import React from 'react';
import { Box, Typography, Chip, Rating } from '@mui/material';
import { GridContainer, GridItem } from './GridWrapper';
import { BaseMedia } from '../types';

interface MediaInfoProps {
  media: BaseMedia;
}

const MediaInfo: React.FC<MediaInfoProps> = ({ media }) => {
  const categories = media.category ? media.category.split(',').map(cat => cat.trim()) : [];

  return (
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

      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        剧情简介
      </Typography>
      <Typography variant="body1" paragraph>
        {media.summary || '暂无简介'}
      </Typography>
    </Box>
  );
};

export default MediaInfo;
