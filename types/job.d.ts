// Job Type enum
export type JobType =
  | "full-time"
  | "part-time"
  | "intern"
  | "freelance"
  | "contract";

// Job Status enum
export type JobStatusType = "pending" | "approved" | "rejected";

export interface Job {
  id: string;
  title: string;
  company: {
    id: string;
    name: string;
    logo?: string;
    location?: string;
  };
  location: string;
  other_locations?: string[];
  salary?: string;
  salary_min?: number;
  salary_max?: number;
  job_type: JobType;
  work_arrangement: "remote" | "hybrid" | "onsite";
  posted_date: string;
  description: string;
  requirements: string[];
  skills: string[];
  benefits?: string[];
  is_urgent?: boolean;
  is_featured?: boolean;
  application_count?: number;
  status?: JobStatusType;
  application_url?: string;
}

export interface JobFilters {
  search?: string;
  location?: string;
  job_types?: string[];
  work_arrangements?: string[];
  salary_range?: {
    min?: number;
    max?: number;
  };
  skills?: string[];
  posted_within?: number; // days
  company_size?: string[];
  experience_level?: string[];
}

export interface JobSearchState {
  jobs: Job[];
  filters: JobFilters;
  loading: boolean;
  hasMore: boolean;
  page: number;
  total: number;
}

// Job Create interface (for creating new jobs)
export interface JobCreate {
  title: string;
  company_id: string;
  location?: string;
  other_locations?: string[];
  salary?: string;
  salary_min?: number;
  salary_max?: number;
  job_type: JobType;
  work_arrangement?: "remote" | "hybrid" | "onsite";
  description?: string;
  requirements?: string;
  skills?: string[];
  benefits?: string;
  is_urgent?: boolean;
  is_featured?: boolean;
  status?: JobStatusType;
}

// Job Update interface (for updating existing jobs)
export interface JobUpdate {
  title?: string;
  company_id?: string;
  location?: string;
  other_locations?: string[];
  salary?: string;
  salary_min?: number;
  salary_max?: number;
  job_type?: JobType;
  work_arrangement?: "remote" | "hybrid" | "onsite";
  description?: string;
  requirements?: string;
  skills?: string[];
  benefits?: string;
  is_urgent?: boolean;
  is_featured?: boolean;
  status?: JobStatusType;
}
