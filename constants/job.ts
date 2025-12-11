import { JobType, JobStatusType } from "@/types/job";

// Job Type Options for Select/Dropdown
export const JOB_TYPE_OPTIONS: { value: JobType; label: string }[] = [
  { value: "full-time", label: "Toàn thời gian" },
  { value: "part-time", label: "Bán thời gian" },
  { value: "intern", label: "Thực tập" },
  { value: "freelance", label: "Freelance" },
  { value: "contract", label: "Hợp đồng" },
];

// Job Status Options for Select/Dropdown
export const JOB_STATUS_OPTIONS: {
  value: JobStatusType;
  label: string;
  color: string;
}[] = [
  { value: "pending", label: "Chờ duyệt", color: "orange" },
  { value: "approved", label: "Đã duyệt", color: "green" },
  { value: "rejected", label: "Từ chối", color: "red" },
];

// Work Arrangement Options
export const WORK_ARRANGEMENT_OPTIONS = [
  { value: "onsite", label: "Tại văn phòng" },
  { value: "remote", label: "Làm việc từ xa" },
  { value: "hybrid", label: "Kết hợp" },
];

// Company Size Options
export const COMPANY_SIZE_OPTIONS = [
  { value: "startup", label: "Startup (1-10 nhân viên)" },
  { value: "small", label: "Nhỏ (11-50 nhân viên)" },
  { value: "medium", label: "Trung bình (51-200 nhân viên)" },
  { value: "large", label: "Lớn (201-1000 nhân viên)" },
  { value: "enterprise", label: "Doanh nghiệp (1000+ nhân viên)" },
];

// Industry Options
export const INDUSTRY_OPTIONS = [
  { value: "technology", label: "Công nghệ thông tin" },
  { value: "finance", label: "Tài chính - Ngân hàng" },
  { value: "healthcare", label: "Y tế - Sức khỏe" },
  { value: "education", label: "Giáo dục - Đào tạo" },
  { value: "manufacturing", label: "Sản xuất - Chế tạo" },
  { value: "retail", label: "Bán lẻ - Thương mại" },
  { value: "consulting", label: "Tư vấn" },
  { value: "media", label: "Truyền thông - Quảng cáo" },
  { value: "real-estate", label: "Bất động sản" },
  { value: "logistics", label: "Vận tải - Logistics" },
  { value: "other", label: "Khác" },
];

// Salary Range Options (in VND millions)
export const SALARY_RANGES = [
  { min: 0, max: 10, label: "Dưới 10 triệu" },
  { min: 10, max: 20, label: "10 - 20 triệu" },
  { min: 20, max: 30, label: "20 - 30 triệu" },
  { min: 30, max: 50, label: "30 - 50 triệu" },
  { min: 50, max: 100, label: "50 - 100 triệu" },
  { min: 100, max: null, label: "Trên 100 triệu" },
];

// Popular Skills for Jobs
export const POPULAR_SKILLS = [
  "JavaScript",
  "TypeScript",
  "React",
  "Vue.js",
  "Angular",
  "Node.js",
  "Python",
  "Java",
  "C#",
  "PHP",
  "Go",
  "Rust",
  "HTML",
  "CSS",
  "SASS",
  "Tailwind CSS",
  "MySQL",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "AWS",
  "Azure",
  "Google Cloud",
  "Docker",
  "Kubernetes",
  "Git",
  "CI/CD",
  "Agile",
  "Scrum",
  "UI/UX Design",
  "Figma",
  "Adobe Creative Suite",
  "Project Management",
  "Team Leadership",
  "Communication",
];

// Vietnamese Cities for Location
export const VIETNAM_CITIES = [
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Đà Nẵng",
  "Hải Phòng",
  "Cần Thơ",
  "Biên Hòa",
  "Huế",
  "Nha Trang",
  "Buôn Ma Thuột",
  "Quy Nhon",
  "Vũng Tàu",
  "Nam Định",
  "Phan Thiết",
  "Long Xuyên",
  "Hạ Long",
  "Thái Nguyên",
  "Thanh Hóa",
  "Rạch Giá",
  "Cam Ranh",
  "Vinh",
];

// Helper functions
export const getJobTypeLabel = (jobType: JobType): string => {
  return (
    JOB_TYPE_OPTIONS.find((option) => option.value === jobType)?.label ||
    jobType
  );
};

export const getJobStatusLabel = (status: JobStatusType): string => {
  return (
    JOB_STATUS_OPTIONS.find((option) => option.value === status)?.label ||
    status
  );
};

export const getJobStatusColor = (status: JobStatusType): string => {
  return (
    JOB_STATUS_OPTIONS.find((option) => option.value === status)?.color ||
    "gray"
  );
};

export const formatSalary = (
  min?: number | null,
  max?: number | null
): string => {
  if (!min && !max) return "Thỏa thuận";
  if (min && max) return `${min} - ${max} triệu VND`;
  if (min) return `Từ ${min} triệu VND`;
  if (max) return `Đến ${max} triệu VND`;
  return "Thỏa thuận";
};

export const formatJobLocation = (
  location?: string | null,
  otherLocations?: string[] | null
): string => {
  const locations = [];
  if (location) locations.push(location);
  if (otherLocations && otherLocations.length > 0) {
    locations.push(...otherLocations);
  }

  if (locations.length === 0) return "Không xác định";
  if (locations.length === 1) return locations[0];
  if (locations.length <= 3) return locations.join(", ");
  return `${locations.slice(0, 2).join(", ")} và ${
    locations.length - 2
  } địa điểm khác`;
};
