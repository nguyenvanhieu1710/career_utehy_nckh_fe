import api from "@/cores/api";
import {
  DataSource,
  DataSourceCreate,
  DataSourceUpdate,
} from "@/types/data-source";

export interface DataSourceListResponse {
  data: DataSource[];
  total: number;
  page: number;
  limit: number;
  max_page: number;
}

export interface DataSourceFilters {
  page?: number;
  limit?: number;
  search_keyword?: string;
  status?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface DataSourceStatistics {
  total_jobs: number;
  jobs_last_7_days: number;
  jobs_last_30_days: number;
  last_crawl: string | null;
  status: string;
  success_rate: number;
}

export const dataSourceAPI = {
  // Get paginated list of data sources
  getDataSources: (filters: DataSourceFilters = {}) => {
    const params = new URLSearchParams();

    // Chỉ thêm parameters khi thực sự có giá trị
    if (filters.page && filters.page > 1) {
      params.append("page", filters.page.toString());
    }
    if (filters.limit && filters.limit !== 10) {
      params.append("limit", filters.limit.toString());
    }
    if (filters.search_keyword && filters.search_keyword.trim()) {
      params.append("search_keyword", filters.search_keyword.trim());
    }
    if (filters.status && filters.status !== "all") {
      params.append("status_filter", filters.status);
    }
    if (filters.sort_by && filters.sort_by !== "created_at") {
      params.append("sort_by", filters.sort_by);
    }
    if (filters.sort_order && filters.sort_order !== "desc") {
      params.append("sort_order", filters.sort_order);
    }

    const queryString = params.toString();
    const url = queryString ? `/data-sources?${queryString}` : "/data-sources";

    return api.get<DataSourceListResponse>(url);
  },

  // Get single data source by ID
  getDataSource: (id: string) => {
    return api.get<DataSource>(`/data-sources/${id}`);
  },

  // Create new data source
  createDataSource: (data: DataSourceCreate) => {
    return api.post<DataSource>("/data-sources", data);
  },

  // Update existing data source
  updateDataSource: (id: string, data: DataSourceUpdate) => {
    return api.put<DataSource>(`/data-sources/${id}`, data);
  },

  // Delete data source
  deleteDataSource: (id: string) => {
    return api.delete(`/data-sources/${id}`);
  },

  // Get detailed statistics for a data source
  getDataSourceStatistics: (id: string) => {
    return api.get<DataSourceStatistics>(`/data-sources/${id}/statistics`);
  },

  // Trigger manual crawl for a data source
  triggerCrawl: (id: string) => {
    return api.post(`/data-sources/${id}/crawl`);
  },

  // Helper function to get avatar URL (placeholder for now)
  getAvatarUrl: (dataSource: DataSource): string => {
    // For now, return a placeholder or default image
    // Later this can be enhanced to support actual avatars
    return "/default-category.png";
  },

  // Upload avatar for data source (placeholder for future implementation)
  uploadAvatar: async (
    dataSourceId: string,
    file: File,
    isUpdate: boolean = false,
  ): Promise<{ avatar_url: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("entity_type", "data-source");
    formData.append("entity_id", dataSourceId);

    if (isUpdate) {
      formData.append("is_update", "true");
    }

    const response = await api.post("/upload/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },
};
