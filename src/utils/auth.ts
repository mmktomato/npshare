// https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow

export const generateRandomString = (length: number) => {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
};

const sha256 = async (plain: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest("SHA-256", data);
};

const base64encode = (input: ArrayBuffer) => {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
};

export const generateCodeChallenge = async (codeVerifier: string) => {
  const hashed = await sha256(codeVerifier);
  return base64encode(hashed);
};

export const isExpired = (dateTime: number, expiresIn: number) => {
  const expiresAt = dateTime + expiresIn * 1000;
  const now = new Date().getTime();
  return expiresAt < now;
};
