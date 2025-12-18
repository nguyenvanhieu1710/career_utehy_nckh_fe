"use client";

import { useState, useEffect } from "react";
import { authAPI, setTokenCookie, setUserStorage } from "@/services/auth";

export interface User {
  email: string;
  username: string;
  user_id: string;
  fullname: string;
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await authAPI.verify();

        // Update token and user storage
        setTokenCookie(res.data.access_token);
        setUserStorage(
          res.data.email,
          res.data.user_name,
          res.data.user_id,
          res.data.fullname
        );

        // Set user state
        setUser({
          email: res.data.email,
          username: res.data.user_name,
          user_id: res.data.user_id,
          fullname: res.data.fullname,
        });

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
