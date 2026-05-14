"use client";

import { Suspense, useEffect, useState } from "react";
import JobDetailHeader from "@/components/job-detail/JobDetailHeader/JobDetailHeader";
import JobDescription from "@/components/job-detail/JobDescription/JobDescription";
import CompanyDescription from "@/components/job-detail/CompanyDescription/CompanyDescription";
import { useSearchParams } from "next/navigation";
import { jobAPI } from "@/services/job";
import { Job } from "@/types/job";
import { Loader2 } from "lucide-react";
import { NotificationDialog } from "@/components/common/NotificationDialog";

function JobDetailContent() {
  const searchParams = useSearchParams();
  const job_id = searchParams.get("id");
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoriteJobIds, setFavoriteJobIds] = useState<string[]>([]);
  
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

  useEffect(() => {
    // Load favorite job IDs from localStorage
    const savedFavorites = localStorage.getItem("favorite_job_ids");
    if (savedFavorites) {
      try {
        setFavoriteJobIds(JSON.parse(savedFavorites));
      } catch (error) {
        console.error("Failed to parse favorite job IDs:", error);
      }
    }

    const fetchJobDetail = async () => {
      if (!job_id) {
        setError("Không tìm thấy mã công việc");
        setLoading(false);
        return;
      }

      try {
        const response = await jobAPI.getJobById(job_id);
        if (response?.status === "success" && response.data) {
          setJob(response.data);
        } else {
          setError("Không thể tải thông tin công việc");
        }
      } catch (err) {
        console.error("Error fetching job detail:", err);
        setError("Đã xảy ra lỗi khi kết nối máy chủ");
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetail();
  }, [job_id]);

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] bg-white">
        <Loader2 className="w-12 h-12 text-[#0C6A4E] animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Đang tải chi tiết công việc...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white p-4">
        <div className="text-red-500 text-lg font-bold mb-2">Rất tiếc!</div>
        <p className="text-gray-600 mb-6 text-center">{error || "Công việc này không tồn tại hoặc đã bị gỡ bỏ."}</p>
        <button 
          onClick={() => window.history.back()}
          className="bg-[#0C6A4E] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#0C6A4E]/90 transition"
        >
          Quay lại
        </button>
      </div>
    );
  }

  const isFavorited = favoriteJobIds.includes(job.id);

  return (
    <div className="container mx-auto px-4 py-8 text-gray-600 bg-white">
      <div className="space-y-8 max-w-5xl mx-auto">
        <JobDetailHeader 
          job={job} 
          isFavorited={isFavorited}
          onFavorite={handleJobFavorite}
        />
        <div className="border-t border-gray-100 w-full mb-1"></div>
        <JobDescription job={job} />
        <div className="border-t border-gray-100 w-full mb-1"></div>
        <CompanyDescription company={job.company} />
      </div>

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

export default function JobDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="w-12 h-12 text-[#0C6A4E] animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Đang khởi tạo...</p>
          </div>
        </div>
      }
    >
      <JobDetailContent />
    </Suspense>
  );
}
