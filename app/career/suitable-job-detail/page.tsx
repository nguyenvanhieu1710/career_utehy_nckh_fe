"use client";

import { Suspense, useEffect, useState } from "react";
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
  ExternalLink,
} from "lucide-react";

interface JobDetailData {
  job_id: number;
  title: string;
  company: string;
  location?: string;
  compatibility: number;
  experience_required?: string;
  matched_skills?: string[];
  missing_skills?: string[];
  explanation?: string;
  url_source?: string;
  scores?: {
    sim_title?: number;
    sim_tech: number;
    sim_mota: number;
    loc_score: number;
    exp_score: number;
  };
}

const scoreLabels: Record<string, string> = {
  sim_title: "Tiêu đề công việc",
  sim_tech: "Kỹ thuật / Công nghệ",
  sim_mota: "Mô tả công việc",
  loc_score: "Địa điểm",
  // exp_score: "Kinh nghiệm",
};

function ScoreBar({ label, value }: { label: string; value: number }) {
  const percent = Math.round(value);
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

  const [job, setJob] = useState<JobDetailData | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const cachedJob = sessionStorage.getItem("selected_job_detail");
    if (cachedJob) {
      try {
        setJob(JSON.parse(cachedJob));
      } catch (e) {
        console.error("Failed to parse job detail from storage", e);
      }
    }
    setIsInitializing(false);
  }, []);

  if (isLoading || isInitializing) {
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gray-100 border flex items-center justify-center shrink-0">
                <Building2 className="w-7 h-7 text-gray-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
                <p className="text-gray-600 font-medium mt-0.5">{job.company}</p>
              </div>
            </div>
            
            {job.url_source && (
              <a
                href={
                  job.url_source.startsWith("http")
                    ? job.url_source
                    : `https://${job.url_source}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#0C6A4E] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#0a5441] transition-all shadow-md text-sm shrink-0"
              >
                Ứng tuyển ngay
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            {job.location && job.location !== "Chưa cập nhật" && (
              <span className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                <MapPin className="w-4 h-4 text-green-600" />
                {job.location}
              </span>
            )}
            {job.experience_required && job.experience_required !== "Chưa cập nhật" && (
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

        {/* Skills Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Matched Skills */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-green-700 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              Kỹ năng bạn đã có
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.matched_skills && job.matched_skills.length > 0 ? (
                job.matched_skills.map((skill: string, i: number) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full border border-green-100"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic">
                  Chưa xác định được kỹ năng khớp cụ thể.
                </p>
              )}
            </div>
          </div>

          {/* Missing Skills */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-orange-600 flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full" />
              Kỹ năng cần cải thiện
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.missing_skills && job.missing_skills.length > 0 ? (
                job.missing_skills.map((skill: string, i: number) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-orange-50 text-orange-700 text-sm font-medium rounded-full border border-orange-100"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-green-600 font-medium italic">
                  Bạn đã đáp ứng đầy đủ kỹ năng kỹ thuật!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Score Breakdown combined with AI Title */}
        {job.scores && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 mb-2">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold">
                Phân tích chi tiết độ phù hợp từ AI
              </h3>
            </div>
            <div className="space-y-4">
              {Object.entries(job.scores)
                .filter(([key]) => key in scoreLabels)
                .map(([key, value]) => (
                  <ScoreBar
                    key={key}
                    label={scoreLabels[key]}
                    value={value as number}
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
