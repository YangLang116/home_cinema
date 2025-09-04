import React, { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';

interface ClipboardActions {
  copyText: (text: string) => void;
  showMessage: (message: string, success?: boolean) => void;
}

interface DownloadLinksBaseProps {
  title: string;
  downloadLink: Record<string, any>;
  clipboard: ClipboardActions;
  children: (activeSource: string, sources: string[]) => React.ReactNode;
}

const DownloadLinksBase: React.FC<DownloadLinksBaseProps> = ({
  title,
  downloadLink,
  clipboard,
  children
}) => {
  const sources = Object.keys(downloadLink);
  const [activeSourceTab, setActiveSourceTab] = useState<string>(sources[0] || '');

  useEffect(() => {
    if (sources.length > 0 && !sources.includes(activeSourceTab)) {
      setActiveSourceTab(sources[0]);
    }
  }, [downloadLink, activeSourceTab, sources]);

  const handleSourceTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setActiveSourceTab(newValue);
  };

  if (sources.length === 0) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          {title}
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
        {title}
      </Typography>

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

      {activeSourceTab && children(activeSourceTab, sources)}
    </Box>
  );
};

export default DownloadLinksBase;
