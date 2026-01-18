/**
 * Token utility functions for JWT handling
 */

/**
 * JWT payload interface
 */
interface JWTPayload {
  exp?: number;
  user_id?: string;
  email?: string;
  [key: string]: unknown;
}

/**
 * Decode JWT token without verification (client-side only)
 * @param token JWT token string
 * @returns Decoded payload or null if invalid
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Check if JWT token is expired
 * @param token JWT token string
 * @returns true if expired, false if valid
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}

/**
 * Get token expiration time in seconds
 * @param token JWT token string
 * @returns Expiration timestamp or null
 */
export function getTokenExpiration(token: string): number | null {
  const payload = decodeJWT(token);
  return payload?.exp || null;
}

/**
 * Check if token will expire within specified minutes
 * @param token JWT token string
 * @param minutes Minutes to check ahead
 * @returns true if token will expire soon
 */
export function isTokenExpiringSoon(
  token: string,
  minutes: number = 5,
): boolean {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  const expirationBuffer = minutes * 60; // Convert to seconds

  return payload.exp < currentTime + expirationBuffer;
}
