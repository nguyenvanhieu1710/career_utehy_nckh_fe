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
  title: string;
  summary: string | null;
  projects: Project[] | null;
  certifications: Certification[] | null;
  languages: LanguageProficiency[] | null;
  file_url: string | null;
  
  // Relationships
  user?: User;
}

export interface CVProfileCreate {
  title: string;
  summary?: string;
  projects?: Project[];
  certifications?: Certification[];
  languages?: LanguageProficiency[];
  file_url?: string;
}

export interface CVProfileUpdate extends Partial<CVProfileCreate> {}
