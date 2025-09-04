import React, { useState } from 'react';
import {
  Box,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  IconButton,
  Tooltip,
  FormControlLabel
} from '@mui/material';
import {
  Download as DownloadIcon,
  ContentCopy as ContentCopyIcon,
  SelectAll as SelectAllIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';

interface Episode {
  name: string;
  link: string;
}

interface TvShowEpisodeListProps {
  episodes: Episode[];
  onCopyText: (text: string) => void;
  onShowMessage: (message: string, success?: boolean) => void;
}

function groupEpisodes(episodes: Episode[]) {
  const groups: Record<string, Episode[]> = {};

  episodes.forEach(episode => {
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

const TvShowEpisodeList: React.FC<TvShowEpisodeListProps> = ({
  episodes,
  onCopyText,
  onShowMessage
}) => {
  const [selectedEpisodes, setSelectedEpisodes] = useState<Record<string, boolean>>({});
  const [selectionMode, setSelectionMode] = useState(false);

  const handleToggleEpisode = (episodeId: string) => {
    setSelectedEpisodes(prev => ({
      ...prev,
      [episodeId]: !prev[episodeId]
    }));
  };

  const handleToggleSeason = (seasonEpisodes: Episode[]) => {
    const episodeIds = seasonEpisodes.map(ep => ep.link);
    const allSelected = episodeIds.every(id => selectedEpisodes[id]);

    const newSelectedEpisodes = { ...selectedEpisodes };
    episodeIds.forEach(id => {
      newSelectedEpisodes[id] = !allSelected;
    });

    setSelectedEpisodes(newSelectedEpisodes);
  };

  const handleSelectAll = () => {
    const episodeIds = episodes.map(ep => ep.link);
    const allSelected = episodeIds.every(id => selectedEpisodes[id]);

    const newSelectedEpisodes: Record<string, boolean> = {};
    episodeIds.forEach(id => {
      newSelectedEpisodes[id] = !allSelected;
    });

    setSelectedEpisodes(newSelectedEpisodes);
  };

  const handleDownloadSelected = () => {
    const selectedLinks = episodes
      .filter(episode => selectedEpisodes[episode.link])
      .map(episode => episode.link)
      .join('\n');

    if (selectedLinks) {
      onCopyText(selectedLinks);
      onShowMessage(`已复制${Object.values(selectedEpisodes).filter(Boolean).length}个下载链接`);
    } else {
      onShowMessage('请先选择要下载的剧集', false);
    }
  };

  const handleCopyAllLinks = () => {
    const allLinks = episodes.map(episode => episode.link).join('\n');
    if (allLinks) {
      onCopyText(allLinks);
      onShowMessage('所有下载链接已复制到剪贴板');
    }
  };

  const getSelectedCount = () => {
    return Object.values(selectedEpisodes).filter(Boolean).length;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
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

      {episodes.length > 10 ? (
        Object.entries(groupEpisodes(episodes)).map(([season, seasonEpisodes]) => (
          <Accordion key={season} sx={{ mb: 1, bgcolor: 'rgba(0, 180, 216, 0.05)' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <span>{season} ({seasonEpisodes.length}集)</span>
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                  {selectionMode && (
                    <Checkbox
                      checked={seasonEpisodes.every(ep => selectedEpisodes[ep.link])}
                      indeterminate={
                        seasonEpisodes.some(ep => selectedEpisodes[ep.link]) &&
                        !seasonEpisodes.every(ep => selectedEpisodes[ep.link])
                      }
                      onChange={() => handleToggleSeason(seasonEpisodes)}
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
                          const seasonLinks = seasonEpisodes.map(episode => episode.link).join('\n');
                          onCopyText(seasonLinks);
                          onShowMessage(`${season}的下载链接已复制到剪贴板`);
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
                {seasonEpisodes.map((episode, index) => (
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
                      onClick={() => {
                        if (selectionMode) {
                          handleToggleEpisode(episode.link);
                        } else {
                          onCopyText(episode.link);
                          onShowMessage('下载链接已复制到剪贴板');
                        }
                      }}
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
                startIcon={<DownloadIcon />}
                onClick={() => {
                  if (selectionMode) {
                    handleToggleEpisode(episode.link);
                  } else {
                    onCopyText(episode.link);
                    onShowMessage('下载链接已复制到剪贴板');
                  }
                }}
                sx={{ borderRadius: 2, justifyContent: 'flex-start', flex: 1 }}
              >
                {episode.name}
              </Button>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default TvShowEpisodeList;
