"use client";

import { DollarSign, Briefcase, MapPin, Layers } from "lucide-react";
import { PublicJobDetail } from "@/services/public";

interface JobDescriptionProps {
  job: PublicJobDetail;
}

const JOB_TYPE_LABEL: Record<string, string> = {
  "full-time": "Toàn thời gian",
  "part-time": "Bán thời gian",
  intern: "Thực tập sinh",
  freelance: "Freelance",
  contract: "Hợp đồng",
};

const WORK_ARRANGEMENT_LABEL: Record<string, string> = {
  remote: "Làm việc từ xa",
  hybrid: "Hybrid",
  onsite: "Tại văn phòng",
};

function looksLikeHtml(text?: string | null): boolean {
  if (!text) return false;
  return /<\/?(p|br|ul|ol|li|strong|em|h[1-6]|div|span|a|table|tr|td)\b/i.test(text);
}

function buildSalary(job: PublicJobDetail): string | null {
  if (job.salary_display) return job.salary_display;
  if (job.salary_min && job.salary_max) {
    return `${job.salary_min.toLocaleString("vi-VN")} – ${job.salary_max.toLocaleString("vi-VN")} VND`;
  }
  if (job.salary_min) return `Từ ${job.salary_min.toLocaleString("vi-VN")} VND`;
  if (job.salary_max) return `Đến ${job.salary_max.toLocaleString("vi-VN")} VND`;
  return null;
}

function RichSection({
  title,
  content,
}: {
  title: string;
  content?: string | null;
}) {
  if (!content || !content.trim()) return null;
  return (
    <div className="mt-6">
      <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
        {title}
      </h3>
      {looksLikeHtml(content) ? (
        <div
          className="prose prose-sm sm:prose-base max-w-none text-gray-700 leading-relaxed prose-ul:list-disc prose-ul:ml-6 prose-ol:list-decimal prose-ol:ml-6"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : (
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {content}
        </p>
      )}
    </div>
  );
}

export default function JobDescription({ job }: JobDescriptionProps) {
  const salary = buildSalary(job);
  const jobTypeLabel = job.job_type
    ? JOB_TYPE_LABEL[job.job_type] || job.job_type
    : null;
  const workArrangementLabel = job.work_arrangement
    ? WORK_ARRANGEMENT_LABEL[job.work_arrangement] || job.work_arrangement
    : null;

  const skills = (job.skills || []).filter(Boolean);

  return (
    <div className="bg-white p-6 mt-1">
      <div className="bg-white mt-1 mb-1">
        <div className="text-xl sm:text-2xl font-bold text-[#0C6A4E] mb-1">
          Chi tiết công việc
        </div>
        <div className="flex flex-col gap-1 text-xs sm:text-sm text-[#5C5C5C]">
          {salary && (
            <div className="flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
              <span>Thu nhập: {salary}</span>
            </div>
          )}
          {jobTypeLabel && (
            <div className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
              <span>Loại hình: {jobTypeLabel}</span>
            </div>
          )}
          {job.job_level && (
            <div className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
              <span>Chức vụ: {job.job_level}</span>
            </div>
          )}
          {workArrangementLabel && (
            <div className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
              <span>Hình thức: {workArrangementLabel}</span>
            </div>
          )}
          {job.years_of_experience != null && (
            <div className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
              <span>Kinh nghiệm: {job.years_of_experience} năm</span>
            </div>
          )}
          {job.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
              <span>
                Địa điểm: {job.location}
                {job.other_locations && job.other_locations.length > 0
                  ? `, ${job.other_locations.join(", ")}`
                  : ""}
              </span>
            </div>
          )}
        </div>
      </div>

      <RichSection title="Mô tả công việc" content={job.description} />
      <RichSection title="Yêu cầu" content={job.requirements} />
      <RichSection title="Quyền lợi" content={job.benefits} />

      {skills.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
            Kỹ năng
          </h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, i) => (
              <span
                key={`${skill}-${i}`}
                className="px-3 py-1 bg-[#0C6A4E]/10 text-[#0C6A4E] text-sm font-medium rounded-full border border-[#0C6A4E]/20"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {job.category_title && (
        <div className="mt-6">
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
            Ngành nghề
          </h3>
          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full border border-gray-200">
            {job.category_title}
          </span>
        </div>
      )}
    </div>
  );
}
