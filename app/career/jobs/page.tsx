"use client";

import { useState, useEffect } from "react";
import { Filter, Heart, Bell } from "lucide-react";
import { Job, JobFilters } from "@/types/job";
import { getJobsByFilters } from "@/mocks/mockJobData";
import { JobSearch } from "@/components/jobs/JobSearch";
import { JobFilters as JobFiltersComponent } from "@/components/jobs/JobFilters";
import { JobList } from "@/components/jobs/JobList";
import { JobDetailModal } from "@/components/jobs/JobDetailModal";
import { QuickApplyModal } from "@/components/jobs/QuickApplyModal";
import { SavedJobsPanel } from "@/components/jobs/SavedJobsPanel";
import { JobNotificationsModal } from "@/components/jobs/JobNotificationsModal";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<JobFilters>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [favoriteJobIds, setFavoriteJobIds] = useState<string[]>(["1", "4"]); // Mock some favorites

  // Modal states
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobDetail, setShowJobDetail] = useState(false);
  const [showQuickApply, setShowQuickApply] = useState(false);
  const [showSavedJobs, setShowSavedJobs] = useState(false);
  const [showJobAlerts, setShowJobAlerts] = useState(false);

  // Notification state (mock data)
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(3);

  // Load jobs based on filters
  const loadJobs = (
    newFilters: JobFilters,
    newPage: number = 1,
    append: boolean = false
  ) => {
    setLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const result = getJobsByFilters(newFilters, newPage, 6);

      if (append) {
        setJobs((prev) => [...prev, ...result.jobs]);
      } else {
        setJobs(result.jobs);
      }

      setTotal(result.total);
      setHasMore(result.hasMore);
      setPage(newPage);
      setLoading(false);
    }, 500);
  };

  // Initial load - use useEffect properly for side effects
  useEffect(() => {
    // Only load on mount, not on every render
    const initialFilters: JobFilters = {};

    // Use async function to avoid direct setState in effect
    const loadInitialJobs = async () => {
      setLoading(true);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const result = getJobsByFilters(initialFilters, 1, 6);

      setJobs(result.jobs);
      setTotal(result.total);
      setHasMore(result.hasMore);
      setPage(1);
      setLoading(false);
    };

    loadInitialJobs();
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
    if (isFavorited) {
      setFavoriteJobIds((prev) => [...prev, jobId]);
    } else {
      setFavoriteJobIds((prev) => prev.filter((id) => id !== jobId));
    }
  };

  const handleJobApply = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (job) {
      setSelectedJob(job);
      setShowQuickApply(true);
    }
  };

  const handleJobView = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (job) {
      setSelectedJob(job);
      setShowJobDetail(true);
    }
  };

  // Get saved jobs for the panel
  const savedJobs = jobs.filter((job) => favoriteJobIds.includes(job.id));

  const handleRemoveSavedJob = (jobId: string) => {
    setFavoriteJobIds((prev) => prev.filter((id) => id !== jobId));
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
                Khám phá {total.toLocaleString()} cơ hội nghề nghiệp tuyệt vời
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
              {/* Job Alerts */}
              <button
                onClick={() => setShowJobAlerts(true)}
                className="inline-flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors cursor-pointer relative"
                title="Thông báo việc làm"
              >
                <Bell className="h-5 w-5" />
                <span className="hidden sm:inline">Thông báo</span>
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>

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

      <QuickApplyModal
        job={selectedJob}
        isOpen={showQuickApply}
        onClose={() => {
          setShowQuickApply(false);
          setSelectedJob(null);
        }}
        onSubmit={(applicationData) => {
          console.log("Application submitted:", applicationData);
          // Handle application submission
        }}
      />

      <SavedJobsPanel
        savedJobs={savedJobs}
        isOpen={showSavedJobs}
        onClose={() => setShowSavedJobs(false)}
        onRemoveJob={handleRemoveSavedJob}
        onViewJob={handleJobView}
        onApplyJob={handleJobApply}
      />

      <JobNotificationsModal
        isOpen={showJobAlerts}
        onClose={() => setShowJobAlerts(false)}
        onMarkAsRead={(notificationId) => {
          console.log("Mark as read:", notificationId);
          // Decrease unread count
          setUnreadNotificationCount((prev) => Math.max(0, prev - 1));
        }}
        onMarkAllAsRead={() => {
          console.log("Mark all as read");
          // Reset unread count
          setUnreadNotificationCount(0);
        }}
        onViewJob={(jobId) => {
          console.log("View job:", jobId);
          // Handle viewing job from notification
          handleJobView(jobId);
        }}
        onRefresh={() => {
          console.log("Refresh notifications");
          // Simulate refresh - could add new notifications
        }}
        onDeleteNotification={(notificationId) => {
          console.log("Delete notification:", notificationId);
          // Handle notification deletion
        }}
        onDeleteAllRead={() => {
          console.log("Delete all read notifications");
          // Handle bulk deletion of read notifications
        }}
      />
    </div>
  );
}
