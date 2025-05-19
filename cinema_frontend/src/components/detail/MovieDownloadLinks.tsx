import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Tabs, Tab } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import LinkIcon from '@mui/icons-material/Link';
import { Movie } from '../../types';

interface MovieDownloadLinksProps {
  movie: Movie;
  clipboard: {
    copyText: (text: string) => void;
    showMessage: (message: string, success?: boolean) => void;
  };
}

const MovieDownloadLinks: React.FC<MovieDownloadLinksProps> = ({ movie, clipboard }) => {
  // 初始化时直接设置第一个片源为选中状态
  const firstSource = Object.keys(movie.download_link)[0] || '';
  const [activeSourceTab, setActiveSourceTab] = useState<string>(firstSource);
  const { copyText, showMessage } = clipboard;

  // 当movie变化时，重新设置activeSourceTab
  useEffect(() => {
    const sources = Object.keys(movie.download_link);
    if (sources.length > 0 && !sources.includes(activeSourceTab)) {
      setActiveSourceTab(sources[0]);
    }
  }, [movie, activeSourceTab]);

  // 切换片源标签
  const handleSourceTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setActiveSourceTab(newValue);
  };

  // 复制下载链接
  const handleCopyLink = () => {
    if (!activeSourceTab) return;

    const link = movie.download_link[activeSourceTab];
    copyText(link);
    showMessage('下载链接已复制到剪贴板');
  };

  // 确保有可用的片源
  const sources = Object.keys(movie.download_link);
  if (sources.length === 0) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          下载链接
        </Typography>
        <Typography color="error">
          暂无下载片源
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        下载链接
      </Typography>

      {/* 片源选择标签 */}
      <Tabs
        value={activeSourceTab}
        onChange={handleSourceTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        {sources.map((source) => (
          <Tab
            key={source}
            label={source}
            value={source}
            icon={<LinkIcon sx={{ fontSize: '1rem' }} />}
            iconPosition="start"
            sx={{
              textTransform: 'none',
              minHeight: 48
            }}
          />
        ))}
      </Tabs>

      {/* 片源下载按钮 */}
      {activeSourceTab && (
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={handleCopyLink}
            sx={{ borderRadius: 2 }}
          >
            复制下载链接
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default MovieDownloadLinks; 