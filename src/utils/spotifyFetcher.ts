import useSwr from "swr";
import { type SpotifyApi } from "@spotify/web-api-ts-sdk";

export const CURRENT_TRACK_KEY = "currentTrack";

export const useSpotifyFetcher = <T>(
  spotify: SpotifyApi | null,
  key: string,
  fetcher: (api: SpotifyApi) => Promise<T>,
) => {
  return useSwr(spotify ? [key, spotify] : null, ([, spotify]) => {
    return fetcher(spotify);
  });
};
