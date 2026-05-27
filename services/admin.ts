import api from "@/cores/api";

export interface DashboardChartData {
  name: string;
  full_date: string;
  registered_students: number;
  jobs_crawled: number;
  website_visits: number;
}

export interface DashboardStatsResponse {
  status: string;
  data: DashboardChartData[];
}

export const adminAPI = {
  /**
   * Get dashboard statistics for chart
   * GET /admin/dashboard-stats
   */
  getDashboardStats: async (days: number = 7): Promise<DashboardStatsResponse> => {
    const response = await api.get<DashboardStatsResponse>("/admin/dashboard-stats", {
      params: { days }
    });
    return response.data;
  },
};

export default adminAPI;
