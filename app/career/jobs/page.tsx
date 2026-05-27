"use client";

import { useState, useEffect } from "react";
import { Filter, Heart } from "lucide-react";
import { Job, JobFilters, JobGetSchema } from "@/types/job";
import { jobAPI } from "@/services/job";
import { JobSearch } from "@/components/jobs/JobSearch";
import { JobFilters as JobFiltersComponent } from "@/components/jobs/JobFilters";
import { JobList } from "@/components/jobs/JobList";
import { JobDetailModal } from "@/components/jobs/JobDetailModal";
import { SavedJobsPanel } from "@/components/jobs/SavedJobsPanel";
import { NotificationDialog } from "@/components/common/NotificationDialog";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filters, setFilters] = useState<JobFilters>({
    location: undefined,
    job_types: [],
    work_arrangements: [],
    salary_range: { min: 0, max: undefined },
    skills: [],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [globalTotal, setGlobalTotal] = useState(0);
  const [favoriteJobIds, setFavoriteJobIds] = useState<string[]>([]);

  // Modal states
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobDetail, setShowJobDetail] = useState(false);
  const [showSavedJobs, setShowSavedJobs] = useState(false);

  // Dialog state
  const [msgDialog, setMsgDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "info" | "error" | "warning";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  // Load jobs based on filters
  const loadJobs = async (
    newFilters: JobFilters,
    newPage: number = 1,
    append: boolean = false,
  ) => {
    setLoading(true);
    setError(false);

    try {
      // Map UI filters to API parameters
      const apiFilters: JobGetSchema = {
        searchKeyword: newFilters.search || searchQuery || undefined,
        location: newFilters.location || undefined,
        job_type: newFilters.job_types?.[0],
        salary_min: newFilters.salary_range?.min,
        salary_max: newFilters.salary_range?.max,
        work_arrangement: newFilters.work_arrangements?.[0] as any,
        remote_allowed: newFilters.work_arrangements?.includes("remote"),
        status: "approved",
        page: newPage,
        row: 10,
      };

      const response = await jobAPI.getJobs(apiFilters);
      const newJobs = response.data;

      if (append) {
        setJobs((prev) => [...prev, ...newJobs]);
      } else {
        setJobs(newJobs);
      }

      setTotal(response.total);
      setGlobalTotal(response.total);
      setHasMore(newPage < response.max_page);
      setPage(newPage);
    } catch (error) {
      console.error("Failed to load jobs:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadJobs(filters, 1);

    // Load favorite job IDs from localStorage
    const savedFavorites = localStorage.getItem("favorite_job_ids");
    if (savedFavorites) {
      try {
        setFavoriteJobIds(JSON.parse(savedFavorites));
      } catch (error) {
        console.error("Failed to parse favorite job IDs:", error);
      }
    }
  }, []); // Empty dependency array ensures this only runs once on mount

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const newFilters = { ...filters, search: query };
    setFilters(newFilters);
    loadJobs(newFilters);
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: JobFilters) => {
    setFilters(newFilters);
    loadJobs(newFilters);
  };

  // Reset filters
  const handleResetFilters = () => {
    const resetFilters: JobFilters = {};
    setFilters(resetFilters);
    setSearchQuery("");
    loadJobs(resetFilters);
  };

  // Load more jobs
  const loadMore = () => {
    if (!loading && hasMore) {
      loadJobs(filters, page + 1, true);
    }
  };

  // Handle job actions
  const handleJobFavorite = (jobId: string, isFavorited: boolean) => {
    let nextFavoriteIds: string[] = [];

    if (isFavorited) {
      nextFavoriteIds = [...favoriteJobIds, jobId];
      setMsgDialog({
        isOpen: true,
        title: "Thành công",
        message: "Công việc đã được thêm vào danh sách yêu thích của bạn.",
        type: "success",
      });
    } else {
      nextFavoriteIds = favoriteJobIds.filter((id) => id !== jobId);
      setMsgDialog({
        isOpen: true,
        title: "Thông báo",
        message: "Công việc đã được xóa khỏi danh sách yêu thích.",
        type: "info",
      });
    }

    setFavoriteJobIds(nextFavoriteIds);
    localStorage.setItem("favorite_job_ids", JSON.stringify(nextFavoriteIds));
  };

  const handleJobApply = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (job) {
      const applyUrl = job.url_source || job.application_url;
      if (applyUrl) {
        window.open(applyUrl, "_blank", "noopener,noreferrer");
      } else {
        setMsgDialog({
          isOpen: true,
          title: "Thông báo",
          message: "Công việc này không có liên kết ứng tuyển trực tiếp.",
          type: "info",
        });
      }
    }
  };

  const handleJobView = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (job) {
      setSelectedJob(job);
      setShowJobDetail(true);

      // Save to viewed jobs in localStorage
      const viewedIdsStr = localStorage.getItem("viewed_job_ids");
      let viewedIds: string[] = [];
      try {
        viewedIds = viewedIdsStr ? JSON.parse(viewedIdsStr) : [];
      } catch (e) {
        viewedIds = [];
      }

      // Filter out if already exists and add to front (most recent)
      const nextViewedIds = [
        jobId,
        ...viewedIds.filter((id) => id !== jobId),
      ].slice(0, 50); // Keep last 50 viewed jobs

      localStorage.setItem("viewed_job_ids", JSON.stringify(nextViewedIds));
    }
  };

  // Get saved jobs for the panel
  const savedJobs = jobs.filter((job) => favoriteJobIds.includes(job.id));

  const handleRemoveSavedJob = (jobId: string) => {
    const nextFavoriteIds = favoriteJobIds.filter((id) => id !== jobId);
    setFavoriteJobIds(nextFavoriteIds);
    localStorage.setItem("favorite_job_ids", JSON.stringify(nextFavoriteIds));
    setMsgDialog({
      isOpen: true,
      title: "Thông báo",
      message: "Công việc đã được xóa khỏi danh sách yêu thích.",
      type: "info",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Tìm kiếm việc làm
              </h1>
              <p className="text-gray-600 mt-1">
                Khám phá{" "}
                {globalTotal.toLocaleString() || total.toLocaleString()} cơ hội
                nghề nghiệp tuyệt vời
              </p>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <JobSearch
                value={searchQuery}
                onSearch={handleSearch}
                loading={loading}
                placeholder="Tìm kiếm theo vị trí, công ty, kỹ năng..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {/* Saved Jobs */}
              <button
                onClick={() => setShowSavedJobs(true)}
                className="inline-flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors relative cursor-pointer"
                title="Việc làm đã lưu"
              >
                <Heart className="h-5 w-5" />
                <span className="hidden sm:inline">Đã yêu thích</span>
                {favoriteJobIds.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {favoriteJobIds.length}
                  </span>
                )}
              </button>

              {/* Filter Toggle - Mobile */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors lg:hidden"
              >
                <Filter className="h-5 w-5" />
                Bộ lọc
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden lg:block lg:w-80">
            <JobFiltersComponent
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onReset={handleResetFilters}
              loading={loading}
              className="sticky top-8"
            />
          </div>

          {/* Filters Sidebar - Mobile */}
          {showFilters && (
            <div className="lg:hidden">
              <JobFiltersComponent
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onReset={handleResetFilters}
                loading={loading}
                isOpen={showFilters}
                onToggle={() => setShowFilters(!showFilters)}
              />
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            <JobList
              jobs={jobs}
              loading={loading}
              error={error}
              onRetry={() => loadJobs(filters, 1, false)}
              onLoadMore={loadMore}
              hasMore={hasMore}
              onJobFavorite={handleJobFavorite}
              onJobApply={handleJobApply}
              onJobView={handleJobView}
              favoriteJobIds={favoriteJobIds}
              total={total}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <JobDetailModal
        job={selectedJob}
        isOpen={showJobDetail}
        onClose={() => {
          setShowJobDetail(false);
          setSelectedJob(null);
        }}
        onApply={handleJobApply}
        onFavorite={handleJobFavorite}
        isFavorited={
          selectedJob ? favoriteJobIds.includes(selectedJob.id) : false
        }
      />

      <SavedJobsPanel
        savedJobs={savedJobs}
        isOpen={showSavedJobs}
        onClose={() => setShowSavedJobs(false)}
        onRemoveJob={handleRemoveSavedJob}
        onViewJob={handleJobView}
        onApplyJob={handleJobApply}
      />

      <NotificationDialog
        open={msgDialog.isOpen}
        onOpenChange={(open) =>
          setMsgDialog((prev) => ({ ...prev, isOpen: open }))
        }
        title={msgDialog.title}
        message={msgDialog.message}
        type={msgDialog.type}
      />
    </div>
  );
}
