import React from 'react';
import { Box, Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import DownloadLinksBase from '../DownloadLinksBase';
import { Movie } from '../../types';

interface MovieDownloadLinksProps {
  movie: Movie;
  clipboard: {
    copyText: (text: string) => void;
    showMessage: (message: string, success?: boolean) => void;
  };
}

const MovieDownloadLinks: React.FC<MovieDownloadLinksProps> = ({ movie, clipboard }) => {
  const { copyText, showMessage } = clipboard;

  const handleCopyLink = (activeSource: string) => {
    const link = movie.download_link[activeSource];
    copyText(link);
    showMessage('下载链接已复制到剪贴板');
  };

  return (
    <DownloadLinksBase
      title="下载链接"
      downloadLink={movie.download_link}
      clipboard={clipboard}
    >
      {(activeSource) => (
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={() => handleCopyLink(activeSource)}
            sx={{ borderRadius: 2 }}
          >
            复制下载链接
          </Button>
        </Box>
      )}
    </DownloadLinksBase>
  );
};

export default MovieDownloadLinks; 