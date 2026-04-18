"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LoginRequired } from "@/components/auth/LoginRequired";
import {
  MapPin,
  Building2,
  Briefcase,
  TrendingUp,
  ArrowLeft,
  Star,
} from "lucide-react";

interface JobDetailData {
  job_id: number;
  title: string;
  company: string;
  location?: string;
  compatibility: number;
  experience_required?: string;
  scores?: {
    sim_title?: number;
    sim_tech: number;
    sim_mota: number;
    loc_score: number;
    exp_score: number;
  };
}

const scoreLabels: Record<string, string> = {
  // sim_title: "Tiêu đề công việc",
  sim_tech: "Kỹ thuật / Công nghệ",
  sim_mota: "Mô tả công việc",
  loc_score: "Địa điểm",
  exp_score: "Kinh nghiệm",
};

function ScoreBar({ label, value }: { label: string; value: number }) {
  const percent = Math.round(value * 100);
  const color =
    percent >= 70
      ? "bg-green-500"
      : percent >= 40
        ? "bg-yellow-400"
        : "bg-red-400";

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm font-medium text-gray-700">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5">
        <div
          className={`${color} h-2.5 rounded-full transition-all duration-700`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function SuitableJobDetailContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginRequired
        title="Đăng nhập để xem phân tích độ phù hợp"
        description="Bạn cần đăng nhập để xem chi tiết phân tích độ phù hợp giữa hồ sơ của bạn và công việc này."
      />
    );
  }

  // Parse job data from URL query param
  let job: JobDetailData | null = null;
  try {
    const raw = searchParams.get("job");
    if (raw) job = JSON.parse(raw);
  } catch {
    job = null;
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-gray-500">
        <p className="text-lg font-medium">
          Không tìm thấy thông tin công việc.
        </p>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-green-700 hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </button>
      </div>
    );
  }

  const compatibilityColor =
    job.compatibility >= 50 ? "text-green-600" : "text-red-500";
  const compatibilityBg =
    job.compatibility >= 50
      ? "bg-green-50 border-green-200"
      : "bg-red-50 border-red-200";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-green-700 transition-colors cursor-pointer text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách
        </button>

        <h1 className="text-2xl sm:text-3xl font-bold text-center text-indigo-600 tracking-wide">
          PHÂN TÍCH ĐỘ PHÙ HỢP
        </h1>

        {/* Job Overview Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-gray-100 border flex items-center justify-center shrink-0">
              <Building2 className="w-7 h-7 text-gray-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
              <p className="text-gray-600 font-medium mt-0.5">{job.company}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            {job.location && (
              <span className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                <MapPin className="w-4 h-4 text-green-600" />
                {job.location}
              </span>
            )}
            {job.experience_required && (
              <span className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                <Briefcase className="w-4 h-4 text-indigo-500" />
                {job.experience_required}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
              <Star className="w-4 h-4 text-yellow-500" />
              Job ID: {job.job_id}
            </span>
          </div>
        </div>

        {/* Compatibility Score Card */}
        <div className={`rounded-2xl border p-6 ${compatibilityBg}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Tỷ lệ phù hợp tổng thể
              </p>
              <p className={`text-5xl font-bold mt-1 ${compatibilityColor}`}>
                {job.compatibility}%
              </p>
            </div>
            <div className="w-20 h-20 rounded-full border-4 border-current flex items-center justify-center">
              <TrendingUp className={`w-8 h-8 ${compatibilityColor}`} />
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        {job.scores && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-800">
              Phân tích chi tiết các tiêu chí
            </h3>
            <div className="space-y-4">
              {Object.entries(job.scores)
                .filter(([key]) => key in scoreLabels)
                .map(([key, value]) => (
                  <ScoreBar
                    key={key}
                    label={scoreLabels[key]}
                    value={value}
                  />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SuitableJobDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
        </div>
      }
    >
      <SuitableJobDetailContent />
    </Suspense>
  );
}
