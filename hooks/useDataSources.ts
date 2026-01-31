/**
 * Custom hook for managing data sources data and operations
 */

import { useState, useEffect, useCallback } from "react";
import { dataSourceAPI, DataSourceFilters } from "@/services/dataSource";
import { DataSource } from "@/types/data-source";

interface UseDataSourcesReturn {
  // Data
  dataSources: DataSource[];
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
  filters: DataSourceFilters;

  // Actions
  setFilters: (filters: DataSourceFilters) => void;
  handleStatusChange: (status: string) => void;
  handleSearchChange: (search: string) => void;
  handlePageChange: (page: number) => void;
  refreshData: () => Promise<void>;
  createDataSource: (data: any) => Promise<void>;
  updateDataSource: (id: string, data: any) => Promise<void>;
  deleteDataSource: (id: string) => Promise<void>;
}

export const useDataSources = (): UseDataSourcesReturn => {
  // State
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    max_page: 1,
  });
  const [filters, setFilters] = useState<DataSourceFilters>({
    page: 1,
    limit: 10,
    search_keyword: "",
    status: "all",
    sort_by: "created_at",
    sort_order: "desc",
  });

  // Fetch data sources
  const fetchDataSources = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Chỉ gửi parameters khi thực sự cần thiết
      const apiFilters: DataSourceFilters = {};

      if (filters.page && filters.page > 1) {
        apiFilters.page = filters.page;
      }
      if (filters.limit && filters.limit !== 10) {
        apiFilters.limit = filters.limit;
      }
      if (filters.search_keyword && filters.search_keyword.trim()) {
        apiFilters.search_keyword = filters.search_keyword.trim();
      }
      if (filters.status && filters.status !== "all") {
        apiFilters.status = filters.status;
      }
      if (filters.sort_by && filters.sort_by !== "created_at") {
        apiFilters.sort_by = filters.sort_by;
      }
      if (filters.sort_order && filters.sort_order !== "desc") {
        apiFilters.sort_order = filters.sort_order;
      }

      const response = await dataSourceAPI.getDataSources(apiFilters);

      setDataSources(response.data.data);
      setPagination({
        page: response.data.page,
        limit: response.data.limit,
        total: response.data.total,
        max_page: response.data.max_page,
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || "Failed to load data sources");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Effects
  useEffect(() => {
    fetchDataSources();
  }, [fetchDataSources]);

  // Actions
  const handleStatusChange = useCallback((status: string) => {
    setFilters((prev) => ({ ...prev, status, page: 1 }));
  }, []);

  const handleSearchChange = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search_keyword: search, page: 1 }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const refreshData = useCallback(async () => {
    await fetchDataSources();
  }, [fetchDataSources]);

  // CRUD operations
  const createDataSource = useCallback(
    async (data: any) => {
      try {
        setLoading(true);
        await dataSourceAPI.createDataSource(data);
        await fetchDataSources(); // Refresh data
      } catch (err: unknown) {
        const error = err as { response?: { data?: { detail?: string } } };
        throw new Error(
          error.response?.data?.detail || "Failed to create data source",
        );
      } finally {
        setLoading(false);
      }
    },
    [fetchDataSources],
  );

  const updateDataSource = useCallback(
    async (id: string, data: any) => {
      try {
        setLoading(true);
        await dataSourceAPI.updateDataSource(id, data);
        await fetchDataSources(); // Refresh data
      } catch (err: unknown) {
        const error = err as { response?: { data?: { detail?: string } } };
        throw new Error(
          error.response?.data?.detail || "Failed to update data source",
        );
      } finally {
        setLoading(false);
      }
    },
    [fetchDataSources],
  );

  const deleteDataSource = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        await dataSourceAPI.deleteDataSource(id);
        await fetchDataSources(); // Refresh data
      } catch (err: unknown) {
        const error = err as { response?: { data?: { detail?: string } } };
        throw new Error(
          error.response?.data?.detail || "Failed to delete data source",
        );
      } finally {
        setLoading(false);
      }
    },
    [fetchDataSources],
  );

  return {
    // Data
    dataSources,
    loading,
    error,

    // Pagination
    pagination,

    // Filters
    filters,

    // Actions
    setFilters,
    handleStatusChange,
    handleSearchChange,
    handlePageChange,
    refreshData,
    createDataSource,
    updateDataSource,
    deleteDataSource,
  };
};
