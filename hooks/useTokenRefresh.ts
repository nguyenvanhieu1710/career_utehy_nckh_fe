"use client";

import { useEffect, useRef, useCallback } from "react";
import {
  getTokenCookie,
  getRefreshTokenCookie,
  setTokenCookie,
  authAPI,
} from "@/services/auth";
import { isTokenExpiringSoon } from "@/lib/token";
import { apiLogger } from "@/lib/logger";

/**
 * Hook to automatically refresh tokens before they expire
 * This runs in the background and proactively refreshes tokens
 */
export function useTokenRefresh() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  const checkAndRefreshToken = useCallback(async () => {
    // Prevent multiple simultaneous refresh attempts
    if (isRefreshingRef.current) {
      return;
    }

    const accessToken = getTokenCookie();
    const refreshToken = getRefreshTokenCookie();

    if (!accessToken || !refreshToken) {
      return;
    }

    // Check if access token will expire in the next 5 minutes
    if (isTokenExpiringSoon(accessToken, 5)) {
      try {
        isRefreshingRef.current = true;
        apiLogger.info("Proactively refreshing token");
        const response = await authAPI.refresh(refreshToken);
        setTokenCookie(response.data.access_token);
        apiLogger.info("Token refreshed proactively");
      } catch (error) {
        apiLogger.warn("Proactive token refresh failed", error);
        // Don't logout here - let the API interceptor handle it
      } finally {
        isRefreshingRef.current = false;
      }
    }
  }, []);

  useEffect(() => {
    // Clear any existing interval to prevent duplicates
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Check every 2 minutes
    intervalRef.current = setInterval(checkAndRefreshToken, 2 * 60 * 1000);

    // Initial check
    checkAndRefreshToken();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      isRefreshingRef.current = false;
    };
  }, []); // Empty dependency array - only run once

  return null; // This hook doesn't return anything
}
