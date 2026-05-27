import { BaseModel } from "./base";
import { Job } from "./job";

export interface ApiServiceConfig {
  url: string;
  method?: "GET" | "POST" | "PUT" | "PATCH";
  headers?: Record<string, string>;
  params?: Record<string, any>;
  body?: any;
  json_path?: string;
  item_id_field?: string;
  mapping?: Record<string, string>;
}

export interface CrawlUrlEntry {
  url: string;
  category_id?: string | null;
  last_used_at?: string | null;
}

export interface DataSource extends BaseModel {
  name: string;
  description?: string;
  base_url: string | null;
  status: "active" | "inactive";
  last_crawled_at: string | null;

  // Statistics from API
  total_records?: number;
  recent_records?: number;
  success_rate?: number;

  // Crawler config info
  crawl_frequency?: string;
  crawl_enabled?: boolean;
  next_run_at?: string;
  crawler_payload?: any;

  // Provider-API extraction step
  api_service?: boolean;
  api_service_config?: ApiServiceConfig | null;

  // Manual-scrape URL history (most-recent first)
  crawl_urls?: CrawlUrlEntry[];

  // Relationships
  jobs?: Job[];
  crawler_configs?: CrawlerConfig[];
}

export interface DataSourceCreate {
  name: string;
  description?: string;
  base_url?: string;
  status?: "active" | "inactive";
  // Crawler config fields
  crawl_frequency?: "hourly" | "daily" | "weekly";
  crawl_enabled?: boolean;
  crawler_payload?: any;
  api_service?: boolean;
  api_service_config?: ApiServiceConfig | null;
}

export interface ScrapeResult {
  source_id: string;
  source_name: string;
  method: "api" | "extraction" | "selector" | "mixed" | "noop";
  fetched: number;
  inserted: number;
  skipped_duplicate: number;
  failed: number;
  errors: string[];
  elapsed_ms: number;
}

export interface ScrapeResponse {
  message: string;
  data: ScrapeResult;
}

export type DataSourceUpdate = Partial<DataSourceCreate>;

export interface CrawlerConfig extends BaseModel {
  source_id: string;
  config_key: string;
  config_value: string;
  description: string | null;

  // Relationships
  source?: DataSource;
}

export interface CrawlerConfigCreate {
  source_id: string;
  config_key: string;
  config_value: string;
  description?: string;
}

export type CrawlerConfigUpdate = Partial<CrawlerConfigCreate>;
