import { BaseModel } from "./base";
import { User } from "./user";

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
  proficiency: "basic" | "conversational" | "professional" | "native";
}

export interface CVProfile extends BaseModel {
  user_id: string;
  name: string;
  title?: string | null;
  subtitle?: string | null;
  primary_color?: string | null;
  sections: string;
  design_data?: string;
}

export interface CVProfileCreate {
  title: string;
  summary?: string;
  projects?: Project[];
  certifications?: Certification[];
  languages?: LanguageProficiency[];
  file_url?: string;
}

export type CVProfileUpdate = Partial<CVProfileCreate>;

export interface TextStyle {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  color: string;
}

export interface SectionItem {
  text: string;
  editing: boolean;
  tempText: string;
  style: TextStyle;
  children: SectionItem[];
  expanded: boolean;
}

export interface Section {
  id: string;
  title: string;
  open: boolean;
  items: SectionItem[];
  adding: boolean;
  editingIndex: number | null;
  x: number;
  y: number;
  size: SectionSize;
}

export interface SectionSize {
  width: number;
  height: number;
}
