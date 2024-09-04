import { useEffect, useState } from "react";
import { type SpotifyApi, type PlaybackState, type Track } from "@spotify/web-api-ts-sdk";

import { useSpotifyFetcher, CURRENT_TRACK_KEY } from "../../utils/spotifyFetcher";
import ShareIcon from "../../assets/share.svg?react";

interface ShareProps {
  spotifyApi: SpotifyApi;
}

export const Share: React.FC<ShareProps> = ({ spotifyApi }) => {
  const {
    data: currentTrack,
    error,
    isLoading,
  } = useSpotifyFetcher(spotifyApi, CURRENT_TRACK_KEY, api => api.player.getCurrentlyPlayingTrack());
  const [text, setText] = useState("");
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value);

  useEffect(() => {
    if (currentTrack) {
      setText(buildShareText(currentTrack, "album"));
    }
  }, [currentTrack]);

  if (isLoading || !currentTrack) {
    return null;
  }
  if (error) {
    console.error(error);
    return null;
  }

  const isShareSupported = "share" in navigator;

  return (
    <div className="flex gap-4 items-center">
      <textarea
        className="h-24 leading-6 p-2 border rounded border-gray-400"
        value={text}
        onChange={onChange}
      />
      <button
        className="w-fit h-fit"
        disabled={!isShareSupported}
        onClick={() => share(currentTrack, text, "album")}
      >
        <ShareIcon className="w-10 h-10" />
      </button>
    </div>
  );
};

type ShareType = "track" | "album";

const buildShareText = (currentTrack: PlaybackState, type: ShareType) => {
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

const share = async (currentTrack: PlaybackState, text: string, type: ShareType) => {
  try {
    const shareData = {
      // title,
      text,
      url: getShareUrl(currentTrack, type) || undefined,
    };
    // console.log(shareData);
    await navigator.share(shareData);
  } catch (e) {
    if (!(e instanceof DOMException) || e.name !== "AbortError") {
      console.error(e);
    }
  }
};
