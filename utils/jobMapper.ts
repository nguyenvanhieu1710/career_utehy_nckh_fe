import { Job, JobType } from "@/types/job";
import { JobMongo } from "@/services/jobMongo";

/**
 * Maps a JobMongo object from the backend/MongoDB to the Job interface used in the UI
 */
export const mapJobMongoToJob = (jobMongo: JobMongo): Job => {
  // Map job type string to supported JobType enum
  const mapJobType = (type?: string): JobType => {
    const t = (type || "").toLowerCase();
    if (t.includes("full") || t.includes("toàn thời gian")) return "full-time";
    if (t.includes("part") || t.includes("bán thời gian")) return "part-time";
    if (t.includes("intern") || t.includes("thực tập")) return "intern";
    if (t.includes("freelance") || t.includes("tự do")) return "freelance";
    if (t.includes("contract") || t.includes("hợp đồng")) return "contract";
    return "full-time"; // Default
  };

  // Map work arrangement
  const mapWorkArrangement = (
    remote?: boolean
  ): "remote" | "hybrid" | "onsite" => {
    if (remote) return "remote";
    // For now, we don't have hybrid info in JobMongo, default to onsite
    return "onsite";
  };

  return {
    id: jobMongo.id || "",
    title: jobMongo.title || "Không có tiêu đề",
    company: {
      id: jobMongo.company_id || "",
      name: jobMongo.company_name || "Công ty ẩn danh",
      logo: (jobMongo.company_logo as string) || undefined,
      location: jobMongo.location, // Using job location as fallback for company location
    },
    location: jobMongo.location || "Việt Nam",
    salary: jobMongo.salaryDisplay || "Thỏa thuận",
    salary_min: jobMongo.salaryMin,
    salary_max: jobMongo.salaryMax,
    job_type: mapJobType(jobMongo.jobType),
    work_arrangement: mapWorkArrangement(jobMongo.remoteAllowed),
    posted_date: jobMongo.createdAt || new Date().toISOString(),
    description: jobMongo.description || "",
    requirements: jobMongo.requirements || [],
    skills: jobMongo.skills || [],
    benefits: jobMongo.benefits || [],
    is_featured: jobMongo.featured || false,
    is_urgent: (jobMongo.is_urgent as boolean) || false,
    application_count: (jobMongo.application_count as number) || 0,
    status: (jobMongo.status as any) || "approved",
    application_url: (jobMongo.applicationUrl as string) || "",
  };
};

/**
 * Maps a list of JobMongo objects
 */
export const mapJobMongoListToJobList = (jobs: JobMongo[]): Job[] => {
  return jobs.map(mapJobMongoToJob);
};
