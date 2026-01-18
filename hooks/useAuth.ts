"use client";

import { useState, useEffect } from "react";
import {
  authAPI,
  setTokenCookie,
  setRefreshTokenCookie,
  setUserStorage,
} from "@/services/auth";
import { User } from "@/types/user";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
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
