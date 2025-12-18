"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { statusAPI } from "@/services/status";
import { StatusOption } from "@/types/status";

interface StatusContextType {
  statusOptions: StatusOption[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const StatusContext = createContext<StatusContextType | undefined>(undefined);

interface StatusProviderProps {
  children: ReactNode;
}

export function StatusProvider({ children }: StatusProviderProps) {
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatusOptions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch from backend first
      const response = await statusAPI.getStatusOptions();
      setStatusOptions(response.data?.data || []);
    } catch (err: unknown) {
      console.warn(
        "Failed to fetch status options from backend, using local fallback"
      );

      // Fallback to local status options
      setStatusOptions(statusAPI.getLocalStatusOptions());
      setError("Sử dụng dữ liệu cục bộ");
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchStatusOptions();
  };

  useEffect(() => {
    fetchStatusOptions();
  }, []);

  const value: StatusContextType = {
    statusOptions,
    loading,
    error,
    refetch,
  };

  return (
    <StatusContext.Provider value={value}>{children}</StatusContext.Provider>
  );
}

export function useStatus(): StatusContextType {
  const context = useContext(StatusContext);
  if (context === undefined) {
    throw new Error("useStatus must be used within a StatusProvider");
  }
  return context;
}
