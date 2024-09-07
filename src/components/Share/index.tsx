import { useEffect, useState } from "react";
import { type SpotifyApi, type PlaybackState, type Track } from "@spotify/web-api-ts-sdk";
import { clsx } from "clsx";

import { useSpotifyFetcher, CURRENT_TRACK_KEY } from "../../utils/spotifyFetcher";
import ShareIcon from "../../assets/share.svg?react";

type ShareType = "track" | "album";

interface ShareProps {
  spotifyApi: SpotifyApi;
  className?: string;
  type: ShareType;
  outerRef: React.RefObject<HTMLDivElement>;
}

export const Share: React.FC<ShareProps> = ({ spotifyApi, className, type, outerRef }) => {
  const {
    data: currentTrack,
    error,
    isLoading,
  } = useSpotifyFetcher(spotifyApi, CURRENT_TRACK_KEY, api => api.player.getCurrentlyPlayingTrack());
  const [text, setText] = useState("");
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value);

  useEffect(() => {
    if (currentTrack) {
      setText(buildDefaultShareText(currentTrack, type));
    }
  }, [currentTrack, type]);

  if (isLoading || !currentTrack) {
    return null;
  }
  if (error) {
    console.error(error);
    return null;
  }

  const isShareSupported = "share" in navigator;

  return (
    <div
      className={clsx("flex", "gap-4", "items-center", className)}
      ref={outerRef}
    >
      <textarea
        className="h-24 leading-6 p-2 border rounded border-gray-400"
        value={text}
        onChange={onChange}
      />
      <button
        className="w-fit h-fit"
        disabled={!isShareSupported}
        onClick={() => share(currentTrack, text, type)}
      >
        <ShareIcon className="w-10 h-10" />
      </button>
    </div>
  );
};

const buildDefaultShareText = (currentTrack: PlaybackState, type: ShareType) => {
  if (currentTrack.currently_playing_type !== "track") {
    return "Not playing a track.";
  }

  const item = currentTrack.item as Track;
  const artists = item.album.artists.map(artist => artist.name).join(", ");

  return type === "track" ? `${artists} - ${item.name} #np` : `${artists} - ${item.album.name} #np`;
};

const getShareUrl = (currentTrack: PlaybackState, type: ShareType) => {
  if (currentTrack.currently_playing_type !== "track") {
    return null;
  }

  const item = currentTrack.item as Track;
  return type === "track" ? item.external_urls.spotify : item.album.external_urls.spotify;
};

const share = async (currentTrack: PlaybackState, textareaText: string, type: ShareType) => {
  // Chrome (Android): `text` is concatination of `url` and `text`(?)
  // Firefox (Android): `text` is not supported. https://caniuse.com/mdn-api_navigator_share_data_text_parameter
  const shareUrl = getShareUrl(currentTrack, type) || undefined;
  const shareText = shareUrl ? `${textareaText}\n${shareUrl}` : textareaText;
  const shareOpt = {
    // title:
    text: shareText,
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
