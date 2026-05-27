"use client";

import { motion } from "framer-motion";
import {
  MapPin,
  Briefcase,
  Clock,
  Star,
  Heart,
  ExternalLink,
} from "lucide-react";
import { Job } from "@/types/job";

interface JobCardProps {
  job: Job;
  index?: number;
  onFavorite?: (jobId: string, isFavorited: boolean) => void;
  onApply?: (jobId: string) => void;
  onView?: (jobId: string) => void;
  isFavorited?: boolean;
  className?: string;
}

export const JobCard = ({
  job,
  index = 0,
  onFavorite,
  onApply,
  onView,
  isFavorited = false,
  className = "",
}: JobCardProps) => {
  const formatJobType = (jobType: string) => {
    const typeMap: Record<string, string> = {
      "full-time": "Toàn thời gian",
      "part-time": "Bán thời gian",
      contract: "Hợp đồng",
      internship: "Thực tập",
    };
    return typeMap[jobType] || jobType;
  };

  const formatWorkArrangement = (arrangement: string) => {
    const arrangementMap: Record<string, string> = {
      remote: "Làm việc từ xa",
      hybrid: "Hybrid",
      onsite: "Tại văn phòng",
    };
    return arrangementMap[arrangement] || arrangement;
  };

  const formatPostedDate = (dateString?: string) => {
    if (!dateString) return "---";
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffInDays === 0) return "Hôm nay";
    if (diffInDays === 1) return "Hôm qua";
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} tuần trước`;
    return date.toLocaleDateString("vi-VN");
  };

  const handleCardClick = () => {
    onView?.(job.id);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavorite?.(job.id, !isFavorited);
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onApply?.(job.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer group ${className}`}
      onClick={handleCardClick}
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Company Logo */}
          <div className="w-16 h-16 bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:from-green-100 group-hover:to-green-200 transition-colors">
            {job.company.logo ? (
              <img
                src={job.company.logo}
                alt={`${job.company.name} logo`}
                className="w-12 h-12 object-contain rounded"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  target.nextElementSibling?.classList.remove("hidden");
                }}
              />
            ) : null}
            <Briefcase
              className={`h-8 w-8 text-green-600 ${
                job.company.logo ? "hidden" : ""
              }`}
            />
          </div>

          {/* Job Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-4">
                {/* Title and Badges */}
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-1">
                    {job.title}
                  </h3>
                  {job.is_featured && (
                    <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 text-xs font-medium px-2 py-1 rounded-full">
                      <Star className="h-3 w-3 fill-current" />
                      Nổi bật
                    </div>
                  )}
                  {job.is_urgent && (
                    <span className="bg-red-50 text-red-700 text-xs font-medium px-2 py-1 rounded-full">
                      Gấp
                    </span>
                  )}
                </div>

                {/* Company Row */}
                <div className="flex items-center gap-2 mb-3 min-w-0">
                  <p
                    className="text-gray-600 font-medium"
                    title={job.company.name}
                  >
                    {job.company.name}
                  </p>
                </div>

                {/* Job Location*/}
                <div className="flex items-center gap-1 text-sm text-gray-500 mb-1.5 max-w-[90%]">
                  <MapPin className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  <span className="line-clamp-1 flex-1" title={job.location}>
                    {job.location}
                  </span>
                </div>

                {/* Other Job Details */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    <span className="whitespace-nowrap">
                      {formatPostedDate(job.posted_at || job.posted_date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    <span className="whitespace-nowrap">
                      {formatJobType(job.job_type)}
                    </span>
                  </div>
                  {job.work_arrangement && (
                    <div className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
                      {formatWorkArrangement(job.work_arrangement)}
                    </div>
                  )}
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {job.skills.slice(0, 4).map((skill) => (
                    <span
                      key={skill}
                      className="bg-gray-50 text-gray-700 text-xs font-medium px-2 py-1 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                  {job.skills.length > 4 && (
                    <span className="text-gray-500 text-xs font-medium px-2 py-1">
                      +{job.skills.length - 4} kỹ năng khác
                    </span>
                  )}
                </div>
              </div>

              {/* Right Side - Salary & Actions */}
              <div className="text-right flex-shrink-0">
                {/* Salary */}
                <div className="mb-3">
                  <div className="text-lg font-bold text-green-600 mb-1 whitespace-nowrap">
                    {job.salary_display || job.salary}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleApplyClick}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium min-w-[100px] flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Ứng tuyển
                  </button>

                  <button
                    onClick={handleFavoriteClick}
                    className={`border rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                      isFavorited
                        ? "border-red-200 text-red-600 bg-red-50 hover:bg-red-100"
                        : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <Heart
                      className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`}
                    />
                    {isFavorited ? "Đã yêu thích" : "Yêu thích"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
