"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Heart, Sparkles, X, Wand2 } from "lucide-react";
import { Job, JobFilters, JobGetSchema } from "@/types/job";
import { jobAPI } from "@/services/job";
import { cvAPI } from "@/services/cv";
import { useAuth } from "@/hooks/useAuth";
import { JobSearch } from "@/components/jobs/JobSearch";
import { JobFilters as JobFiltersComponent } from "@/components/jobs/JobFilters";
import { JobList } from "@/components/jobs/JobList";
import { JobDetailModal } from "@/components/jobs/JobDetailModal";
import { SavedJobsPanel } from "@/components/jobs/SavedJobsPanel";
import { NotificationDialog } from "@/components/common/NotificationDialog";
import { behaviorAPI } from "@/services/behavior";

const AI_FEATURE_DISMISS_KEY = "ai_analysis_promo_dismissed_v1";

type RecommendationMode = "profile" | "file" | "none";

export default function JobsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
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
  const [showAiPromo, setShowAiPromo] = useState(false);

  // Recommendation banner state. When `recommendedMode` is true the list is
  // a fixed top-k ranked by the user's CV — no pagination, no filters. Any
  // search/filter switches us back to the regular all-jobs listing.
  const [recommendedMode, setRecommendedMode] = useState(false);
  const [recommendationSource, setRecommendationSource] =
    useState<RecommendationMode>("none");

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
    setRecommendedMode(false);

    try {
      // Map UI filters to API parameters. Treat 0 / empty as "no filter":
      // sending salary_min=0 makes the backend exclude jobs whose salary_max
      // is NULL (the typical case for scraped jobs that say "Thoả thuận").
      const sMin = newFilters.salary_range?.min;
      const sMax = newFilters.salary_range?.max;
      const apiFilters: JobGetSchema = {
        searchKeyword: newFilters.search || searchQuery || undefined,
        location: newFilters.location || undefined,
        job_type: newFilters.job_types?.[0],
        salary_min: sMin && sMin > 0 ? sMin : undefined,
        salary_max: sMax && sMax > 0 ? sMax : undefined,
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

  /**
   * Try CV-based recommendations. Returns true when we successfully populated
   * the list with ranked jobs; false means the caller should fall back to the
   * regular all-jobs listing (e.g. user has no CV, matching service down…).
   */
  const loadRecommendations = async (): Promise<boolean> => {
    setLoading(true);
    setError(false);
    try {
      const res: any = await cvAPI.getAutoRecommendations(20);
      const payload = res?.data;
      if (!payload?.success) return false;

      const mode: RecommendationMode = payload.mode || "none";
      const matches: any[] = Array.isArray(payload.matches)
        ? payload.matches
        : [];
      if (mode === "none" || matches.length === 0) return false;

      // Hydrate each match with the full Job object so the existing JobCard /
      // JobDetailModal renders correctly (skills, company, description, …).
      const hydrated = await Promise.all(
        matches.map(async (m) => {
          try {
            const detail: any = await jobAPI.getJobById(m.job_id);
            const job: Job | null = detail?.data ?? detail ?? null;
            if (!job) return null;
            return {
              ...job,
              compatibility_score: m.compatibility_score,
              matched_skills: m.matched_skills,
              missing_skills: m.missing_skills,
              match_explanation: m.match_explanation,
              // Prefer the source URL from the recommendation if the job row
              // somehow lost it (older crawls).
              url_source: job.url_source || m.url_source,
            } as Job;
          } catch {
            return null;
          }
        }),
      );
      const valid = hydrated.filter((j): j is Job => j !== null);
      if (valid.length === 0) return false;

      setJobs(valid);
      setTotal(valid.length);
      setGlobalTotal(valid.length);
      setHasMore(false);
      setPage(1);
      setRecommendationSource(mode);
      setRecommendedMode(true);
      return true;
    } catch (err) {
      console.error("Failed to load CV recommendations:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Initial load — wait for auth state, then prefer CV recommendations.
  useEffect(() => {
    // Load favorites once.
    const savedFavorites = localStorage.getItem("favorite_job_ids");
    if (savedFavorites) {
      try {
        setFavoriteJobIds(JSON.parse(savedFavorites));
      } catch (error) {
        console.error("Failed to parse favorite job IDs:", error);
      }
    }

    // Show the AI-analysis promo banner unless the user has dismissed it.
    try {
      const dismissed = localStorage.getItem(AI_FEATURE_DISMISS_KEY);
      if (!dismissed) setShowAiPromo(true);
    } catch {
      setShowAiPromo(true);
    }
  }, []);

  const handleDismissAiPromo = () => {
    setShowAiPromo(false);
    try {
      localStorage.setItem(AI_FEATURE_DISMISS_KEY, "1");
    } catch {
      /* localStorage may be unavailable (private mode) */
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      loadJobs(filters, 1);
      return;
    }
    (async () => {
      const ok = await loadRecommendations();
      if (!ok) await loadJobs(filters, 1);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated]);

  // Handle search — always switches to all-jobs mode (recommendations are
  // a fixed ranked list and don't honor free-text search).
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const newFilters = { ...filters, search: query };
    setFilters(newFilters);
    loadJobs(newFilters);
    if (query && query.trim().length > 0) {
      behaviorAPI.trackSearch({
        keyword: query,
        scope: "job",
        filter_snapshot: newFilters as unknown as Record<string, unknown>,
      });
    }
  };

  // Handle filter changes — same: switch out of recommendation mode.
  const handleFiltersChange = (newFilters: JobFilters) => {
    setFilters(newFilters);
    loadJobs(newFilters);
    behaviorAPI.trackEvent({
      event_category: "engagement",
      event_action: "filter_change",
      event_label: "jobs_list",
      metadata_json: newFilters as unknown as Record<string, unknown>,
    });
  };

  // Reset filters
  const handleResetFilters = () => {
    const resetFilters: JobFilters = {};
    setFilters(resetFilters);
    setSearchQuery("");
    loadJobs(resetFilters);
  };

  // "Xem tất cả việc làm" button when in recommendation mode.
  const handleShowAllJobs = () => {
    loadJobs(filters, 1);
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
            <AnimatePresence>
              {showAiPromo && (
                <motion.div
                  key="ai-promo"
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="relative mb-4 overflow-hidden rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 via-fuchsia-50 to-pink-50 px-5 py-4 shadow-sm"
                >
                  {/* Soft animated sparkle backdrop */}
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute -top-6 -right-6 text-fuchsia-200"
                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.06, 1] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Sparkles className="h-24 w-24" strokeWidth={1.2} />
                  </motion.span>

                  <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                    <div className="flex items-start gap-3 flex-1">
                      <motion.div
                        animate={{ rotate: [0, 8, -8, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="shrink-0 mt-0.5 p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-md"
                      >
                        <Wand2 className="h-5 w-5 text-white" />
                      </motion.div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm sm:text-base font-bold text-gray-900">
                            Mới: Phân tích độ phù hợp công việc bằng AI
                          </h3>
                          <span className="text-[10px] font-extrabold tracking-wider text-rose-700 bg-yellow-300 ring-1 ring-rose-300 rounded-sm px-1.5 py-0.5">
                            MỚI
                          </span>
                        </div>
                        <p className="mt-1 text-xs sm:text-sm text-gray-700 leading-relaxed">
                          AI sẽ đối chiếu CV của bạn với từng tin tuyển dụng,
                          cho điểm phù hợp, chỉ ra kỹ năng bạn{" "}
                          <span className="font-semibold text-emerald-700">
                            đã có
                          </span>{" "}
                          và{" "}
                          <span className="font-semibold text-amber-700">
                            còn thiếu
                          </span>
                          , kèm gợi ý cải thiện — chỉ cần bấm nút{" "}
                          <span className="inline-flex items-center gap-1 font-semibold text-fuchsia-700">
                            <Sparkles className="h-3.5 w-3.5" />
                            Phân tích
                          </span>{" "}
                          ở mỗi tin.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleDismissAiPromo}
                      className="self-start sm:self-center shrink-0 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-white/60 rounded-md transition-colors cursor-pointer"
                      title="Đóng thông báo"
                      aria-label="Đóng thông báo"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {recommendedMode && (
              <div className="mb-4 flex items-center justify-between gap-4 px-4 py-3 rounded-lg border border-emerald-200 bg-emerald-50">
                <div className="flex items-center gap-2 text-sm text-emerald-900">
                  <Sparkles className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>
                    Đang gợi ý {jobs.length} việc làm phù hợp với{" "}
                    {recommendationSource === "profile"
                      ? "CV trực tuyến"
                      : recommendationSource === "file"
                        ? "CV đã tải lên"
                        : "CV"}{" "}
                    của bạn.
                  </span>
                </div>
                <button
                  onClick={handleShowAllJobs}
                  className="text-sm font-medium text-emerald-700 hover:text-emerald-900 hover:underline whitespace-nowrap cursor-pointer"
                >
                  Xem tất cả việc làm
                </button>
              </div>
            )}
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
