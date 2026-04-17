"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Loader2, Eye, History } from "lucide-react";
import { jobAPI } from "@/services/job";
import { Job } from "@/types/job";
import { JobCard } from "@/components/jobs/JobCard";
import { JobDetailModal } from "@/components/jobs/JobDetailModal";
import { NotificationDialog } from "@/components/common/NotificationDialog";
import { DeleteConfirmationDialog } from "@/components/admin/DeleteConfirmationDialog";
import Link from "next/link";

export default function ViewedJobsPage() {
  const [viewedJobs, setViewedJobs] = useState<Job[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal & Dialog states
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobDetail, setShowJobDetail] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
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

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);

      // Load favorites for JobCard hearts
      const favoritesStr = localStorage.getItem("favorite_job_ids");
      if (favoritesStr) {
        try {
          setFavoriteIds(JSON.parse(favoritesStr));
        } catch (e) {
          console.error("Failed to parse favorite_job_ids");
        }
      }

      // Load viewed IDs
      const viewedIdsStr = localStorage.getItem("viewed_job_ids");

      if (!viewedIdsStr) {
        setViewedJobs([]);
        setLoading(false);
        return;
      }

      try {
        const ids = JSON.parse(viewedIdsStr) as string[];

        if (ids.length === 0) {
          setViewedJobs([]);
          setLoading(false);
          return;
        }

        // Fetch each job by ID
        const jobPromises = ids.map(async (id) => {
          try {
            const response = await jobAPI.getJobById(id);
            return response.data;
          } catch (err) {
            console.error(`Failed to fetch job ${id}:`, err);
            return null;
          }
        });

        const results = await Promise.all(jobPromises);
        const validJobs = results.filter((job): job is Job => job !== null);

        setViewedJobs(validJobs);
      } catch (error) {
        console.error("Failed to parse or fetch viewed jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleFavoriteToggle = (jobId: string, isFavorited: boolean) => {
    let nextFavoriteIds: string[] = [];
    const currentFavorites = JSON.parse(
      localStorage.getItem("favorite_job_ids") || "[]",
    ) as string[];

    if (isFavorited) {
      if (!currentFavorites.includes(jobId)) {
        nextFavoriteIds = [...currentFavorites, jobId];
      } else {
        nextFavoriteIds = [...currentFavorites];
      }
    } else {
      nextFavoriteIds = currentFavorites.filter((id) => id !== jobId);
    }

    setFavoriteIds(nextFavoriteIds);
    localStorage.setItem("favorite_job_ids", JSON.stringify(nextFavoriteIds));
  };

  const handleJobView = (jobId: string) => {
    const job = viewedJobs.find((j) => j.id === jobId);
    if (job) {
      setSelectedJob(job);
      setShowJobDetail(true);
    }
  };

  const handleJobApply = (jobId: string) => {
    const job = viewedJobs.find((j) => j.id === jobId);
    if (job) {
      if (job.application_url) {
        window.open(job.application_url, "_blank", "noopener,noreferrer");
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

  const handleClearHistory = () => {
    setShowConfirmClear(true);
  };

  const confirmClear = () => {
    localStorage.removeItem("viewed_job_ids");
    setViewedJobs([]);
    setShowConfirmClear(false);

    setMsgDialog({
      isOpen: true,
      title: "Thành công",
      message: "Lịch sử đã xem đã được xóa sạch.",
      type: "success",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">
            Đang tải lịch sử đã xem...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Công việc đã xem gần đây
              </h1>
              <p className="text-gray-600">
                Xem lại danh sách các công việc bạn đã quan tâm tìm hiểu.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100 flex items-center gap-3">
                <History className="h-5 w-5 text-blue-600" />
                <span className="text-blue-800 font-bold text-lg">
                  {viewedJobs.length}
                </span>
                <span className="text-blue-700 text-sm font-medium">
                  Đã xem
                </span>
              </div>

              {viewedJobs.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="text-sm text-red-500 hover:text-red-700 font-medium px-3 py-2 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                >
                  Xóa lịch sử
                </button>
              )}
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            {viewedJobs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 px-4"
              >
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Eye className="h-12 w-12 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Bạn chưa xem công việc nào
                </h3>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                  Hãy bắt đầu hành trình tìm kiếm sự nghiệp mơ ước của bạn ngay
                  hôm nay!
                </p>
                <Link
                  href="/career/jobs"
                  className="inline-flex items-center justify-center px-8 py-3.5 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-100 hover:shadow-green-200 active:scale-95"
                >
                  Tìm việc ngay
                </Link>
              </motion.div>
            ) : (
              <div className="space-y-5">
                {viewedJobs.map((job, index) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    index={index}
                    isFavorited={favoriteIds.includes(job.id)}
                    onFavorite={handleFavoriteToggle}
                    onView={handleJobView}
                    onApply={handleJobApply}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modals & Dialogs */}
      <JobDetailModal
        job={selectedJob}
        isOpen={showJobDetail}
        onClose={() => {
          setShowJobDetail(false);
          setSelectedJob(null);
        }}
        onApply={handleJobApply}
        onFavorite={handleFavoriteToggle}
        isFavorited={selectedJob ? favoriteIds.includes(selectedJob.id) : false}
      />

      <DeleteConfirmationDialog
        open={showConfirmClear}
        onOpenChange={setShowConfirmClear}
        onConfirm={confirmClear}
        title="Xóa lịch sử đã xem?"
        description="Bạn có chắc chắn muốn xóa tất cả lịch sử công việc đã xem không? Hành động này không thể hoàn tác."
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
