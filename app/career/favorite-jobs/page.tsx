"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Loader2, Heart } from "lucide-react";
import { jobMongoAPI } from "@/services/jobMongo";
import { mapJobMongoToJob } from "@/utils/jobMapper";
import { Job } from "@/types/job";
import { JobCard } from "@/components/jobs/JobCard";
import { JobDetailModal } from "@/components/jobs/JobDetailModal";
import { NotificationDialog } from "@/components/common/NotificationDialog";
import Link from "next/link";

export default function FavoriteJobsPage() {
  const [favoriteJobs, setFavoriteJobs] = useState<Job[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal & Dialog states
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobDetail, setShowJobDetail] = useState(false);
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
    const fetchFavoriteJobs = async () => {
      setLoading(true);
      const savedIdsStr = localStorage.getItem("favorite_job_ids");

      if (!savedIdsStr) {
        setFavoriteJobs([]);
        setFavoriteIds([]);
        setLoading(false);
        return;
      }

      try {
        const ids = JSON.parse(savedIdsStr) as string[];
        setFavoriteIds(ids);

        if (ids.length === 0) {
          setFavoriteJobs([]);
          setLoading(false);
          return;
        }

        // Fetch each job by ID
        // Note: In a real app, you might want a batch API,
        // but since it's "favorites", the number is usually small.
        const jobPromises = ids.map(async (id) => {
          try {
            const result = await jobMongoAPI.getJobById(id);
            return result.data ? mapJobMongoToJob(result.data) : null;
          } catch (err) {
            console.error(`Failed to fetch job ${id}:`, err);
            return null;
          }
        });

        const results = await Promise.all(jobPromises);
        const validJobs = results.filter((job): job is Job => job !== null);

        setFavoriteJobs(validJobs);
      } catch (error) {
        console.error("Failed to parse or fetch favorite jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteJobs();
  }, []);

  const handleFavoriteToggle = (jobId: string, isFavorited: boolean) => {
    let nextFavoriteIds: string[] = [];

    if (isFavorited) {
      // This case shouldn't really happen on this page as everything is already favorited,
      // but JobCard supports it.
      if (!favoriteIds.includes(jobId)) {
        nextFavoriteIds = [...favoriteIds, jobId];
      } else {
        nextFavoriteIds = [...favoriteIds];
      }
    } else {
      nextFavoriteIds = favoriteIds.filter((id) => id !== jobId);
      // Also remove from local state list
      setFavoriteJobs((prev) => prev.filter((job) => job.id !== jobId));

      setMsgDialog({
        isOpen: true,
        title: "Thông báo",
        message: "Công việc đã được xóa khỏi danh sách yêu thích.",
        type: "info",
      });
    }

    setFavoriteIds(nextFavoriteIds);
    localStorage.setItem("favorite_job_ids", JSON.stringify(nextFavoriteIds));
  };

  const handleJobView = (jobId: string) => {
    const job = favoriteJobs.find((j) => j.id === jobId);
    if (job) {
      setSelectedJob(job);
      setShowJobDetail(true);
    }
  };

  const handleJobApply = (jobId: string) => {
    const job = favoriteJobs.find((j) => j.id === jobId);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">
            Đang tải danh sách yêu thích...
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
                Việc làm đã yêu thích
              </h1>
              <p className="text-gray-600">
                Lưu giữ các cơ hội nghề nghiệp mà bạn quan tâm để ứng tuyển sau.
              </p>
            </div>
            <div className="bg-green-50 px-4 py-2 rounded-2xl border border-green-100 flex items-center gap-3">
              <Heart className="h-5 w-5 text-green-600 fill-current" />
              <span className="text-green-800 font-bold text-lg">
                {favoriteJobs.length}
              </span>
              <span className="text-green-700 text-sm font-medium">
                Công việc
              </span>
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            {favoriteJobs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 px-4"
              >
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Briefcase className="h-12 w-12 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Danh sách yêu thích trống
                </h3>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                  Bạn chưa lưu bất kỳ công việc nào. Hãy khám phá hàng ngàn cơ
                  hội việc làm hấp dẫn ngay bây giờ!
                </p>
                <Link
                  href="/career/jobs"
                  className="inline-flex items-center justify-center px-8 py-3.5 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-100 hover:shadow-green-200 active:scale-95"
                >
                  Khám phá việc làm
                </Link>
              </motion.div>
            ) : (
              <div className="space-y-5">
                {favoriteJobs.map((job, index) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    index={index}
                    isFavorited={true}
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
