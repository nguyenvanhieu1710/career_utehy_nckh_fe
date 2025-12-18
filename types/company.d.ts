import { BaseModel } from "./base";

export interface Company extends BaseModel {
  name: string;
  slug: string;
  logo_url: string | null;
  website: string | null;
  address: string | null;
  description: string | null;
  industry: string | null;
  sub_industries: string[] | null;
  size: string | null;
  locations: string[] | null;
  email: string | null;
  support_email: string | null;
  phone: string | null;

  // Relationships
  jobs?: Job[];
}

export interface CompanyCreate {
  name: string;
  slug?: string;
  logo_url?: string;
  website?: string;
  address?: string;
  description?: string;
  industry?: string;
  sub_industries?: string[];
  size?: string;
  locations?: string[];
  email?: string;
  support_email?: string;
  phone?: string;
}

export type CompanyUpdate = Partial<CompanyCreate>;
