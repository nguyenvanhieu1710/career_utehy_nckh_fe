"use client";

interface JobSkeletonLoaderProps {
  count?: number;
  viewMode?: "list" | "grid";
  className?: string;
}

export const JobSkeletonLoader = ({
  count = 6,
  viewMode = "list",
  className = "",
}: JobSkeletonLoaderProps) => {
  return (
    <div
      className={`${
        viewMode === "grid"
          ? "grid grid-cols-1 lg:grid-cols-2 gap-6"
          : "space-y-4"
      } ${className}`}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse"
        >
          <div className="flex items-start gap-4">
            {/* Company Logo Skeleton */}
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>

            {/* Content Skeleton */}
            <div className="flex-1">
              {/* Title and badges */}
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-5 bg-gray-200 rounded w-12"></div>
              </div>

              {/* Company */}
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>

              {/* Job details */}
              <div className="flex gap-4 mb-3">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>

              {/* Skills */}
              <div className="flex gap-2 mb-3">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
                <div className="h-6 bg-gray-200 rounded w-18"></div>
                <div className="h-6 bg-gray-200 rounded w-14"></div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>

            {/* Right side skeleton */}
            <div className="text-right flex-shrink-0">
              {/* Salary */}
              <div className="h-6 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-16 mb-4"></div>

              {/* Buttons */}
              <div className="space-y-2">
                <div className="h-10 bg-gray-200 rounded w-24"></div>
                <div className="h-10 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </div>

          {/* Benefits skeleton */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex gap-2">
              <div className="h-4 bg-gray-200 rounded w-12"></div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
              <div className="h-6 bg-gray-200 rounded w-18"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
