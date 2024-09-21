import { useState, useRef, useMemo, useCallback } from "react";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

import { TitleType } from "../../types";
import { calcHorizontalScrollArea } from "../../utils/scroll";
import { ShareItem } from "../ShareItem";
import { ShareSelector } from "../ShareSelector";

interface ShareContainerProps {
  spotifyApi: SpotifyApi;
}

export const ShareContainer: React.FC<ShareContainerProps> = ({ spotifyApi }) => {
  const [selectedTitle, setSelectedTitle] = useState<TitleType>("Album");
  const albumRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const refTitleMap = useMemo(
    () =>
      new Map<TitleType, React.RefObject<HTMLDivElement>>([
        ["Album", albumRef],
        ["Track", trackRef],
      ]),
    [],
  );

  const onSelect = useCallback(
    (title: TitleType) => {
      refTitleMap.get(title)?.current?.scrollIntoView({ inline: "start" });
    },
    [refTitleMap],
  );

  const onScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const scrollArea = calcHorizontalScrollArea(e.currentTarget);
    switch (scrollArea) {
      case "Left":
        setSelectedTitle("Album");
        break;
      case "Right":
        setSelectedTitle("Track");
        break;
    }
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <ShareSelector
        options={[
          { title: "Album", selected: selectedTitle === "Album" },
          { title: "Track", selected: selectedTitle === "Track" },
        ]}
        onSelect={onSelect}
      />
      <div
        className="flex gap-4 max-w-64 overflow-x-scroll scroll-smooth snap-x snap-mandatory"
        onScroll={onScroll}
      >
        <ShareItem
          type="album"
          className="snap-start"
          spotifyApi={spotifyApi}
          outerRef={albumRef}
        />
        <ShareItem
          type="track"
          className="snap-start"
          spotifyApi={spotifyApi}
          outerRef={trackRef}
        />
      </div>
    </div>
  );
};
