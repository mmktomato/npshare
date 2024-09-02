import { useState } from "react";
import { type SpotifyApi, type PlaybackState, type Track } from "@spotify/web-api-ts-sdk";

import { useSpotifyFetcher, CURRENT_TRACK_KEY } from "../../utils/spotifyFetcher";

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
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setText(e.target.value);

  if (isLoading || !currentTrack) {
    return null;
  }
  if (error) {
    console.error(error);
    return null;
  }

  const isShareSupported = "share" in navigator;

  return (
    <div>
      <input
        value={buildShareText(currentTrack, "album")}
        onChange={onChange}
      />
      <button
        disabled={!isShareSupported}
        onClick={() => share(currentTrack, text, "album")}
      >
        Share
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
    await navigator.share({
      // title,
      text,
      url: getShareUrl(currentTrack, type) || undefined,
    });
  } catch (e) {
    if (!(e instanceof DOMException) || e.name !== "AbortError") {
      console.error(e);
    }
  }
};
