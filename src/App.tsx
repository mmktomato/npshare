import { useEffect, useRef } from "react";

import { useSpotify } from "./utils/spotify";
import { Share } from "./components/Share";
import { Cover } from "./components/Cover";
import { ShareSelector } from "./components/ShareSelector";

export const App = () => {
  const { spotifyApi, startAuthorization, handleAuthorizationCallback } = useSpotify();
  const albumRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

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
          <ShareSelector
            refTitles={[
              { ref: albumRef, title: "Album" },
              { ref: trackRef, title: "Track" },
            ]}
          />
          <div className="flex gap-4 max-w-64 overflow-x-scroll scroll-smooth snap-x snap-mandatory">
            <Share
              type="album"
              className="snap-start"
              spotifyApi={spotifyApi}
              outerRef={albumRef}
            />
            <Share
              type="track"
              className="snap-start"
              spotifyApi={spotifyApi}
              outerRef={trackRef}
            />
          </div>
        </>
      ) : (
        <button onClick={onAuthClick}>auth</button>
      )}
    </div>
  );
};
