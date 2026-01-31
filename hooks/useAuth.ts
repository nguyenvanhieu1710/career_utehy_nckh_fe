"use client";

import { useState, useEffect } from "react";
import {
  getTokenCookie,
  getRefreshTokenCookie,
  getUserStorage,
  authAPI,
  setTokenCookie,
  setRefreshTokenCookie,
  setUserStorage,
} from "@/services/auth";
import { User } from "@/types/user";
import { isTokenExpired } from "@/lib/token";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const accessToken = getTokenCookie();
        const refreshToken = getRefreshTokenCookie();

        // If no tokens, user is not authenticated
        if (!accessToken && !refreshToken) {
          setIsAuthenticated(false);
          setUser(null);
          setIsLoading(false);
          return;
        }

        // If access token exists and is not expired, load user from storage
        if (accessToken && !isTokenExpired(accessToken)) {
          const userStorage = getUserStorage();
          if (userStorage.user_id) {
            setUser({
              id: userStorage.user_id,
              email: userStorage.email || "",
              username: userStorage.username || "",
              fullname: userStorage.fullname || "",
              avatar_url: userStorage.avatar_url || "",
            } as User);
            setIsAuthenticated(true);
            setIsLoading(false);
            return;
          }
        }

        // If we have a refresh token but no valid access token, try to verify
        if (refreshToken) {
          try {
            const res = await authAPI.verify();

            // Update tokens and user storage
            setTokenCookie(res.data.access_token);
            if (res.data.refresh_token) {
              setRefreshTokenCookie(res.data.refresh_token);
            }
            setUserStorage(
              res.data.email,
              res.data.user_name,
              res.data.user_id,
              res.data.fullname,
              res.data.avatar_url,
            );

            // Set user state
            setUser({
              id: res.data.user_id,
              email: res.data.email,
              username: res.data.user_name,
              fullname: res.data.fullname,
              avatar_url: res.data.avatar_url,
            } as User);

            setIsAuthenticated(true);
          } catch (error) {
            // Verify failed, user is not authenticated
            setIsAuthenticated(false);
            setUser(null);
          }
        } else {
          // No refresh token, user is not authenticated
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return {
    isAuthenticated,
    isLoading,
    user,
  };
}
