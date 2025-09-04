import React from 'react';
import DownloadLinksBase from '../DownloadLinksBase';
import TvShowEpisodeList from '../TvShowEpisodeList';
import { TvShow } from '../../types';

interface TvShowDownloadLinksProps {
  tvShow: TvShow;
  clipboard: {
    copyText: (text: string) => void;
    showMessage: (message: string, success?: boolean) => void;
  };
}

const TvShowDownloadLinks: React.FC<TvShowDownloadLinksProps> = ({ tvShow, clipboard }) => {
  return (
    <DownloadLinksBase
      title="剧集下载"
      downloadLink={tvShow.download_link}
      clipboard={clipboard}
    >
      {(activeSource) => (
        <TvShowEpisodeList
          episodes={tvShow.download_link[activeSource] || []}
          onCopyText={clipboard.copyText}
          onShowMessage={clipboard.showMessage}
        />
      )}
    </DownloadLinksBase>
  );
};

export default TvShowDownloadLinks; 