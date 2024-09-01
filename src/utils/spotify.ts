import { useEffect, useState } from "react";
import { SpotifyApi, type AccessToken } from "@spotify/web-api-ts-sdk";

import { generateRandomString, generateCodeChallenge, isExpired } from "./auth";

const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const SPOTIFY_SCOPES = ["user-read-private", "user-read-email", "user-read-currently-playing"];
const SPOTIFY_AUTHORIZATION_ENDPOINT = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";

// TODO: Change this value when production.
const REDIRECT_URI = "http://localhost:3456";
const APP_ROOT_URI = "http://localhost:3456";

const CODE_VERIFIER_KEY = "spotify_code_verifier";
const AUTH_STATE_KEY = "spotify_auth_state";
const ACCESS_TOKEN_KEY = "spotify_access_token";
const AUTHORIZED_DATE_TIME_KEY = "spotify_authorized_date_time";

/* *********************
 * Authorization code with PKCE flow
 *   https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
 *
 * Since Spotify SDK doesn't work in authentication, I need to implement it by myself.
 *   https://github.com/spotify/spotify-web-api-ts-sdk/issues/121
 *   https://github.com/spotify/spotify-web-api-ts-sdk/issues/125
 * *********************/

// This is to avoid double execution of useEffect because of `React.StrictMode`.
let isInitializingOrDone = false;

export const useSpotify = () => {
  const [spotifyApi, setSpotifyApi] = useState<SpotifyApi | null>(null);

  useEffect(() => {
    if (isInitializingOrDone) {
      return;
    }
    isInitializingOrDone = true;

    (async () => {
      const accessTokenStr = localStorage.getItem(ACCESS_TOKEN_KEY);
      const authorizedTimeStr = localStorage.getItem(AUTHORIZED_DATE_TIME_KEY);
      if (accessTokenStr && authorizedTimeStr) {
        let accessToken = JSON.parse(accessTokenStr) as AccessToken;
        const authorizedTime = parseInt(authorizedTimeStr);
        if (isExpired(authorizedTime, accessToken.expires_in)) {
          const newToken = await refreshToken(accessToken.refresh_token);
          accessToken = newToken;
          localStorage.setItem(ACCESS_TOKEN_KEY, JSON.stringify(accessToken));
          localStorage.setItem(AUTHORIZED_DATE_TIME_KEY, new Date().getTime().toString());
        }
        const api = SpotifyApi.withAccessToken(SPOTIFY_CLIENT_ID, accessToken);
        setSpotifyApi(api);
      }
    })();
  }, []);

  const startAuthorization = async () => {
    const codeVerifier = generateRandomString(64);
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    sessionStorage.setItem(CODE_VERIFIER_KEY, codeVerifier);
    redirectToAuthorizationEndpoint(codeChallenge);
  };

  const handleAuthorizationCallback = async () => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (code && state) {
      const savedState = sessionStorage.getItem(AUTH_STATE_KEY);
      if (savedState === state) {
        const accessToken = await getTokenByCallback(code);
        localStorage.setItem(ACCESS_TOKEN_KEY, JSON.stringify(accessToken));
        localStorage.setItem(AUTHORIZED_DATE_TIME_KEY, new Date().getTime().toString());
        sessionStorage.removeItem(AUTH_STATE_KEY);
        sessionStorage.removeItem(CODE_VERIFIER_KEY);
        window.location.href = APP_ROOT_URI;
      } else {
        console.warn("Invalid state");
      }
    }
  };

  return { spotifyApi, startAuthorization, handleAuthorizationCallback, isAuthenticated: !!spotifyApi };
};

const redirectToAuthorizationEndpoint = (codeChallenge: string) => {
  const state = crypto.randomUUID();
  sessionStorage.setItem(AUTH_STATE_KEY, state);

  const searchParams = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    state,
    scope: SPOTIFY_SCOPES.join(" "),
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
  });

  const url = new URL(`${SPOTIFY_AUTHORIZATION_ENDPOINT}?${searchParams.toString()}`);
  // window.open(url.toString(), "popup");
  window.location.href = url.toString();
};

const getTokenByCallback = async (code: string) => {
  const codeVerifier = sessionStorage.getItem(CODE_VERIFIER_KEY);
  if (!codeVerifier) {
    throw new Error("Code verifier not found");
  }

  const formData = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: codeVerifier,
  });

  const res = await fetch(SPOTIFY_TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  const status = res.status;
  if (status !== 200) {
    throw new Error("Failed to get access token.");
  }

  return (await res.json()) as AccessToken;
};

const refreshToken = async (refreshToken: string) => {
  const formData = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const res = await fetch(SPOTIFY_TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  const status = res.status;
  if (status !== 200) {
    throw new Error("Failed to refresh token.");
  }

  return (await res.json()) as AccessToken;
};
