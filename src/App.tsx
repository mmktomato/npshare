import { useEffect } from "react";

import styles from "./App.module.css";
import { useSpotify } from "./utils/spotify";
import { Share } from "./components/Share";
import { Cover } from "./components/Cover";

export const App = () => {
  const { spotifyApi, startAuthorization, handleAuthorizationCallback } = useSpotify();

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    if (code) {
      handleAuthorizationCallback();
    }
  }, [handleAuthorizationCallback]);

  const onAuthClick = () => {
    startAuthorization();
  };

  return (
    <div className={styles.text}>
      {spotifyApi ? (
        <>
          <Cover spotifyApi={spotifyApi} />
          <Share spotifyApi={spotifyApi} />
        </>
      ) : (
        <button onClick={onAuthClick}>auth</button>
      )}
    </div>
  );
};
