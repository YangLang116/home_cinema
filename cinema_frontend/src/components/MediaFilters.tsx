import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Stack,
  Box,
  Divider
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  Star as StarIcon,
  Public as PublicIcon,
  Category as CategoryIcon,
  SortByAlpha as SortIcon
} from '@mui/icons-material';
import { SortConfig, AreaConfig, CategoryConfig } from '../types';

interface MediaFiltersProps {
  sortConfig: SortConfig;
  onSortChange: (config: Partial<SortConfig>) => void;
  areaConfig: AreaConfig;
  onAreaChange: (config: Partial<AreaConfig>) => void;
  areas: string[];
  areasLoading: boolean;
  categoryConfig: CategoryConfig;
  onCategoryChange: (config: Partial<CategoryConfig>) => void;
  categories: string[];
  categoriesLoading: boolean;
}

const MediaFilters: React.FC<MediaFiltersProps> = ({
  sortConfig,
  onSortChange,
  areaConfig,
  onAreaChange,
  areas,
  areasLoading,
  categoryConfig,
  onCategoryChange,
  categories,
  categoriesLoading
}) => {
  const handleSortByChange = (event: SelectChangeEvent) => {
    const newValue = event.target.value as 'time' | 'score';
    if (newValue !== sortConfig.sort_by) {
      onSortChange({ sort_by: newValue });
    }
  };

  const handleSortOrderChange = (event: SelectChangeEvent) => {
    const newValue = event.target.value as 'asc' | 'desc';
    if (newValue !== sortConfig.sort_order) {
      onSortChange({ sort_order: newValue });
    }
  };

  const handleAreaChange = (event: SelectChangeEvent) => {
    const newValue = event.target.value;
    if (newValue !== areaConfig.area) {
      onAreaChange({ area: newValue });
    }
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    const newValue = event.target.value;
    if (newValue !== categoryConfig.category) {
      onCategoryChange({ category: newValue });
    }
  };

  return (
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
          <InputLabel>排序类型</InputLabel>
          <Select
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
          <InputLabel>排序方向</InputLabel>
          <Select
            value={sortConfig.sort_order}
            onChange={handleSortOrderChange}
            label="排序方向"
            startAdornment={<SortIcon sx={{ mr: 1, color: 'primary.main' }} />}
          >
            <MenuItem value="desc">降序</MenuItem>
            <MenuItem value="asc">升序</MenuItem>
          </Select>
        </FormControl>

        <FormControl variant="outlined" size="small">
          <InputLabel>地区</InputLabel>
          <Select
            value={areaConfig.area}
            onChange={handleAreaChange}
            label="地区"
            startAdornment={<PublicIcon sx={{ mr: 1, color: 'primary.main' }} />}
            disabled={areasLoading}
            displayEmpty
            renderValue={(selected) => selected || '全部'}
            MenuProps={{
              PaperProps: {
                style: { maxHeight: 400 }
              }
            }}
          >
            <MenuItem value="" sx={{ 
              fontWeight: !areaConfig.area ? 'bold' : 'normal',
              bgcolor: !areaConfig.area ? 'rgba(0, 180, 216, 0.08)' : 'inherit'
            }}>
              全部
            </MenuItem>
            <Divider />
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

        <FormControl variant="outlined" size="small">
          <InputLabel>类别</InputLabel>
          <Select
            value={categoryConfig.category}
            onChange={handleCategoryChange}
            label="类别"
            startAdornment={<CategoryIcon sx={{ mr: 1, color: 'primary.main' }} />}
            disabled={categoriesLoading}
            displayEmpty
            renderValue={(selected) => selected || '全部'}
            MenuProps={{
              PaperProps: {
                style: { maxHeight: 400 }
              }
            }}
          >
            <MenuItem value="" sx={{ 
              fontWeight: !categoryConfig.category ? 'bold' : 'normal',
              bgcolor: !categoryConfig.category ? 'rgba(0, 180, 216, 0.08)' : 'inherit'
            }}>
              全部
            </MenuItem>
            <Divider />
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
  );
};

export default MediaFilters;
