import { BaseModel } from "./base";
import { Job } from "./job";

export interface DataSource extends BaseModel {
  name: string;
  base_url: string | null;
  status: "active" | "inactive";
  last_crawled_at: string | null;

  // Relationships
  jobs?: Job[];
  crawler_configs?: CrawlerConfig[];
}

export interface DataSourceCreate {
  name: string;
  base_url?: string;
  status?: "active" | "inactive";
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
