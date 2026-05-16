"use client";

import { useState, useEffect } from "react";
import SectionTitle from "@/components/common/SectionTitle";
import JobCard from "@/components/common/JobCard";
import PaginationArrows from "@/components/common/PaginationArrows";
import { jobAPI } from "@/services/job";
import { Loader2 } from "lucide-react";

// Mock data as fallback
const MOCK_HOT_JOBS = [
  {
    job_id: "job-001",
    logo: "/logo/kyna-english.png",
    title: "Giáo viên Tiếng Anh online",
    company: "Công ty cổ phần Dream Viet Education - Kyna English",
    location: "Toàn quốc",
  },
  {
    job_id: "job-002",
    logo: "/logo/mavin.jpg",
    title: "Chuyên viên Pháp chế",
    company: "Công ty cổ phần Tập đoàn Mavin",
    location: "Hà Nội",
  },
  {
    job_id: "job-003",
    logo: "/logo/arian-holding.jpg",
    title: "Thực tập sinh Nhân sự",
    company: "Công ty cổ phần Bất động sản AsianHolding",
    location: "Hồ Chí Minh",
  },
  {
    job_id: "job-004",
    logo: "/logo/avepoint.png",
    title: "Intern/Junior/Middle QA/Tester",
    company: "Công ty TNHH AvePoint",
    location: "Hà Nội, Đà Nẵng",
  },
  {
    job_id: "job-005",
    logo: "/logo/x-media.png",
    title: "Chuyên viên tuyển dụng",
    company: "Công ty cổ phần X-Media",
    location: "Toàn quốc",
  },
  {
    job_id: "job-006",
    logo: "/logo/funtap.png",
    title: "Senior Unity Developer",
    company: "Công ty Cổ phần Funtap",
    location: "Hà Nội, Hải Phòng",
  },
];

export default function HotJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotJobs = async () => {
      try {
        // Fetch top 6 highest salary jobs
        const response = await jobAPI.getJobs({
          page: 1,
          row: 6,
          sortBy: "salary",
          sortOrder: "desc",
        });

        if (response?.data && response.data.length > 0) {
          // Map real data
          const mappedJobs = response.data.map((j: any) => ({
            job_id: j.id,
            title: j.title,
            company: j.company?.name || "Đang cập nhật",
            logo:
              j.company?.logo_url ||
              j.company?.logo ||
              j.image_url ||
              "/default-job.png",
            location: j.location || "Toàn quốc",
            image_url: j.image_url,
            url_source: j.url_source,
          }));
          setJobs(mappedJobs);
        } else {
          setJobs(MOCK_HOT_JOBS);
        }
      } catch (error) {
        console.error("Failed to fetch hot jobs, using fallback:", error);
        setJobs(MOCK_HOT_JOBS);
      } finally {
        setLoading(false);
      }
    };
    fetchHotJobs();
  }, []);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <SectionTitle title="VIỆC LÀM HOT" />

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {jobs.map((job: any, index: number) => (
              <JobCard
                key={job.job_id || index}
                job_id={job.job_id}
                title={job.title}
                company={job.company}
                logo={job.image_url || job.logo || "/default-job.png"}
                location={job.location}
                url_source={job.url_source}
                index={index}
              />
            ))}
          </div>
        )}

        <div className="flex justify-center mt-12">
          <PaginationArrows />
        </div>
      </div>
    </section>
  );
}
