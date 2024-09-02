import { useEffect } from "react";

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
    <div className="flex flex-col items-center gap-4 m-4">
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
