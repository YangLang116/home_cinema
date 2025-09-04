import React, { useCallback } from 'react';
import { TextField, InputAdornment, IconButton, Box } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  placeholder?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onSubmit,
  onClear,
  placeholder = '搜索...'
}) => {
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  }, [onSubmit]);

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <TextField
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        variant="outlined"
        size="small"
        autoComplete="off"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: value && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={onClear}>
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
  );
};

export default SearchInput;
