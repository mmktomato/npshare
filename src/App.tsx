import { useEffect } from "react";

import { useSpotify } from "./utils/spotify";
import { Cover } from "./components/Cover";
import { ShareContainer } from "./components/ShareContainer";

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
          <ShareContainer spotifyApi={spotifyApi} />
        </>
      ) : (
        <button
          className="border border-gray-700 rounded p-2 cursor-pointer"
          onClick={onAuthClick}
        >
          Login to Spotify
        </button>
      )}
    </div>
  );
};
