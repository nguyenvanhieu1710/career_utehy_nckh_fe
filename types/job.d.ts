// Frontend-only Job types for UI development

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
  salary?: string;
  jobType: JobType;
  workArrangement: "remote" | "hybrid" | "onsite";
  postedDate: string;
  description: string;
  requirements: string[];
  skills: string[];
  benefits?: string[];
  isUrgent?: boolean;
  isFeatured?: boolean;
  applicationCount?: number;
}

export interface JobFilters {
  search?: string;
  location?: string;
  jobTypes?: string[];
  workArrangements?: string[];
  salaryRange?: {
    min?: number;
    max?: number;
  };
  skills?: string[];
  postedWithin?: number; // days
  companySize?: string[];
  experienceLevel?: string[];
}

export interface JobSearchState {
  jobs: Job[];
  filters: JobFilters;
  loading: boolean;
  hasMore: boolean;
  page: number;
  total: number;
}
