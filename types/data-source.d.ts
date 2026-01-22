import { BaseModel } from "./base";
import { Job } from "./job";

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

  // Crawler config info (moved from crawler_configs table)
  crawl_frequency?: string; // 'hourly' | 'daily' | 'weekly'
  crawl_enabled?: boolean; // true if crawling is enabled
  next_run_at?: string; // Next scheduled crawl time (from crawl_history)

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
