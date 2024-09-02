import { type SpotifyApi, type PlaybackState, type Track, type Episode } from "@spotify/web-api-ts-sdk";

import { useSpotifyFetcher, CURRENT_TRACK_KEY } from "../../utils/spotifyFetcher";

interface CoverProps {
  spotifyApi: SpotifyApi;
}

export const Cover: React.FC<CoverProps> = ({ spotifyApi }) => {
  const {
    data: currentTrack,
    error,
    isLoading,
  } = useSpotifyFetcher(spotifyApi, CURRENT_TRACK_KEY, api => api.player.getCurrentlyPlayingTrack());

  if (error) {
    console.error(error);
    return null;
  }

  return (
    <div className="flex justify-center">
      {currentTrack ? (
        <img
          className="w-1/2 max-w-sm"
          src={getCoverUrl(currentTrack)}
          alt={currentTrack.item.name}
        />
      ) : (
        <CoverPlaceHolder text={isLoading ? "Loading..." : "No track is playing"} />
      )}
    </div>
  );
};

const getCoverUrl = (currentTrack: PlaybackState) => {
  if (currentTrack.currently_playing_type === "track") {
    const item = currentTrack.item as Track;
    return item.album.images[0].url;
  } else {
    const item = currentTrack.item as Episode;
    return item.images[0].url;
  }
};

const CoverPlaceHolder: React.FC<{ text: string }> = ({ text }) => (
  <div className="w-1/2 max-w-sm h-1/2 max-h-sm">{text}</div>
);
