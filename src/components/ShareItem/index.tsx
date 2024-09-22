import { useEffect, useState } from "react";
import { type SpotifyApi, type PlaybackState, type Track } from "@spotify/web-api-ts-sdk";
import { clsx } from "clsx";

import { ShareType } from "../../types";
import { useSpotifyFetcher, CURRENT_TRACK_KEY } from "../../utils/spotifyFetcher";
import ShareIcon from "../../assets/share.svg?react";

interface ShareTexts {
  artist: string;
  title: string;
  url: string;
  hashtag: string;
}

interface ShareItemProps {
  spotifyApi: SpotifyApi;
  className?: string;
  type: ShareType;
  outerRef: React.RefObject<HTMLDivElement>;
}

export const ShareItem: React.FC<ShareItemProps> = ({ spotifyApi, className, type, outerRef }) => {
  const {
    data: currentTrack,
    error,
    isLoading,
  } = useSpotifyFetcher(spotifyApi, CURRENT_TRACK_KEY, api => api.player.getCurrentlyPlayingTrack());
  const [shareTexts, setShareTexts] = useState<ShareTexts | undefined>(undefined);

  useEffect(() => {
    if (currentTrack) {
      setShareTexts(getDefaultShareTexts(currentTrack, type));
    }
  }, [currentTrack, type]);

  const onArtistChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShareTexts(shareTexts ? { ...shareTexts, artist: e.target.value } : undefined);
  };
  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShareTexts(shareTexts ? { ...shareTexts, title: e.target.value } : undefined);
  };
  const onHashtagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShareTexts(shareTexts ? { ...shareTexts, hashtag: e.target.value } : undefined);
  };

  if (isLoading || !currentTrack) {
    return null;
  }
  if (error) {
    console.error(error);
    return null;
  }

  const isShareSupported = "share" in navigator;

  const inputClassName = "w-full text-sm px-2 py-1 border rounded-sm border-gray-400";
  return (
    <div
      className={clsx("flex", "flex-col", "gap-1", "items-center", className)}
      ref={outerRef}
    >
      <input
        className={inputClassName}
        value={shareTexts?.artist || ""}
        onChange={onArtistChange}
      />
      <input
        className={inputClassName}
        value={shareTexts?.title || ""}
        onChange={onTitleChange}
      />
      <input
        className={clsx(inputClassName, "bg-gray-200")}
        value={shareTexts?.url || ""}
        readOnly
      />
      <input
        className={inputClassName}
        value={shareTexts?.hashtag || ""}
        onChange={onHashtagChange}
      />
      <button
        className="w-fit h-fit p-2"
        disabled={!isShareSupported || !shareTexts}
        onClick={() => share(shareTexts!)}
      >
        <ShareIcon className="w-10 h-10" />
      </button>
    </div>
  );
};

const getDefaultShareTexts = (currentTrack: PlaybackState, type: ShareType): ShareTexts | undefined => {
  if (currentTrack.currently_playing_type !== "track") {
    return undefined;
  }
  const item = currentTrack.item as Track;

  return {
    artist: item.album.artists.map(artist => artist.name).join(", "),
    title: type === "track" ? item.name : item.album.name,
    url: getShareUrl(currentTrack, type),
    hashtag: "#np",
  };
};

const getShareUrl = (currentTrack: PlaybackState, type: ShareType) => {
  const item = currentTrack.item as Track;
  return type === "album" ? item.album.external_urls.spotify : item.external_urls.spotify;
};

const share = async (shareTexts: ShareTexts) => {
  const text = `${shareTexts.artist} - ${shareTexts.title} ${shareTexts.hashtag}\n${shareTexts.url}`;

  // Chrome (Android): `text` is concatination of `url` and `text`(?)
  // Firefox (Android): `text` is not supported. https://caniuse.com/mdn-api_navigator_share_data_text_parameter
  const shareOpt = {
    // title:
    text,
    // url:
  };
  // console.log(shareOpt);

  try {
    await navigator.share(shareOpt);
  } catch (e) {
    if (!(e instanceof DOMException) || e.name !== "AbortError") {
      console.error(e);
    }
  }
};
