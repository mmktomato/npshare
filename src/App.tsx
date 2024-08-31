import { useEffect } from "react";
import { type PlaybackState } from "@spotify/web-api-ts-sdk";
import styles from "./App.module.css";

import { useSpotify } from "./utils/spotify";

export const App = () => {
  const { spotifySdk, startAuthorization, handleAuthorizationCallback } = useSpotify();

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    if (code) {
      handleAuthorizationCallback();
    }
  }, [handleAuthorizationCallback]);

  useEffect(() => {
    (async () => {
      if (spotifySdk) {
        const user = await spotifySdk.currentUser.profile();
        const userName = user.display_name;
        console.log(userName);

        // Can be null despite the type isn't nullable.'
        const currentTrack: PlaybackState | null = await spotifySdk.player.getCurrentlyPlayingTrack();
        const type = currentTrack?.currently_playing_type;
        console.log(type);
      }
    })();
  }, [spotifySdk]);

  const onAuthClick = () => {
    startAuthorization();
  };

  return (
    <div className={styles.text}>
      {spotifySdk ? <div>See console.</div> : <button onClick={onAuthClick}>auth</button>}
    </div>
  );
};
