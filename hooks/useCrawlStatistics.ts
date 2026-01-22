/**
 * Custom hook for managing crawl statistics data
 */

import { useState, useEffect, useCallback } from "react";
import { crawlHistoryAPI } from "@/services/crawlHistory";
import { CrawlStatistics } from "@/types/crawl-history";

interface UseCrawlStatisticsReturn {
  // Data
  stats: CrawlStatistics | null;
  loading: boolean;
  error: string | null;

  // Actions
  refreshStats: () => Promise<void>;
  setDays: (days: number) => void;
  setSourceId: (sourceId?: string) => void;
}

interface UseCrawlStatisticsOptions {
  sourceId?: string;
  days?: number;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

export const useCrawlStatistics = (
  options: UseCrawlStatisticsOptions = {},
): UseCrawlStatisticsReturn => {
  const {
    sourceId: initialSourceId,
    days: initialDays = 30,
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
  } = options;

  // State
  const [stats, setStats] = useState<CrawlStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sourceId, setSourceId] = useState<string | undefined>(initialSourceId);
  const [days, setDays] = useState<number>(initialDays);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await crawlHistoryAPI.getCrawlStatistics(sourceId, days);
      setStats(data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || "Failed to load statistics");
    } finally {
      setLoading(false);
    }
  }, [sourceId, days]);

  // Effects
  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  // Auto refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchStatistics();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchStatistics]);

  // Actions
  const refreshStats = useCallback(async () => {
    await fetchStatistics();
  }, [fetchStatistics]);

  return {
    // Data
    stats,
    loading,
    error,

    // Actions
    refreshStats,
    setDays,
    setSourceId,
  };
};
