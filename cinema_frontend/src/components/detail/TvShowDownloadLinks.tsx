import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  IconButton,
  Tooltip,
  FormControlLabel
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LinkIcon from '@mui/icons-material/Link';
import { TvShow } from '../../types';

interface TvShowDownloadLinksProps {
  tvShow: TvShow;
  clipboard: {
    copyText: (text: string) => void;
    showMessage: (message: string, success?: boolean) => void;
  };
}

// 将剧集分组（例如按季）
function groupEpisodes(episodes: { name: string; link: string }[]) {
  const groups: Record<string, { name: string; link: string }[]> = {};

  episodes.forEach(episode => {
    // 尝试从名称中提取季信息（例如 S01E01, 第1季第1集, 等）
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

const TvShowDownloadLinks: React.FC<TvShowDownloadLinksProps> = ({ tvShow, clipboard }) => {
  // 初始化时直接设置第一个片源为选中状态
  const firstSource = Object.keys(tvShow.download_link)[0] || '';
  const [activeSourceTab, setActiveSourceTab] = useState<string>(firstSource);
  const [selectedEpisodes, setSelectedEpisodes] = useState<Record<string, boolean>>({});
  const [selectionMode, setSelectionMode] = useState(false);
  const { copyText, showMessage } = clipboard;

  // 当tvShow变化时，重新设置activeSourceTab
  useEffect(() => {
    const sources = Object.keys(tvShow.download_link);
    if (sources.length > 0 && !sources.includes(activeSourceTab)) {
      setActiveSourceTab(sources[0]);
    }
  }, [tvShow, activeSourceTab]);

  // 切换片源标签
  const handleSourceTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setActiveSourceTab(newValue);
    // 清空已选中的剧集
    setSelectedEpisodes({});
  };

  // 处理选择/取消选择单个剧集
  const handleToggleEpisode = (episodeId: string) => {
    setSelectedEpisodes(prev => ({
      ...prev,
      [episodeId]: !prev[episodeId]
    }));
  };

  // 处理选择/取消选择整季剧集
  const handleToggleSeason = (episodes: { name: string; link: string }[]) => {
    const episodeIds = episodes.map(ep => ep.link); // 使用链接作为ID
    const allSelected = episodeIds.every(id => selectedEpisodes[id]);

    const newSelectedEpisodes = { ...selectedEpisodes };

    // 如果全部已选中，则取消全部；否则选中全部
    episodeIds.forEach(id => {
      newSelectedEpisodes[id] = !allSelected;
    });

    setSelectedEpisodes(newSelectedEpisodes);
  };

  // 全选/取消全选
  const handleSelectAll = () => {
    if (!activeSourceTab) return;

    const episodes = tvShow.download_link[activeSourceTab] || [];
    const episodeIds = episodes.map((ep: { name: string; link: string }) => ep.link);
    const allSelected = episodeIds.every((id: string) => selectedEpisodes[id]);

    const newSelectedEpisodes: Record<string, boolean> = {};

    // 如果全部已选中，则取消全部；否则选中全部
    episodeIds.forEach((id: string) => {
      newSelectedEpisodes[id] = !allSelected;
    });

    setSelectedEpisodes(newSelectedEpisodes);
  };

  // 下载选中的剧集
  const handleDownloadSelected = () => {
    if (!activeSourceTab) return;

    const episodes = tvShow.download_link[activeSourceTab] || [];
    const selectedLinks = episodes
      .filter((episode: { name: string; link: string }) => selectedEpisodes[episode.link])
      .map((episode: { name: string; link: string }) => episode.link)
      .join('\n');

    if (selectedLinks) {
      copyText(selectedLinks);
      showMessage(`已复制${Object.values(selectedEpisodes).filter(Boolean).length}个下载链接`);
    } else {
      showMessage('请先选择要下载的剧集', false);
    }
  };

  // 获取已选择的剧集数量
  const getSelectedCount = () => {
    return Object.values(selectedEpisodes).filter(Boolean).length;
  };

  // 复制所有下载链接
  const handleCopyAllLinks = () => {
    if (!activeSourceTab) return;

    const episodes = tvShow.download_link[activeSourceTab] || [];
    const allLinks = episodes
      .map((episode: { name: string; link: string }) => episode.link)
      .join('\n');

    if (allLinks) {
      copyText(allLinks);
      showMessage('所有下载链接已复制到剪贴板');
    }
  };

  // 确保有可用的片源
  const sources = Object.keys(tvShow.download_link);
  if (sources.length === 0) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          剧集下载
        </Typography>
        <Typography color="error">
          暂无下载片源
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          剧集下载
        </Typography>
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
              {getSelectedCount() === 0 ? (
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<DownloadIcon />}
                  disabled={true}
                  sx={{ borderRadius: 2 }}
                >
                  下载选中(0)
                </Button>
              ) : (
                <Tooltip title="复制选中的下载链接">
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadSelected}
                    sx={{ borderRadius: 2 }}
                  >
                    下载选中({getSelectedCount()})
                  </Button>
                </Tooltip>
              )}
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

      {activeSourceTab && (
        <>
          {(tvShow.download_link[activeSourceTab]?.length || 0) > 10 ? (
            // 当剧集数量较多时，使用分组手风琴组件
            Object.entries(groupEpisodes(tvShow.download_link[activeSourceTab] || [])).map(([season, episodes]) => (
              <Accordion key={season} sx={{ mb: 1, bgcolor: 'rgba(0, 180, 216, 0.05)' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <Typography>{season} ({episodes.length}集)</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                      {selectionMode && (
                        <Checkbox
                          checked={episodes.every(ep => selectedEpisodes[ep.link])}
                          indeterminate={
                            episodes.some(ep => selectedEpisodes[ep.link]) &&
                            !episodes.every(ep => selectedEpisodes[ep.link])
                          }
                          onChange={() => handleToggleSeason(episodes)}
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
                              const seasonLinks = episodes
                                .map(episode => episode.link)
                                .join('\n');
                              copyText(seasonLinks);
                              showMessage(`${season}的下载链接已复制到剪贴板`);
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
                          size="small"
                          startIcon={<DownloadIcon />}
                          onClick={() => {
                            if (selectionMode) {
                              handleToggleEpisode(episode.link);
                            } else {
                              copyText(episode.link);
                              showMessage('下载链接已复制到剪贴板');
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
            // 当剧集数量较少时，直接显示按钮列表
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {(tvShow.download_link[activeSourceTab] || []).map((episode, index) => (
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
                        copyText(episode.link);
                        showMessage('下载链接已复制到剪贴板');
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
        </>
      )}
    </Box>
  );
};

export default TvShowDownloadLinks; 