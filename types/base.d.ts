// Base types used across the application

type UUID = string;
type DateTime = string;

export interface BaseModel {
  id: UUID;
  action_status: 'active' | 'inactive' | 'deleted';
  created_at: DateTime;
  updated_at: DateTime;
  created_by_user_id: UUID | null;
  updated_by_user_id: UUID | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
}
