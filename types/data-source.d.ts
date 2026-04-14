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

  // Crawler config info
  crawl_frequency?: string; 
  crawl_enabled?: boolean; 
  next_run_at?: string; 
  crawler_payload?: any;

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
