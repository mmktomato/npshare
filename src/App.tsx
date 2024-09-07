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
          <div className="flex gap-4 max-w-64 overflow-x-scroll snap-x snap-mandatory">
            <Share
              type="album"
              className="snap-start"
              spotifyApi={spotifyApi}
            />
            <Share
              type="track"
              className="snap-start"
              spotifyApi={spotifyApi}
            />
          </div>
        </>
      ) : (
        <button onClick={onAuthClick}>auth</button>
      )}
    </div>
  );
};
