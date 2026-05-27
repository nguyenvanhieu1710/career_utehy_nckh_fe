import api from "@/cores/api";

export interface SystemStats {
  user_count: number;
  job_count: number;
  company_count: number;
}

export interface PublicStatsResponse {
  status: string;
  data: SystemStats;
}

export const publicAPI = {
  /**
   * Get overall system statistics
   * GET /public/stats
   */
  getStats: async (): Promise<PublicStatsResponse> => {
    const response = await api.get<PublicStatsResponse>("/public/stats");
    return response.data;
  },

  /**
   * Get featured students for home page display
   * GET /public/featured-students
   */
  getFeaturedStudents: async () => {
    const response = await api.get("/public/featured-students");
    return response.data;
  },
};

export default publicAPI;
