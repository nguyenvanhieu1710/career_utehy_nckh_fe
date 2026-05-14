import { DollarSign, Briefcase, Clock } from "lucide-react";
import { Job } from "@/types/job";

type JobDescriptionProps = {
  job: Job;
};

export default function JobDescription({ job }: JobDescriptionProps) {
  return (
    <div className="bg-white p-6 mt-1">
      <div className="bg-white mt-1 mb-1">
        <div className="text-xl sm:text-2xl font-bold text-[#0C6A4E] mb-3">
          Chi tiết công việc
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-[#5C5C5C]">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gray-50 rounded-full">
              <DollarSign className="w-4 h-4 text-[#0C6A4E]" />
            </div>
            <div>
              <p className="text-gray-400">Mức lương</p>
              <p className="font-semibold text-gray-900">{job.salary_display || "---"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gray-50 rounded-full">
              <Briefcase className="w-4 h-4 text-[#0C6A4E]" />
            </div>
            <div>
              <p className="text-gray-400">Hình thức làm việc</p>
              <p className="font-semibold text-gray-900 capitalize">{job.work_arrangement || "---"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gray-50 rounded-full">
              <Clock className="w-4 h-4 text-[#0C6A4E]" />
            </div>
            <div>
              <p className="text-gray-400">Loại công việc</p>
              <p className="font-semibold text-gray-900 capitalize">{job.job_type || "---"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gray-50 rounded-full">
              <Briefcase className="w-4 h-4 text-[#0C6A4E]" />
            </div>
            <div>
              <p className="text-gray-400">Cấp bậc</p>
              <p className="font-semibold text-gray-900">{job.job_level || "---"}</p>
            </div>
          </div>
        </div>
      </div>

      {job.description && (
        <div className="mt-8">
          <h3 className="text-lg font-bold text-gray-900 mb-3 border-l-4 border-[#0C6A4E] pl-3">
            Mô tả công việc
          </h3>
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {job.description}
          </div>
        </div>
      )}

      {job.requirements && (
        <div className="mt-8">
          <h3 className="text-lg font-bold text-gray-900 mb-3 border-l-4 border-[#0C6A4E] pl-3">
            Yêu cầu công việc
          </h3>
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {job.requirements}
          </div>
        </div>
      )}

      {job.benefits && (
        <div className="mt-8">
          <h3 className="text-lg font-bold text-gray-900 mb-3 border-l-4 border-[#0C6A4E] pl-3">
            Quyền lợi
          </h3>
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {job.benefits}
          </div>
        </div>
      )}

      {job.skills && job.skills.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-bold text-gray-900 mb-3 border-l-4 border-[#0C6A4E] pl-3">
            Kỹ năng
          </h3>
          <div className="flex flex-wrap gap-2">
            {job.skills.map((skill, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-green-50 text-[#0C6A4E] rounded-full text-sm font-medium border border-green-100"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
