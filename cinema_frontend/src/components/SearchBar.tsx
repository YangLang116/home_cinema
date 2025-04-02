import React, { useState, useEffect } from 'react';
import { TextField, InputAdornment, Box, useMediaQuery, useTheme } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { debounce } from 'lodash';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = '搜索...'
}) => {
  const [searchValue, setSearchValue] = useState(value);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // 使用防抖来减少请求频率
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedOnChange = React.useCallback(
    debounce((value: string) => {
      onChange(value);
    }, 500),
    [onChange]
  );

  useEffect(() => {
    debouncedOnChange(searchValue);
  }, [searchValue, debouncedOnChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleClear = () => {
    setSearchValue('');
    onChange('');
  };

  return (
    <Box sx={{ width: '100%', mb: 3 }}>
      <TextField
        fullWidth
        value={searchValue}
        onChange={handleChange}
        placeholder={placeholder}
        variant="outlined"
        size={isMobile ? 'small' : 'medium'}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="primary" />
            </InputAdornment>
          ),
          endAdornment: searchValue ? (
            <InputAdornment position="end">
              <ClearIcon
                color="action"
                sx={{ cursor: 'pointer' }}
                onClick={handleClear}
              />
            </InputAdornment>
          ) : null,
          sx: {
            borderRadius: '20px',
            bgcolor: 'background.paper',
            '&:hover': {
              boxShadow: '0 0 8px rgba(0, 180, 216, 0.5)',
            },
            '&.Mui-focused': {
              boxShadow: '0 0 8px rgba(0, 180, 216, 0.8)',
            },
          },
        }}
      />
    </Box>
  );
};

export default SearchBar; 