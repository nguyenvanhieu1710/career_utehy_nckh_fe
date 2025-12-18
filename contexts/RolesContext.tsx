"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { userAPI } from "@/services/user";
import { Role } from "@/types/user";

interface RolesContextType {
  roles: Role[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  retryCount: number;
}

const RolesContext = createContext<RolesContextType | undefined>(undefined);

interface RolesProviderProps {
  children: ReactNode;
}

export function RolesProvider({ children }: RolesProviderProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchRoles = async (isRetry = false) => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      if (!isRetry) {
        setLoading(true);
      }
      setError(null);

      const response = await userAPI.getAvailableRoles();

      const rolesData = response.data?.data || [];

      const mappedRoles = rolesData.map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description,
      }));

      setRoles(mappedRoles);

      // Cache in localStorage for offline access
      localStorage.setItem("cached_roles", JSON.stringify(rolesData));
      localStorage.setItem("cached_roles_timestamp", Date.now().toString());
    } catch (err: unknown) {
      setError("Không thể tải danh sách vai trò");

      // Try to use cached data
      const cachedRoles = localStorage.getItem("cached_roles");
      const cachedTimestamp = localStorage.getItem("cached_roles_timestamp");

      if (cachedRoles && cachedTimestamp) {
        const cacheAge = Date.now() - parseInt(cachedTimestamp);
        const maxCacheAge = 5 * 60 * 1000; // 5 minutes

        if (cacheAge < maxCacheAge) {
          setRoles(JSON.parse(cachedRoles));
          setError("Sử dụng dữ liệu đã lưu (offline)");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    setRetryCount((prev) => prev + 1);
    await fetchRoles(true);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Auto retry on error with exponential backoff
  useEffect(() => {
    if (error && retryCount < 3) {
      const retryDelay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s

      const timer = setTimeout(() => {
        refetch();
      }, retryDelay);

      return () => clearTimeout(timer);
    }
  }, [error, retryCount, refetch]);

  const value: RolesContextType = {
    roles,
    loading,
    error,
    refetch,
    retryCount,
  };

  return (
    <RolesContext.Provider value={value}>{children}</RolesContext.Provider>
  );
}

export function useRoles(): RolesContextType {
  const context = useContext(RolesContext);
  if (context === undefined) {
    throw new Error("useRoles must be used within a RolesProvider");
  }
  return context;
}
