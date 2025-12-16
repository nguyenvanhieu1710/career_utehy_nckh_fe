import { Job, JobFilters } from "@/types/job";

// Mock data for UI development
export const mockJobs: Job[] = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    company: {
      id: "comp1",
      name: "TechViet Solutions",
      logo: "/companies/techviet.png",
      location: "Hà Nội",
    },
    location: "Hà Nội",
    salary: "25 - 35 triệu VNĐ",
    jobType: "full-time",
    workArrangement: "hybrid",
    postedDate: "2024-12-14",
    description:
      "Chúng tôi đang tìm kiếm một Senior Frontend Developer có kinh nghiệm với React, TypeScript và Next.js để tham gia vào đội ngũ phát triển sản phẩm.",
    requirements: [
      "3+ năm kinh nghiệm với React/Next.js",
      "Thành thạo TypeScript",
      "Kinh nghiệm với Tailwind CSS",
      "Hiểu biết về responsive design",
    ],
    skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Git"],
    benefits: ["Bảo hiểm sức khỏe", "Thưởng hiệu suất", "Làm việc từ xa"],
    isFeatured: true,
    applicationCount: 45,
  },
  {
    id: "2",
    title: "Full Stack Developer",
    company: {
      id: "comp2",
      name: "Digital Innovation Hub",
      logo: "/companies/dih.png",
      location: "TP.HCM",
    },
    location: "TP.HCM",
    salary: "20 - 30 triệu VNĐ",
    jobType: "full-time",
    workArrangement: "onsite",
    postedDate: "2024-12-13",
    description:
      "Tham gia phát triển các ứng dụng web hiện đại với công nghệ mới nhất. Làm việc trong môi trường năng động và sáng tạo.",
    requirements: [
      "2+ năm kinh nghiệm full stack",
      "Thành thạo Node.js và React",
      "Kinh nghiệm với database (MongoDB/PostgreSQL)",
      "Hiểu biết về RESTful APIs",
    ],
    skills: ["Node.js", "React", "MongoDB", "Express.js", "Docker"],
    benefits: ["Lương tháng 13", "Team building", "Đào tạo kỹ năng"],
    isUrgent: true,
    applicationCount: 32,
  },
  {
    id: "3",
    title: "UI/UX Designer",
    company: {
      id: "comp3",
      name: "Creative Studio",
      logo: "/companies/creative.png",
      location: "Đà Nẵng",
    },
    location: "Đà Nẵng",
    salary: "15 - 25 triệu VNĐ",
    jobType: "full-time",
    workArrangement: "remote",
    postedDate: "2024-12-12",
    description:
      "Thiết kế giao diện người dùng cho các ứng dụng mobile và web. Tạo ra những trải nghiệm người dùng tuyệt vời.",
    requirements: [
      "2+ năm kinh nghiệm UI/UX",
      "Thành thạo Figma, Adobe XD",
      "Hiểu biết về design system",
      "Kỹ năng prototype và wireframe",
    ],
    skills: ["Figma", "Adobe XD", "Sketch", "Prototyping", "User Research"],
    benefits: [
      "Flexible working hours",
      "Creative environment",
      "Design tools provided",
    ],
    applicationCount: 28,
  },
  {
    id: "4",
    title: "DevOps Engineer",
    company: {
      id: "comp4",
      name: "CloudTech Vietnam",
      logo: "/companies/cloudtech.png",
      location: "Hà Nội",
    },
    location: "Hà Nội",
    salary: "30 - 45 triệu VNĐ",
    jobType: "full-time",
    workArrangement: "hybrid",
    postedDate: "2024-12-11",
    description:
      "Quản lý và tối ưu hóa hạ tầng cloud, triển khai CI/CD pipelines và đảm bảo tính ổn định của hệ thống.",
    requirements: [
      "3+ năm kinh nghiệm DevOps",
      "Thành thạo AWS/Azure",
      "Kinh nghiệm với Docker, Kubernetes",
      "Hiểu biết về monitoring và logging",
    ],
    skills: ["AWS", "Docker", "Kubernetes", "Jenkins", "Terraform"],
    benefits: ["High salary", "Stock options", "International projects"],
    isFeatured: true,
    applicationCount: 18,
  },
  {
    id: "5",
    title: "Mobile App Developer (React Native)",
    company: {
      id: "comp5",
      name: "MobileFirst Co.",
      logo: "/companies/mobilefirst.png",
      location: "TP.HCM",
    },
    location: "TP.HCM",
    salary: "18 - 28 triệu VNĐ",
    jobType: "full-time",
    workArrangement: "onsite",
    postedDate: "2024-12-10",
    description:
      "Phát triển ứng dụng mobile đa nền tảng với React Native. Tham gia vào các dự án thú vị cho khách hàng quốc tế.",
    requirements: [
      "2+ năm kinh nghiệm React Native",
      "Hiểu biết về iOS và Android development",
      "Kinh nghiệm với Redux/Context API",
      "Kỹ năng debug và optimize performance",
    ],
    skills: ["React Native", "Redux", "TypeScript", "iOS", "Android"],
    benefits: ["Performance bonus", "Learning budget", "Modern office"],
    applicationCount: 41,
  },
  {
    id: "6",
    title: "Data Analyst Intern",
    company: {
      id: "comp6",
      name: "DataInsights Corp",
      logo: "/companies/datainsights.png",
      location: "Hà Nội",
    },
    location: "Hà Nội",
    salary: "5 - 8 triệu VNĐ",
    jobType: "intern",
    workArrangement: "hybrid",
    postedDate: "2024-12-09",
    description:
      "Cơ hội thực tập tuyệt vời cho sinh viên muốn khám phá lĩnh vực phân tích dữ liệu và business intelligence.",
    requirements: [
      "Sinh viên năm 3, 4 hoặc mới tốt nghiệp",
      "Kiến thức cơ bản về SQL",
      "Hiểu biết về Excel/Google Sheets",
      "Đam mê với dữ liệu và phân tích",
    ],
    skills: ["SQL", "Excel", "Python", "Power BI", "Statistics"],
    benefits: [
      "Mentorship program",
      "Certificate",
      "Potential full-time offer",
    ],
    applicationCount: 67,
  },
  {
    id: "7",
    title: "Backend Developer (Node.js)",
    company: {
      id: "comp7",
      name: "ServerSide Solutions",
      logo: "/companies/serverside.png",
      location: "TP.HCM",
    },
    location: "TP.HCM",
    salary: "22 - 32 triệu VNĐ",
    jobType: "full-time",
    workArrangement: "remote",
    postedDate: "2024-12-08",
    description:
      "Xây dựng và maintain các API services, database design và tối ưu hóa performance cho các ứng dụng quy mô lớn.",
    requirements: [
      "3+ năm kinh nghiệm Node.js",
      "Thành thạo Express.js hoặc Fastify",
      "Kinh nghiệm với PostgreSQL/MongoDB",
      "Hiểu biết về microservices architecture",
    ],
    skills: ["Node.js", "Express.js", "PostgreSQL", "Redis", "AWS"],
    benefits: ["Remote work", "Flexible schedule", "Tech allowance"],
    isUrgent: true,
    applicationCount: 29,
  },
  {
    id: "8",
    title: "Product Manager",
    company: {
      id: "comp8",
      name: "InnovateTech",
      logo: "/companies/innovate.png",
      location: "Hà Nội",
    },
    location: "Hà Nội",
    salary: "35 - 50 triệu VNĐ",
    jobType: "full-time",
    workArrangement: "hybrid",
    postedDate: "2024-12-07",
    description:
      "Dẫn dắt phát triển sản phẩm từ ý tưởng đến triển khai. Làm việc chặt chẽ với team engineering và design.",
    requirements: [
      "3+ năm kinh nghiệm Product Management",
      "Hiểu biết về Agile/Scrum",
      "Kỹ năng phân tích và ra quyết định",
      "Kinh nghiệm với product analytics tools",
    ],
    skills: [
      "Product Strategy",
      "Agile",
      "Analytics",
      "Roadmapping",
      "Stakeholder Management",
    ],
    benefits: [
      "Leadership training",
      "Stock options",
      "International exposure",
    ],
    isFeatured: true,
    applicationCount: 23,
  },
];

