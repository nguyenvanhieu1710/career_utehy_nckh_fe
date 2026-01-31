import api from "@/cores/api";

/**
 * Job MongoDB Service
 * Query jobs from MongoDB (companies collection with nested jobs)
 * Data structure is flexible (crawled data may have missing fields)
 */

/**
 * Flexible Job type for MongoDB (crawled data)
 * All fields are optional since crawled data may be incomplete
 */
export interface JobMongo {
  id?: string;
  title?: string;
  company_name?: string;
  company_id?: string;
  description?: string;
  location?: string;
  jobType?: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryDisplay?: string;
  skills?: string[];
  requirements?: string[];
  benefits?: string[];
  remoteAllowed?: boolean;
  featured?: boolean;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  applicationDeadline?: string;
  applicationEmail?: string;
  applicationUrl?: string;
  // Allow any additional fields from crawled data
  [key: string]: unknown;
}

interface JobMongoFilters {
  query?: string;
  location?: string;
  job_type?: string;
  experience_level?: string;
  company_id?: string;
  salary_min?: number;
  salary_max?: number;
  remote_allowed?: boolean;
  featured?: boolean;
  page?: number;
  limit?: number;
  sort_by?: string;
  order?: "asc" | "desc";
}

interface JobMongoListResponse {
  data: JobMongo[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

interface JobMongoDetailResponse {
  data: JobMongo;
}

interface JobMongoStatsResponse {
  data: {
    total_jobs: number;
    active_jobs: number;
    inactive_jobs: number;
    expired_jobs: number;
    draft_jobs: number;
    featured_jobs: number;
    jobs_by_type: Record<string, number>;
    jobs_by_experience: Record<string, number>;
    jobs_by_location: Record<string, number>;
  };
}

export const jobMongoAPI = {
  /**
   * List all jobs with optional filters and pagination
   * GET /api/v1/job-mongo
   */
  listJobs: async (
    filters?: JobMongoFilters
  ): Promise<JobMongoListResponse> => {
    const params = new URLSearchParams();

    if (filters?.query) params.append("query", filters.query);
    if (filters?.location) params.append("location", filters.location);
    if (filters?.job_type) params.append("job_type", filters.job_type);
    if (filters?.experience_level)
      params.append("experience_level", filters.experience_level);
    if (filters?.company_id) params.append("company_id", filters.company_id);
    if (filters?.salary_min)
      params.append("salary_min", filters.salary_min.toString());
    if (filters?.salary_max)
      params.append("salary_max", filters.salary_max.toString());
    if (filters?.remote_allowed !== undefined)
      params.append("remote_allowed", filters.remote_allowed.toString());
    if (filters?.featured !== undefined)
      params.append("featured", filters.featured.toString());
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.sort_by) params.append("sort_by", filters.sort_by);
    if (filters?.order) params.append("order", filters.order);

    const queryString = params.toString();
    const url = queryString ? `/job-mongo?${queryString}` : "/job-mongo";

    const response = await api.get(url);
    return response.data;
  },

  /**
   * Get a single job by ID
   * GET /api/v1/job-mongo/{job_id}
   */
  getJobById: async (jobId: string): Promise<JobMongoDetailResponse> => {
    const response = await api.get(`/job-mongo/${jobId}`);
    return response.data;
  },

  /**
   * Get jobs by company
   * GET /api/v1/company/{company_id}/jobs
   */
  getJobsByCompany: async (
    companyId: string,
    options?: {
      status?: string;
      limit?: number;
    }
  ): Promise<{ data: JobMongo[]; total: number }> => {
    const params = new URLSearchParams();
    if (options?.status) params.append("status", options.status);
    if (options?.limit) params.append("limit", options.limit.toString());

    const queryString = params.toString();
    const url = queryString
      ? `/company/${companyId}/jobs?${queryString}`
      : `/company/${companyId}/jobs`;

    const response = await api.get(url);
    return response.data;
  },

  /**
   * Get job statistics
   * GET /api/v1/job-mongo/stats
   */
  getStats: async (): Promise<JobMongoStatsResponse> => {
    const response = await api.get("/job-mongo/stats");
    return response.data;
  },

  /**
   * Search jobs with text query
   * Shorthand for listJobs with query parameter
   */
  searchJobs: async (
    query: string,
    options?: Omit<JobMongoFilters, "query">
  ): Promise<JobMongoListResponse> => {
    return jobMongoAPI.listJobs({ query, ...options });
  },

  /**
   * Get featured jobs
   * Shorthand for listJobs with featured=true
   */
  getFeaturedJobs: async (
    limit: number = 10
  ): Promise<JobMongoListResponse> => {
    return jobMongoAPI.listJobs({ featured: true, limit });
  },

  /**
   * Get recent jobs
   * Shorthand for listJobs sorted by created_at desc
   */
  getRecentJobs: async (limit: number = 10): Promise<JobMongoListResponse> => {
    return jobMongoAPI.listJobs({
      limit,
      sort_by: "created_at",
      order: "desc",
    });
  },

  /**
   * Get jobs by location
   */
  getJobsByLocation: async (
    location: string,
    options?: Omit<JobMongoFilters, "location">
  ): Promise<JobMongoListResponse> => {
    return jobMongoAPI.listJobs({ location, ...options });
  },

  /**
   * Get jobs by type
   */
  getJobsByType: async (
    jobType: string,
    options?: Omit<JobMongoFilters, "job_type">
  ): Promise<JobMongoListResponse> => {
    return jobMongoAPI.listJobs({ job_type: jobType, ...options });
  },

  /**
   * Get remote jobs
   */
  getRemoteJobs: async (
    options?: Omit<JobMongoFilters, "remote_allowed">
  ): Promise<JobMongoListResponse> => {
    return jobMongoAPI.listJobs({ remote_allowed: true, ...options });
  },

  /**
   * Filter jobs by salary range
   */
  getJobsBySalaryRange: async (
    minSalary: number,
    maxSalary: number,
    options?: Omit<JobMongoFilters, "salary_min" | "salary_max">
  ): Promise<JobMongoListResponse> => {
    return jobMongoAPI.listJobs({
      salary_min: minSalary,
      salary_max: maxSalary,
      ...options,
    });
  },
};

export default jobMongoAPI;
