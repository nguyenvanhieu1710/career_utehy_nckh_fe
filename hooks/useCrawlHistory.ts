/**
 * Custom hook for managing crawl history data and operations
 */

import { useState, useEffect, useCallback } from "react";
import { crawlHistoryAPI } from "@/services/crawlHistory";
import { CrawlHistory, CrawlHistoryFilters } from "@/types/crawl-history";
import { usePermissions } from "@/contexts/PermissionContext";

interface UseCrawlHistoryReturn {
  // Data
  crawls: CrawlHistory[];
  loading: boolean;
  error: string | null;

  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    max_page: number;
  };

  // Filters
  filters: CrawlHistoryFilters;

  // Actions
  setFilters: (filters: CrawlHistoryFilters) => void;
  handleStatusFilter: (status: string) => void;
  handlePageChange: (page: number) => void;
  cancelCrawl: (crawlId: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

export const useCrawlHistory = (sourceId?: string): UseCrawlHistoryReturn => {
  const { hasPermission } = usePermissions();

  // State
  const [crawls, setCrawls] = useState<CrawlHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    max_page: 0,
  });
  const [filters, setFilters] = useState<CrawlHistoryFilters>({
    page: 1,
    limit: 20,
    status: "all",
    sort_by: "started_at",
    sort_order: "desc",
  });

  // Fetch crawl histories
  const fetchCrawlHistories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filterParams = { ...filters, source_id: sourceId };
      const data = await crawlHistoryAPI.getCrawlHistories(filterParams);

      setCrawls(data.data);
      setPagination({
        page: data.page,
        limit: data.limit,
        total: data.total,
        max_page: data.max_page,
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(
        error.response?.data?.detail || "Failed to load crawl histories",
      );
    } finally {
      setLoading(false);
    }
  }, [filters, sourceId]);

  // Effects
  useEffect(() => {
    fetchCrawlHistories();
  }, [fetchCrawlHistories]);

  // Actions
  const handleStatusFilter = useCallback((status: string) => {
    setFilters((prev) => ({ ...prev, status, page: 1 }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const cancelCrawl = useCallback(
    async (crawlId: string) => {
      if (!hasPermission("crawl_history.cancel")) {
        throw new Error("You don't have permission to cancel crawls");
      }

      try {
        await crawlHistoryAPI.cancelCrawl(crawlId);
        await fetchCrawlHistories(); // Refresh data
      } catch (err: unknown) {
        const error = err as { response?: { data?: { detail?: string } } };
        throw new Error(
          error.response?.data?.detail || "Failed to cancel crawl",
        );
      }
    },
    [hasPermission, fetchCrawlHistories],
  );

  const refreshData = useCallback(async () => {
    await fetchCrawlHistories();
  }, [fetchCrawlHistories]);

  return {
    // Data
    crawls,
    loading,
    error,

    // Pagination
    pagination,

    // Filters
    filters,

    // Actions
    setFilters,
    handleStatusFilter,
    handlePageChange,
    cancelCrawl,
    refreshData,
  };
};
