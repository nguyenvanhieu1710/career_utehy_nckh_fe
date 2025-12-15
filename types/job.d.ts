export interface Job {
  id: string;
  title: string;
  company: {
    id: string;
    name: string;
    logo?: string;
    location?: string;
  };
  location: string;
  salary?: string;
  jobType: "full-time" | "part-time" | "contract" | "internship";
  workArrangement: "remote" | "hybrid" | "onsite";
  postedDate: string;
  description: string;
  requirements: string[];
  skills: string[];
  benefits?: string[];
  isUrgent?: boolean;
  isFeatured?: boolean;
  applicationCount?: number;
}

export interface JobFilters {
  search?: string;
  location?: string;
  jobTypes?: string[];
  workArrangements?: string[];
  salaryRange?: {
    min?: number;
    max?: number;
  };
  skills?: string[];
  postedWithin?: number; // days
  companySize?: string[];
  experienceLevel?: string[];
}

export interface JobSearchState {
  jobs: Job[];
  filters: JobFilters;
  loading: boolean;
  hasMore: boolean;
  page: number;
  total: number;
}

// Constants for UI
export const JOB_TYPES = [
  { value: "full-time", label: "Toàn thời gian" },
  { value: "part-time", label: "Bán thời gian" },
  { value: "contract", label: "Hợp đồng" },
  { value: "internship", label: "Thực tập" },
];

export const WORK_ARRANGEMENTS = [
  { value: "remote", label: "Làm việc từ xa" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "Tại văn phòng" },
];

export const SALARY_RANGES = [
  { label: "Dưới 10 triệu", min: 0, max: 10 },
  { label: "10 - 20 triệu", min: 10, max: 20 },
  { label: "20 - 30 triệu", min: 20, max: 30 },
  { label: "30 - 50 triệu", min: 30, max: 50 },
  { label: "Trên 50 triệu", min: 50, max: null },
];

export const POSTED_WITHIN = [
  { value: 1, label: "Hôm nay" },
  { value: 3, label: "3 ngày qua" },
  { value: 7, label: "1 tuần qua" },
  { value: 30, label: "1 tháng qua" },
];

export const COMPANY_SIZES = [
  { value: "startup", label: "Startup (1-50)" },
  { value: "small", label: "Nhỏ (51-200)" },
  { value: "medium", label: "Trung bình (201-1000)" },
  { value: "large", label: "Lớn (1000+)" },
];

export const EXPERIENCE_LEVELS = [
  { value: "entry", label: "Mới ra trường" },
  { value: "junior", label: "Junior (1-3 năm)" },
  { value: "mid", label: "Middle (3-5 năm)" },
  { value: "senior", label: "Senior (5+ năm)" },
  { value: "lead", label: "Lead/Manager" },
];
