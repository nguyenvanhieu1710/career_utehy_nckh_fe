import { BaseModel } from "./base";
import { Company } from "./company";
import { User } from "./user";

export type JobType =
  | "full-time"
  | "part-time"
  | "intern"
  | "freelance"
  | "contract";
export type JobStatusType =
  | "pending"
  | "approved"
  | "rejected"
  | "applied"
  | "interviewing"
  | "offered"
  | "hired"
  | "rejected_after_interview"
  | "withdrawn";

export interface Job extends BaseModel {
  title: string;
  slug: string;
  company_id: string;
  location: string | null;
  other_locations: string[] | null;
  work_arrangement: string | null;
  job_type: JobType;
  salary_display: string | null;
  salary_min: number | null;
  salary_max: number | null;
  skills: string[] | null;
  requirements: string | null;
  description: string | null;
  benefits: string | null;
  status: JobStatusType;
  source_id: string | null;
  url_source: string | null;
  posted_at: string | null;
  expired_at: string | null;

  // Relationships
  company?: Company;
  source?: DataSource;
  favorites?: JobFavorite[];
  statuses?: JobStatus[];
}

export interface JobCreate {
  title: string;
  company_id: string;
  location?: string;
  other_locations?: string[];
  work_arrangement?: string;
  job_type: JobType;
  salary_display?: string;
  salary_min?: number;
  salary_max?: number;
  skills?: string[];
  requirements?: string;
  description?: string;
  benefits?: string;
  status?: JobStatusType;
  source_id?: string;
  url_source?: string;
  posted_at?: string;
  expired_at?: string;
}

export type JobUpdate = Partial<JobCreate>;

export interface JobFavorite extends BaseModel {
  user_id: string;
  job_id: string;

  // Relationships
  user?: User;
  job?: Job;
}

export interface JobStatus extends BaseModel {
  user_id: string;
  job_id: string;
  status: JobStatusType;
  notes: string | null;

  // Relationships
  user?: User;
  job?: Job;
}

export interface JobApplyRequest {
  job_id: string;
  cv_profile_id: string;
  cover_letter?: string;
}

export interface JobSearchParams {
  query?: string;
  location?: string;
  job_type?: JobType[];
  salary_min?: number;
  salary_max?: number;
  company_id?: string;
  page?: number;
  size?: number;
  sort_by?: "relevance" | "newest" | "salary_high" | "salary_low";
}
