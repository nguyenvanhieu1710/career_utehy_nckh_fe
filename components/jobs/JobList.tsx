"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, ArrowUpDown } from "lucide-react";
import { Job } from "@/types/job";
import { JobCard } from "./JobCard";

interface JobListProps {
  jobs: Job[];
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  onJobFavorite?: (jobId: string, isFavorited: boolean) => void;
  onJobApply?: (jobId: string) => void;
  onJobView?: (jobId: string) => void;
  favoriteJobIds?: string[];
  total?: number;
  className?: string;
}


type SortOption = "newest" | "salary" | "relevant" | "company";

export const JobList = ({
  jobs,
  loading = false,
  onLoadMore,
  hasMore = false,
  onJobFavorite,
  onJobApply,
  onJobView,
  favoriteJobIds = [],
  total = 0,
  className = "",
}: JobListProps) => {

  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const sortOptions = [
    { value: "newest", label: "Mới nhất" },
    { value: "salary", label: "Lương cao nhất" },
    { value: "relevant", label: "Phù hợp nhất" },
    { value: "company", label: "Theo công ty" },
  ];

  const getSortedJobs = () => {
    const sortedJobs = [...jobs];

    switch (sortBy) {
      case "newest":
        return sortedJobs.sort(
          (a, b) =>
            new Date(b.posted_date).getTime() -
            new Date(a.posted_date).getTime()
        );
      case "salary":
        return sortedJobs.sort((a, b) => {
          const getSalaryValue = (job: Job) => {
            if (job.salary?.includes("triệu")) {
              const matches = job.salary.match(/(\d+)/g);
              return matches ? parseInt(matches[matches.length - 1]) : 0;
            }
            return 0;
          };
          return getSalaryValue(b) - getSalaryValue(a);
        });
      case "company":
        return sortedJobs.sort((a, b) =>
          a.company.name.localeCompare(b.company.name)
        );
      case "relevant":
        // Sort by featured first, then by application count
        return sortedJobs.sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return (b.application_count || 0) - (a.application_count || 0);
        });
      default:
        return sortedJobs;
    }
  };

  const sortedJobs = getSortedJobs();

  const handleFavorite = (jobId: string, isFavorited: boolean) => {
    onJobFavorite?.(jobId, isFavorited);
  };

  const handleApply = (jobId: string) => {
    onJobApply?.(jobId);
  };

  const handleView = (jobId: string) => {
    onJobView?.(jobId);
  };

  return (
    <div className={className}>
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        {/* Results Count */}
        <div className="text-gray-600">
          Hiển thị <span className="font-medium">{jobs.length}</span> trong số{" "}
          <span className="font-medium">{total.toLocaleString()}</span> việc làm
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white cursor-pointer"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>


        </div>
      </div>

      {/* Job Cards */}
      {loading && jobs.length === 0 ? (
        // Loading skeleton
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="flex gap-4 mb-3">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="flex gap-2 mb-3">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-18"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="text-right">
                  <div className="h-6 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-16 mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : sortedJobs.length > 0 ? (
        <div className="space-y-4">
          {sortedJobs.map((job, index) => (
            <JobCard
              key={job.id}
              job={job}
              index={index}
              onFavorite={handleFavorite}
              onApply={handleApply}
              onView={handleView}
              isFavorited={favoriteJobIds.includes(job.id)}
              className=""
            />
          ))}
        </div>
      ) : (
        // No Results
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="h-12 w-12 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Không tìm thấy việc làm phù hợp
          </h3>
          <p className="text-gray-600 mb-4">
            Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc của bạn
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="text-sm text-gray-500">Gợi ý:</span>
            {["React", "Node.js", "Python", "Frontend", "Backend"].map(
              (suggestion) => (
                <button
                  key={suggestion}
                  className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-green-100 hover:text-green-700 transition-colors"
                  onClick={() => {
                    // This would trigger a new search with the suggestion
                    // onSearch?.(suggestion);
                  }}
                >
                  {suggestion}
                </button>
              )
            )}
          </div>
        </motion.div>
      )}

      {/* Load More Button */}
      {hasMore && !loading && sortedJobs.length > 0 && (
        <div className="text-center mt-8">
          <button
            onClick={onLoadMore}
            className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium inline-flex items-center gap-2"
          >
            Xem thêm việc làm
            <span className="text-sm text-gray-500">
              ({total - jobs.length} còn lại)
            </span>
          </button>
        </div>
      )}

      {/* Loading More */}
      {loading && jobs.length > 0 && (
        <div className="text-center mt-8">
          <div className="inline-flex items-center gap-2 text-gray-600">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
            Đang tải thêm việc làm...
          </div>
        </div>
      )}

      {/* Results Summary */}
      {sortedJobs.length > 0 && !hasMore && !loading && (
        <div className="text-center mt-8 py-4 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            Đã hiển thị tất cả {total.toLocaleString()} việc làm
          </p>
        </div>
      )}
    </div>
  );
};
