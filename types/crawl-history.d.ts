export interface CrawlHistory {
  id: string;
  source_id: string;
  source_name?: string;
  source_base_url?: string;
  started_at?: string;
  completed_at?: string;
  duration_seconds?: number;
  last_run_at?: string; // When this crawl session actually ran
  next_run_at?: string; // When the next crawl is scheduled
  status: "running" | "completed" | "failed" | "cancelled";
  total_jobs_found: number;
  jobs_created: number;
  jobs_updated: number;
  jobs_skipped: number;
  jobs_failed: number;
  error_count: number;
  error_message?: string;
  pages_crawled?: number;
  avg_response_time_ms?: number;
  success_rate: number;
  crawler_version?: string;
  user_agent?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CrawlHistoryListResponse {
  data: CrawlHistory[];
  total: number;
  page: number;
  limit: number;
  max_page: number;
}

export interface CrawlStatistics {
  period_days: number;
  total_crawls: number;
  successful_crawls: number;
  failed_crawls: number;
  running_crawls: number;
  success_rate: number;
  total_jobs_found: number;
  total_jobs_created: number;
  total_jobs_updated: number;
  avg_duration_seconds: number;
  last_crawl?: string;
}

export interface CrawlHistoryFilters {
  source_id?: string;
  status?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface CrawlControlResponse {
  message: string;
  crawl_id?: string;
  source_id?: string;
  status?: string;
  cancelled_count?: number;
}