// Note: Skills and locations are now available in @/constants/job
// Use POPULAR_SKILLS and VIETNAM_CITIES from constants instead

// Helper functions for mock data
export const getJobsByFilters = (
  filters: JobFilters,
  page: number = 1,
  limit: number = 10
) => {
  let filteredJobs = [...mockJobs];

  // Search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredJobs = filteredJobs.filter(
      (job) =>
        job.title.toLowerCase().includes(searchTerm) ||
        job.company.name.toLowerCase().includes(searchTerm) ||
        job.skills.some((skill) => skill.toLowerCase().includes(searchTerm))
    );
  }

  // Location filter
  if (filters.location) {
    filteredJobs = filteredJobs.filter((job) =>
      job.location.includes(filters.location!)
    );
  }

  // Job type filter
  if (filters.jobTypes && filters.jobTypes.length > 0) {
    filteredJobs = filteredJobs.filter((job) =>
      filters.jobTypes!.includes(job.jobType)
    );
  }

  // Work arrangement filter
  if (filters.workArrangements && filters.workArrangements.length > 0) {
    filteredJobs = filteredJobs.filter((job) =>
      filters.workArrangements!.includes(job.workArrangement)
    );
  }

  // Skills filter
  if (filters.skills && filters.skills.length > 0) {
    filteredJobs = filteredJobs.filter((job) =>
      filters.skills!.some((skill: string) =>
        job.skills.some((jobSkill) =>
          jobSkill.toLowerCase().includes(skill.toLowerCase())
        )
      )
    );
  }

  // Posted within filter
  if (filters.postedWithin) {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - filters.postedWithin);
    filteredJobs = filteredJobs.filter(
      (job) => new Date(job.postedDate) >= daysAgo
    );
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

  return {
    jobs: paginatedJobs,
    total: filteredJobs.length,
    hasMore: endIndex < filteredJobs.length,
    page,
    totalPages: Math.ceil(filteredJobs.length / limit),
  };
};
