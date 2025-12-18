export const mockJobData = {
  id: "job-001",
  title: "Giáo viên Tiếng Anh online",
  company: {
    id: "company-001",
    name: "Công ty cổ phần Dream Viet Education - Kyna English",
    logo: "/logo/kyna-english.png",
    location: "Toàn quốc",
  },
  location: "Toàn quốc",
  salary: "15 - 25 triệu VNĐ",
  job_type: "full-time" as const,
  work_arrangement: "remote" as const,
  posted_date: "2024-12-10",
  description: "Tuyển dụng giáo viên tiếng Anh online với mức lương hấp dẫn",
  requirements: ["Bằng cử nhân tiếng Anh", "Kinh nghiệm giảng dạy 2+ năm"],
  skills: ["Tiếng Anh", "Giảng dạy", "Giao tiếp"],
};

export const mockMatchData = {
  overallScore: 82,
  status: "Rất phù hợp",
  statusColor: "bg-green-500",
  breakdown: {
    skills: {
      score: 90,
      label: "Kỹ năng chuyên môn",
      trend: "up" as const,
      improvement: 5,
      description:
        "Bạn có kỹ năng chuyên môn vượt trội, đặc biệt về tiếng Anh và giảng dạy.",
    },
    experience: {
      score: 50,
      label: "Kinh nghiệm làm việc",
      trend: "stable" as const,
      description:
        "Cần tích lũy thêm kinh nghiệm thực tế trong lĩnh vực giảng dạy.",
    },
    education: {
      score: 100,
      label: "Học vấn",
      trend: "stable" as const,
      description: "Bằng cấp hoàn toàn phù hợp với yêu cầu công việc.",
    },
    softSkills: {
      score: 82,
      label: "Kỹ năng mềm",
      trend: "up" as const,
      improvement: 3,
      description:
        "Kỹ năng giao tiếp và làm việc nhóm tốt, phù hợp với môi trường giảng dạy.",
    },
    certificates: {
      score: 90,
      label: "Chứng chỉ",
      trend: "stable" as const,
      description: "Có đầy đủ chứng chỉ tiếng Anh cần thiết cho vị trí này.",
    },
    language: {
      score: 90,
      label: "Ngoại ngữ",
      trend: "up" as const,
      improvement: 2,
      description: "Trình độ tiếng Anh xuất sắc, là điểm mạnh lớn nhất.",
    },
  },
};

export const mockSkillsData = [
  {
    name: "Tiếng Anh giao tiếp",
    required: true,
    userLevel: 95,
    requiredLevel: 80,
    status: "excellent" as const,
    category: "language" as const,
  },
  {
    name: "Kỹ năng giảng dạy",
    required: true,
    userLevel: 85,
    requiredLevel: 90,
    status: "good" as const,
    category: "technical" as const,
  },
  {
    name: "Kinh nghiệm làm việc",
    required: true,
    userLevel: 40,
    requiredLevel: 70,
    status: "needs_improvement" as const,
    category: "technical" as const,
  },
  {
    name: "Kỹ năng giao tiếp",
    required: false,
    userLevel: 80,
    requiredLevel: 70,
    status: "excellent" as const,
    category: "soft" as const,
  },
  {
    name: "IELTS 7.5+",
    required: true,
    userLevel: 90,
    requiredLevel: 75,
    status: "excellent" as const,
    category: "certification" as const,
  },
];

export const mockChartData = [
  { label: "Kỹ năng chuyên môn", value: 90, maxValue: 100, color: "#22c55e" },
  { label: "Kinh nghiệm làm việc", value: 50, maxValue: 100, color: "#f59e0b" },
  { label: "Học vấn", value: 100, maxValue: 100, color: "#22c55e" },
  { label: "Kỹ năng mềm", value: 82, maxValue: 100, color: "#22c55e" },
  { label: "Chứng chỉ", value: 90, maxValue: 100, color: "#22c55e" },
  { label: "Ngoại ngữ", value: 90, maxValue: 100, color: "#22c55e" },
];

export const mockRadarData = [
  { label: "Kỹ thuật", value: 90 },
  { label: "Kinh nghiệm", value: 50 },
  { label: "Học vấn", value: 100 },
  { label: "Kỹ năng mềm", value: 82 },
  { label: "Chứng chỉ", value: 90 },
  { label: "Ngoại ngữ", value: 90 },
];

export const mockSuggestions = [
  {
    id: "1",
    type: "strength" as const,
    category: "language" as const,
    title: "Trình độ tiếng Anh xuất sắc",
    description:
      "Bạn có trình độ tiếng Anh rất tốt, vượt xa yêu cầu của công việc. Đây là điểm mạnh lớn giúp bạn nổi bật.",
    priority: "high" as const,
  },
  {
    id: "2",
    type: "improvement" as const,
    category: "experience" as const,
    title: "Cần tích lũy thêm kinh nghiệm giảng dạy",
    description:
      "Kinh nghiệm giảng dạy của bạn chưa đạt yêu cầu. Hãy tìm cơ hội thực hành và tích lũy kinh nghiệm thêm.",
    priority: "high" as const,
    estimatedTime: "6-12 tháng",
    resources: [
      {
        name: "Khóa học Phương pháp giảng dạy",
        url: "#",
        type: "course" as const,
      },
      {
        name: "Thực tập giảng dạy",
        url: "#",
        type: "practice" as const,
      },
    ],
  },
  {
    id: "3",
    type: "course" as const,
    category: "technical" as const,
    title: "Khóa học Online Teaching Methods",
    description:
      "Nâng cao kỹ năng giảng dạy trực tuyến với các phương pháp hiện đại và công cụ hỗ trợ.",
    priority: "medium" as const,
    estimatedTime: "2-3 tháng",
    resources: [
      {
        name: "Coursera - Online Teaching",
        url: "#",
        type: "course" as const,
      },
    ],
  },
  {
    id: "4",
    type: "certification" as const,
    category: "technical" as const,
    title: "Chứng chỉ TESOL/TEFL",
    description:
      "Có thêm chứng chỉ giảng dạy tiếng Anh sẽ tăng cường độ tin cậy và cơ hội nghề nghiệp.",
    priority: "medium" as const,
    estimatedTime: "3-6 tháng",
    resources: [
      {
        name: "TESOL Certificate Program",
        url: "#",
        type: "certification" as const,
      },
    ],
  },
];

export const mockFilterGroups = [
  {
    id: "categories",
    label: "Loại kỹ năng",
    multiSelect: true,
    options: [
      { id: "technical", label: "Kỹ năng kỹ thuật", count: 4 },
      { id: "soft", label: "Kỹ năng mềm", count: 3 },
      { id: "language", label: "Ngoại ngữ", count: 2 },
      { id: "certification", label: "Chứng chỉ", count: 2 },
    ],
  },
  {
    id: "status",
    label: "Trạng thái",
    multiSelect: true,
    options: [
      { id: "excellent", label: "Xuất sắc", count: 3, color: "green" },
      { id: "good", label: "Tốt", count: 2, color: "blue" },
      {
        id: "needs_improvement",
        label: "Cần cải thiện",
        count: 1,
        color: "yellow",
      },
      { id: "missing", label: "Chưa có", count: 0, color: "red" },
    ],
  },
];

export const mockQuickFilters = [
  { id: "strengths", label: "Điểm mạnh", icon: "🎯", active: false },
  { id: "improvements", label: "Cần cải thiện", icon: "🔧", active: false },
  { id: "required", label: "Bắt buộc", icon: "⚡", active: false },
  { id: "optional", label: "Tùy chọn", icon: "💡", active: false },
];
