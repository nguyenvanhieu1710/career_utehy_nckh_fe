import api from "@/cores/api";
import {
  CrawlHistory,
  CrawlHistoryListResponse,
  CrawlStatistics,
  CrawlHistoryFilters,
  CrawlControlResponse,
} from "@/types/crawl-history";

export const crawlHistoryAPI = {
  /**
   * Get paginated list of crawl histories
   */
  getCrawlHistories: async (
    filters: CrawlHistoryFilters = {},
  ): Promise<CrawlHistoryListResponse> => {
    const params = new URLSearchParams();

    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.source_id) params.append("source_id", filters.source_id);
    if (filters.status && filters.status !== "all")
      params.append("status", filters.status);
    if (filters.sort_by) params.append("sort_by", filters.sort_by);
    if (filters.sort_order) params.append("sort_order", filters.sort_order);

    const response = await api.get(`/crawl-histories?${params.toString()}`);
    return response.data;
  },

  /**
   * Get detailed crawl history by ID
   */
  getCrawlHistoryById: async (crawlId: string): Promise<CrawlHistory> => {
    const response = await api.get(`/crawl-histories/${crawlId}`);
    return response.data;
  },

  /**
   * Get crawl histories for a specific data source
   */
  getCrawlHistoriesBySource: async (
    sourceId: string,
    filters: Omit<CrawlHistoryFilters, "source_id"> = {},
  ): Promise<CrawlHistoryListResponse> => {
    const params = new URLSearchParams();

    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.status && filters.status !== "all")
      params.append("status", filters.status);
    if (filters.sort_by) params.append("sort_by", filters.sort_by);
    if (filters.sort_order) params.append("sort_order", filters.sort_order);

    const response = await api.get(
      `/data-sources/${sourceId}/crawl-histories?${params.toString()}`,
    );
    return response.data;
  },

  /**
   * Get crawl statistics
   */
  getCrawlStatistics: async (
    sourceId?: string,
    days: number = 30,
  ): Promise<CrawlStatistics> => {
    const params = new URLSearchParams();

    if (sourceId) params.append("source_id", sourceId);
    params.append("days", days.toString());

    const response = await api.get(`/crawl-statistics?${params.toString()}`);
    return response.data;
  },

  /**
   * Cancel a running crawl
   */
  cancelCrawl: async (crawlId: string): Promise<CrawlControlResponse> => {
    const response = await api.post(`/crawl-histories/${crawlId}/cancel`);
    return response.data;
  },

  /**
   * Cancel all running crawls for a data source
   */
  cancelSourceCrawls: async (
    sourceId: string,
  ): Promise<CrawlControlResponse> => {
    const response = await api.post(`/data-sources/${sourceId}/cancel-crawls`);
    return response.data;
  },
};
