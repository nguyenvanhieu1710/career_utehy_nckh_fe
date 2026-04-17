"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  X,
  Briefcase,
  MapPin,
  Clock,
  Trash2,
  ExternalLink,
  Search,
} from "lucide-react";
import { Job } from "@/types/job";
import { Input } from "@/components/ui/input";

interface SavedJobsPanelProps {
  savedJobs: Job[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveJob: (jobId: string) => void;
  onViewJob: (jobId: string) => void;
  onApplyJob: (jobId: string) => void;
  className?: string;
}

export const SavedJobsPanel = ({
  savedJobs,
  isOpen,
  onClose,
  onRemoveJob,
  onViewJob,
  onApplyJob,
  className = "",
}: SavedJobsPanelProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "company" | "salary"
  >("newest");

  const formatPostedDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return "Hôm nay";
    if (diffInDays === 1) return "Hôm qua";
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} tuần trước`;
    return date.toLocaleDateString("vi-VN");
  };

  const formatJobType = (jobType: string) => {
    const typeMap: Record<string, string> = {
      "full-time": "Toàn thời gian",
      "part-time": "Bán thời gian",
      contract: "Hợp đồng",
      internship: "Thực tập",
    };
    return typeMap[jobType] || jobType;
  };

  // Filter and sort jobs
  const filteredAndSortedJobs = savedJobs
    .filter((job) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        job.title.toLowerCase().includes(query) ||
        job.company.name.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query) ||
        job.skills.some((skill) => skill.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.posted_at || b.posted_date).getTime() -
            new Date(a.posted_at || a.posted_date).getTime()
          );
        case "oldest":
          return (
            new Date(a.posted_at || a.posted_date).getTime() -
            new Date(b.posted_at || b.posted_date).getTime()
          );
        case "company":
          return a.company.name.localeCompare(b.company.name);
        case "salary":
          const getSalaryValue = (job: Job) => {
            if (job.salary?.includes("triệu")) {
              const matches = job.salary.match(/(\d+)/g);
              return matches ? parseInt(matches[matches.length - 1]) : 0;
            }
            return 0;
          };
          return getSalaryValue(b) - getSalaryValue(a);
        default:
          return 0;
      }
    });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col ${className}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Heart className="h-5 w-5 text-red-600 fill-current" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Việc làm đã yêu thích
                  </h2>
                  <p className="text-sm text-gray-600">
                    {savedJobs.length} việc làm đã yêu thích
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search and Filter */}
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Tìm kiếm trong việc làm đã lưu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-green-500 focus:ring-green-500 text-gray-900"
                  />
                </div>

                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value as
                        | "newest"
                        | "oldest"
                        | "company"
                        | "salary"
                    )
                  }
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white cursor-pointer"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="company">Theo công ty</option>
                  <option value="salary">Theo lương</option>
                </select>
              </div>

              {searchQuery && (
                <div className="text-sm text-gray-600">
                  Tìm thấy {filteredAndSortedJobs.length} kết quả cho &quot;
                  {searchQuery}&quot;
                </div>
              )}
            </div>

            {/* Job List */}
            <div className="flex-1 overflow-y-auto">
              {filteredAndSortedJobs.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {filteredAndSortedJobs.map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-6 hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-start gap-4">
                        {/* Company Logo */}
                        <div className="w-12 h-12 bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Briefcase className="h-6 w-6 text-green-600" />
                        </div>

                        {/* Job Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 pr-4">
                              <h3
                                className="font-semibold text-gray-900 hover:text-green-600 transition-colors cursor-pointer line-clamp-1"
                                onClick={() => onViewJob(job.id)}
                              >
                                {job.title}
                              </h3>
                              <p className="text-green-600 font-medium text-sm">
                                {job.company.name}
                              </p>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => onRemoveJob(job.id)}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                              title="Bỏ lưu"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Job Details */}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {job.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3" />
                              {formatJobType(job.job_type)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatPostedDate(job.posted_at || job.posted_date)}
                            </div>
                          </div>

                          {/* Salary */}
                          <div className="text-sm font-medium text-green-600 mb-3">
                            {job.salary_display || job.salary}
                          </div>

                          {/* Skills */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            {job.skills.slice(0, 3).map((skill) => (
                              <span
                                key={skill}
                                className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                            {job.skills.length > 3 && (
                              <span className="text-gray-500 text-xs">
                                +{job.skills.length - 3}
                              </span>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => onViewJob(job.id)}
                              className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                            >
                              Xem chi tiết
                            </button>
                            <button
                              onClick={() => onApplyJob(job.id)}
                              className="text-xs bg-green-600 text-white px-3 py-1 rounded-full hover:bg-green-700 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Ứng tuyển
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                /* Empty State */
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  {searchQuery ? (
                    <>
                      <Search className="h-12 w-12 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Không tìm thấy kết quả
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Không có việc làm nào phù hợp với từ khóa &quot;
                        {searchQuery}&quot;
                      </p>
                      <button
                        onClick={() => setSearchQuery("")}
                        className="text-green-600 hover:text-green-700 font-medium"
                      >
                        Xóa bộ lọc
                      </button>
                    </>
                  ) : (
                    <>
                      <Heart className="h-12 w-12 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Chưa có việc làm nào được lưu
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Lưu những việc làm yêu thích để xem lại sau
                      </p>
                      <button
                        onClick={onClose}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Khám phá việc làm
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {filteredAndSortedJobs.length > 0 && (
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    {filteredAndSortedJobs.length} việc làm đã yêu thích
                  </span>
                  <button
                    onClick={() => {
                      filteredAndSortedJobs.forEach((job) =>
                        onRemoveJob(job.id)
                      );
                    }}
                    className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                    Xóa tất cả
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
