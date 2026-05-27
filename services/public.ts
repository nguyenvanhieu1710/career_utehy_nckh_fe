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

export interface PublicJobCompany {
  id: string | null;
  name: string | null;
  slug?: string | null;
  logo_url?: string | null;
  website?: string | null;
  address?: string | null;
  description?: string | null;
  industry?: string | null;
  size?: string | null;
  locations?: string[] | null;
}

export interface PublicJobDetail {
  id: string;
  title: string;
  slug?: string | null;
  location?: string | null;
  other_locations?: string[] | null;
  work_arrangement?: string | null;
  job_type?: string | null;
  job_level?: string | null;
  years_of_experience?: number | null;
  salary_display?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  skills?: string[] | null;
  description?: string | null;
  requirements?: string | null;
  benefits?: string | null;
  url_source?: string | null;
  image_url?: string | null;
  category_title?: string | null;
  category_slug?: string | null;
  posted_at?: string | null;
  expired_at?: string | null;
  created_at?: string | null;
  company: PublicJobCompany | null;
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

  /**
   * Public job detail (no auth) — used by the home-page hot-jobs flow.
   * GET /public/jobs/{id}
   */
  getJobById: async (jobId: string) => {
    const response = await api.get<{
      status: string;
      data: PublicJobDetail;
    }>(`/public/jobs/${jobId}`);
    return response.data;
  },

  /**
   * Public "featured jobs" — ranked by favorite count + salary.
   * GET /public/jobs/featured
   */
  getFeaturedJobs: async (limit: number = 12) => {
    const response = await api.get<{
      status: string;
      data: PublicFeaturedJob[];
    }>(`/public/jobs/featured`, { params: { limit } });
    return response.data;
  },
};

export interface PublicFeaturedJob {
  id: string;
  title: string;
  location: string | null;
  salary_display: string | null;
  url_source: string | null;
  image_url: string | null;
  favorite_count: number;
  company: {
    id: string | null;
    name: string | null;
    logo_url: string | null;
  };
}

export default publicAPI;
