import { BaseModel } from './base';
import { User } from './user';

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  start_date: string;
  end_date: string;
  is_current: boolean;
}

export interface Certification {
  name: string;
  issuer: string;
  issue_date: string;
  expiration_date?: string;
  credential_url?: string;
}

export interface LanguageProficiency {
  language: string;
  proficiency: 'basic' | 'conversational' | 'professional' | 'native';
}

export interface CVProfile extends BaseModel {
  user_id: string;
  name: string;
  title?: string | null;
  subtitle?: string | null;
  primary_color?: string | null;
  sections: string;
}


export interface CVProfileCreate {
  title: string;
  summary?: string;
  projects?: Project[];
  certifications?: Certification[];
  languages?: LanguageProficiency[];
  file_url?: string;
}

export interface CVProfileUpdate extends Partial<CVProfileCreate> { }
