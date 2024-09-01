import { useEffect } from "react";
import useSwr from "swr";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

import styles from "./App.module.css";
import { useSpotify } from "./utils/spotify";

const useSpotifyFetcher = <T,>(spotify: SpotifyApi | null, key: string, fetcher: (api: SpotifyApi) => Promise<T>) => {
  return useSwr(spotify ? [key, spotify] : null, ([, spotify]) => {
    return fetcher(spotify);
  });
};

export const App = () => {
  const { spotifyApi, startAuthorization, handleAuthorizationCallback, isAuthenticated } = useSpotify();

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    if (code) {
      handleAuthorizationCallback();
    }
  }, [handleAuthorizationCallback]);

  const {
    data: user,
    error: userError,
    isLoading: isUserLoading,
  } = useSpotifyFetcher(spotifyApi, "currentUser", api => api.currentUser.profile());

  const {
    data: currentTrack,
    error: currentTrackError,
    isLoading: isCurrentTrackLoading,
  } = useSpotifyFetcher(spotifyApi, "currentTrack", api => api.player.getCurrentlyPlayingTrack());

  const onAuthClick = () => {
    startAuthorization();
  };

  if (!isAuthenticated) {
    return <button onClick={onAuthClick}>auth</button>;
  }

  return (
    <div className={styles.text}>
      {isUserLoading || isCurrentTrackLoading ? <div>loading...</div> : null}
      {userError || currentTrackError ? <div>ERROR</div> : null}
      {user ? <div>{user.display_name}</div> : null}
      {currentTrack ? (
        <div>
          {currentTrack.currently_playing_type} {currentTrack.item.name}
        </div>
      ) : (
        "No track playing"
      )}
    </div>
  );
};
