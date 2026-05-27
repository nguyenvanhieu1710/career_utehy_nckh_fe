"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LoginRequired } from "@/components/auth/LoginRequired";
import { cvAPI } from "@/services/cv";
import { jobAPI } from "@/services/job";
import {
  MapPin,
  Building2,
  Briefcase,
  TrendingUp,
  ArrowLeft,
  Star,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Info,
  FileText,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  CircleHelp,
  Cpu,
  Clock,
} from "lucide-react";

interface ReliabilityMeta {
  level: "high" | "medium" | "low";
  label: string;
  signal_points: number;
  signal_max: number;
}

interface AnalysisMeta {
  provider: string;
  model: string | null;
  analyzed_at: string;
  fallback_reason: string | null;
  fallback_reason_code: string | null;
  reliability: ReliabilityMeta;
}

interface CvInputSummary {
  name?: string | null;
  skill_count: number;
  skills_preview: string[];
  years_of_experience: number | null;
  location: string | null;
  char_count: number;
  has_summary: boolean;
  has_experience: boolean;
  has_education: boolean;
}

interface JobInputSummary {
  title: string;
  company: string | null;
  location: string | null;
  skill_count: number;
  skills_preview: string[];
  years_required: number | null;
  char_count: number;
  has_description: boolean;
  has_requirements: boolean;
}

interface InputsSummary {
  cv: CvInputSummary;
  job: JobInputSummary;
}

interface ExtractedCv {
  full_name: string | null;
  headline: string | null;
  years_of_experience: number | null;
  location: string | null;
  skills: string[];
  education: string[];
  languages: string[];
}

interface JobDetailData {
  job_id: number | string;
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
  strengths?: string[];
  improvements?: string[];
  analysis_mode?: "ai" | "rule";
  meta?: AnalysisMeta;
  inputs_summary?: InputsSummary;
  extracted_cv?: ExtractedCv;
}

type ScoreKey = "sim_title" | "sim_tech" | "sim_mota" | "loc_score" | "exp_score";

const scoreLabels: Record<ScoreKey, string> = {
  sim_title: "Tiêu đề công việc",
  sim_tech: "Kỹ thuật / Công nghệ",
  sim_mota: "Mô tả công việc",
  loc_score: "Địa điểm",
  exp_score: "Kinh nghiệm",
};

const scoreHints: Record<ScoreKey, string> = {
  sim_title:
    "Mức độ tiêu đề công việc khớp với vị trí mong muốn / tiêu đề CV của bạn (trọng số 25%).",
  sim_tech:
    "Tỷ lệ kỹ năng JD yêu cầu có xuất hiện trong CV — tín hiệu mạnh nhất (trọng số 50%).",
  sim_mota:
    "Mức độ từ khoá trong mô tả công việc trùng với phần kinh nghiệm / mô tả của bạn (trọng số 10%).",
  loc_score:
    "Khớp địa điểm CV và địa điểm JD. 0 không có nghĩa là kém — có thể do dữ liệu thiếu (trọng số 10%).",
  exp_score:
    "So sánh số năm kinh nghiệm của bạn với yêu cầu của JD (trọng số 5%).",
};

// Determines which scores deserve a "low confidence" warning icon because
// the underlying input was missing — vs scores that are legitimately low
// because of a mismatch.
function isLowConfidenceScore(
  key: ScoreKey,
  value: number,
  summary?: InputsSummary,
): boolean {
  if (!summary) return false;
  if (value > 0) return false;
  switch (key) {
    case "loc_score":
      return !summary.cv.location || !summary.job.location;
    case "exp_score":
      return (
        summary.cv.years_of_experience == null ||
        summary.job.years_required == null
      );
    case "sim_tech":
      return summary.cv.skill_count === 0 || summary.job.skill_count === 0;
    case "sim_mota":
      return !summary.job.has_description;
    case "sim_title":
      return !summary.cv.has_summary;
    default:
      return false;
  }
}

function ScoreBar({
  label,
  value,
  hint,
  lowConfidence,
}: {
  label: string;
  value: number;
  hint: string;
  lowConfidence: boolean;
}) {
  const percent = Math.max(0, Math.min(100, Math.round(value)));
  const color =
    percent >= 70
      ? "bg-emerald-500"
      : percent >= 40
        ? "bg-amber-400"
        : lowConfidence
          ? "bg-gray-300"
          : "bg-rose-400";

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-sm font-medium text-gray-700">
        <span className="flex items-center gap-1.5">
          {label}
          {lowConfidence && (
            <span
              title="Dữ liệu đầu vào thiếu — điểm này không phản ánh sự không phù hợp."
              className="inline-flex items-center text-amber-500"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
            </span>
          )}
        </span>
        <span className={lowConfidence ? "text-gray-400" : ""}>{percent}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5">
        <div
          className={`${color} h-2.5 rounded-full transition-all duration-700`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 leading-snug">{hint}</p>
    </div>
  );
}

function ReliabilityPill({ reliability }: { reliability: ReliabilityMeta }) {
  const styles: Record<
    ReliabilityMeta["level"],
    { bg: string; text: string; border: string; icon: typeof ShieldCheck }
  > = {
    high: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      icon: ShieldCheck,
    },
    medium: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      icon: ShieldAlert,
    },
    low: {
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-200",
      icon: AlertTriangle,
    },
  };
  const s = styles[reliability.level];
  const Icon = s.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${s.bg} ${s.text} ${s.border}`}
      title={`Tín hiệu: ${reliability.signal_points}/${reliability.signal_max}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {reliability.label}
    </span>
  );
}

function formatAnalyzedAt(iso?: string): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function SuitableJobDetailContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlJobId = searchParams.get("jobId");

  const [job, setJob] = useState<JobDetailData | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false);

  useEffect(() => {
    // The page can be entered three ways:
    //   1. From the recommendations list — cached `selected_job_detail` in
    //      sessionStorage holds a JobDetailData with rule-based scores.
    //   2. Direct URL with `?jobId=<id>` — fetch the job from the API and
    //      hydrate just enough fields so the page can render while AI runs.
    //   3. Neither — render the "không tìm thấy" state.
    let cancelled = false;

    const init = async () => {
      // Path 1: cached payload
      const cachedJob = sessionStorage.getItem("selected_job_detail");
      let parsed: JobDetailData | null = null;
      if (cachedJob) {
        try {
          parsed = JSON.parse(cachedJob);
        } catch (e) {
          console.error("Failed to parse job detail from storage", e);
        }
      }

      // Path 2: URL jobId differs from (or replaces) cached payload — fetch
      // the job by id. Cache is reused only if its job_id matches the URL.
      if (urlJobId && (!parsed || String(parsed.job_id) !== urlJobId)) {
        try {
          const detail: any = await jobAPI.getJobById(urlJobId);
          const j = detail?.data ?? detail;
          if (j && !cancelled) {
            parsed = {
              job_id: j.id,
              title: j.title,
              company: j?.company?.name ?? "Đang cập nhật",
              location: j.location,
              compatibility: 0,
              experience_required:
                j.years_of_experience != null
                  ? `${j.years_of_experience} năm`
                  : undefined,
              url_source: j.url_source,
            };
          }
        } catch (e) {
          console.error("Failed to fetch job by id", e);
        }
      }

      if (cancelled) return;
      if (parsed) setJob(parsed);
      setIsInitializing(false);

      if (!parsed?.job_id) return;
      setIsAnalyzing(true);
      try {
        const res: any = await cvAPI.analyzeMatch(String(parsed.job_id));
        if (cancelled) return;
        const data = res?.data ?? res;
        const analysis = data?.analysis;
        if (!analysis) return;
        setJob((prev) =>
          prev
            ? {
                ...prev,
                compatibility: analysis.compatibility_score ?? prev.compatibility,
                matched_skills: analysis.matched_skills ?? prev.matched_skills,
                missing_skills: analysis.missing_skills ?? prev.missing_skills,
                scores: analysis.scores ?? prev.scores,
                explanation: analysis.match_explanation ?? prev.explanation,
                strengths: analysis.strengths,
                improvements: analysis.improvements,
                analysis_mode: data?.mode,
                meta: data?.meta,
                inputs_summary: data?.inputs_summary,
                extracted_cv: analysis?.extracted_cv,
              }
            : prev,
        );
      } catch (e) {
        console.error("AI analysis failed", e);
      } finally {
        if (!cancelled) setIsAnalyzing(false);
      }
    };

    init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlJobId]);

  const compatibilityColor = useMemo(() => {
    if (!job) return "text-gray-500";
    if (job.compatibility >= 70) return "text-emerald-600";
    if (job.compatibility >= 40) return "text-amber-600";
    return "text-rose-500";
  }, [job?.compatibility]);

  const compatibilityBg = useMemo(() => {
    if (!job) return "bg-gray-50 border-gray-200";
    if (job.compatibility >= 70) return "bg-emerald-50 border-emerald-200";
    if (job.compatibility >= 40) return "bg-amber-50 border-amber-200";
    return "bg-rose-50 border-rose-200";
  }, [job?.compatibility]);

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

  const isFallback = job.analysis_mode === "rule";
  const meta = job.meta;
  const inputs = job.inputs_summary;
  const extractedCv = job.extracted_cv;
  // Prefer AI-extracted profile fields; fall back to rule-parsed inputs.
  // CRITICAL: do NOT fall back to `inputs.cv.name` for the display name,
  // because for uploaded PDFs that field is the file label (often the
  // filename) — showing it as "Họ tên" is misleading.
  const displayName = extractedCv?.full_name ?? null;
  const displayHeadline = extractedCv?.headline ?? null;
  const displayYears =
    extractedCv?.years_of_experience ?? inputs?.cv.years_of_experience ?? null;
  const displayLocation =
    extractedCv?.location ?? inputs?.cv.location ?? null;
  const displaySkills =
    extractedCv?.skills && extractedCv.skills.length > 0
      ? extractedCv.skills.slice(0, 12)
      : inputs?.cv.skills_preview ?? [];
  const displayEducation = extractedCv?.education ?? [];
  const displayLanguages = extractedCv?.languages ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-green-700 transition-colors cursor-pointer text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách
        </button>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Phân tích độ phù hợp
          </h1>
          {meta?.reliability && (
            <ReliabilityPill reliability={meta.reliability} />
          )}
        </div>

        {/* Trust header — model / provider / timestamp */}
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-600">
          <span className="inline-flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-500">Cung cấp bởi:</span>
            <span className="font-semibold text-gray-900">
              {isFallback
                ? "Bộ chấm điểm dự phòng (rule-based)"
                : (meta?.provider ?? "groq").toUpperCase()}
            </span>
          </span>
          {meta?.model && !isFallback && (
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-gray-500">Mô hình:</span>
              <span className="font-mono text-gray-900">{meta.model}</span>
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-500">Phân tích lúc:</span>
            <span className="text-gray-900">
              {formatAnalyzedAt(meta?.analyzed_at)}
            </span>
          </span>
          {isAnalyzing && (
            <span className="inline-flex items-center gap-1.5 text-indigo-500 font-medium ml-auto">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              Đang phân tích…
            </span>
          )}
        </div>

        {/* Fallback warning banner */}
        {isFallback && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-amber-900">
                Đang dùng chế độ chấm điểm dự phòng
              </p>
              <p className="text-amber-800">
                Hệ thống AI hiện không khả dụng nên chúng tôi đang dùng thuật
                toán so khớp dựa trên từ khoá. Kết quả có thể kém chính xác
                hơn so với phân tích bằng AI.
              </p>
              {meta?.fallback_reason && (
                <p className="text-amber-700 text-xs">
                  <span className="font-medium">Lý do:</span> {meta.fallback_reason}
                  {meta.fallback_reason_code && (
                    <span className="font-mono opacity-70">
                      {" "}
                      ({meta.fallback_reason_code})
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
        )}

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
              <span className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                <MapPin className="w-4 h-4 text-gray-500" />
                {job.location}
              </span>
            )}
            {job.experience_required && job.experience_required !== "Chưa cập nhật" && (
              <span className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                <Briefcase className="w-4 h-4 text-gray-500" />
                {job.experience_required}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 font-mono text-xs">
              <Star className="w-3.5 h-3.5 text-gray-400" />
              {String(job.job_id).slice(0, 8)}
            </span>
          </div>
        </div>

        {/* Compatibility Score Card */}
        <div className={`rounded-2xl border p-6 ${compatibilityBg}`}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Tỷ lệ phù hợp tổng thể
              </p>
              <p className={`text-5xl font-bold mt-1 ${compatibilityColor}`}>
                {job.compatibility}%
              </p>
              <p className="text-xs text-gray-500 mt-2 max-w-md">
                Tổng hợp có trọng số từ 5 yếu tố bên dưới. Đây là điểm tham
                khảo, không phải đảm bảo cơ hội trúng tuyển.
              </p>
            </div>
            <div className={`w-20 h-20 rounded-full border-4 ${compatibilityColor} flex items-center justify-center shrink-0`}>
              <TrendingUp className={`w-8 h-8 ${compatibilityColor}`} />
            </div>
          </div>
        </div>

        {/* What was analyzed — transparency block */}
        {inputs && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 text-gray-900">
              <Info className="w-4 h-4 text-gray-500" />
              <h3 className="text-base font-semibold">Nội dung được phân tích</h3>
              <span className="text-xs text-gray-400 ml-1">
                (dữ liệu AI đã đọc)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* CV summary — values are AI-extracted from the CV content
                  (not from the upload-form filename). On rule-fallback the
                  same fields come from rule parsing of the CV sections. */}
              <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50/40">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-gray-800 font-semibold text-sm">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    Hồ sơ của bạn
                  </div>
                  <span className="text-[10px] uppercase tracking-wide text-gray-400">
                    {isFallback ? "rút trích bằng quy tắc" : "rút trích bởi AI"}
                  </span>
                </div>
                <dl className="text-sm text-gray-700 space-y-1.5">
                  <div className="flex justify-between gap-2">
                    <dt className="text-gray-500">Họ tên:</dt>
                    <dd className="font-medium text-right">
                      {displayName || (
                        <span className="text-amber-600 inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> chưa rõ
                        </span>
                      )}
                    </dd>
                  </div>
                  {displayHeadline && (
                    <div className="flex justify-between gap-2">
                      <dt className="text-gray-500">Vị trí mong muốn:</dt>
                      <dd className="font-medium text-right">{displayHeadline}</dd>
                    </div>
                  )}
                  <div className="flex justify-between gap-2">
                    <dt className="text-gray-500">Số năm KN:</dt>
                    <dd className="font-medium">
                      {displayYears ?? (
                        <span className="text-amber-600 inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> chưa rõ
                        </span>
                      )}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-gray-500">Địa điểm:</dt>
                    <dd className="font-medium text-right">
                      {displayLocation || (
                        <span className="text-amber-600 inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> chưa rõ
                        </span>
                      )}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-gray-500">Độ dài CV gửi cho AI:</dt>
                    <dd className="font-medium">
                      {inputs.cv.char_count.toLocaleString("vi-VN")} ký tự
                    </dd>
                  </div>
                </dl>
                <div className="pt-1 flex flex-wrap gap-1.5">
                  {inputs.cv.has_summary && (
                    <span className="text-[10px] uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200 rounded px-1.5 py-0.5">
                      có giới thiệu
                    </span>
                  )}
                  {inputs.cv.has_experience && (
                    <span className="text-[10px] uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200 rounded px-1.5 py-0.5">
                      có kinh nghiệm
                    </span>
                  )}
                  {inputs.cv.has_education && (
                    <span className="text-[10px] uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200 rounded px-1.5 py-0.5">
                      có học vấn
                    </span>
                  )}
                </div>
                {displaySkills.length > 0 && (
                  <div className="pt-1">
                    <p className="text-xs text-gray-500 mb-1.5">
                      Kỹ năng AI nhận diện ({displaySkills.length}):
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {displaySkills.map((s, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-white text-gray-700 text-xs rounded border border-gray-200"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {displayEducation.length > 0 && (
                  <div className="pt-1">
                    <p className="text-xs text-gray-500 mb-1.5">Học vấn:</p>
                    <ul className="text-xs text-gray-700 space-y-0.5 list-disc list-inside">
                      {displayEducation.map((e, i) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {displayLanguages.length > 0 && (
                  <div className="pt-1 flex flex-wrap gap-1.5">
                    <p className="text-xs text-gray-500 w-full mb-0.5">
                      Ngôn ngữ:
                    </p>
                    {displayLanguages.map((l, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded border border-indigo-100"
                      >
                        {l}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Job summary */}
              <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50/40">
                <div className="flex items-center gap-2 text-gray-800 font-semibold text-sm">
                  <ClipboardList className="w-4 h-4 text-indigo-500" />
                  Mô tả công việc
                </div>
                <dl className="text-sm text-gray-700 space-y-1.5">
                  <div className="flex justify-between gap-2">
                    <dt className="text-gray-500">Vị trí:</dt>
                    <dd className="font-medium text-right">{inputs.job.title}</dd>
                  </div>
                  {inputs.job.company && (
                    <div className="flex justify-between gap-2">
                      <dt className="text-gray-500">Công ty:</dt>
                      <dd className="font-medium text-right">
                        {inputs.job.company}
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between gap-2">
                    <dt className="text-gray-500">Kỹ năng yêu cầu:</dt>
                    <dd className="font-medium">{inputs.job.skill_count}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-gray-500">Số năm KN yêu cầu:</dt>
                    <dd className="font-medium">
                      {inputs.job.years_required ?? (
                        <span className="text-amber-600 inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> chưa rõ
                        </span>
                      )}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-gray-500">Địa điểm:</dt>
                    <dd className="font-medium text-right">
                      {inputs.job.location || (
                        <span className="text-amber-600 inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> chưa rõ
                        </span>
                      )}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-gray-500">Độ dài JD:</dt>
                    <dd className="font-medium">
                      {inputs.job.char_count.toLocaleString("vi-VN")} ký tự
                    </dd>
                  </div>
                </dl>
                <div className="pt-1 flex flex-wrap gap-1.5">
                  {inputs.job.has_description && (
                    <span className="text-[10px] uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200 rounded px-1.5 py-0.5">
                      có mô tả
                    </span>
                  )}
                  {inputs.job.has_requirements && (
                    <span className="text-[10px] uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200 rounded px-1.5 py-0.5">
                      có yêu cầu
                    </span>
                  )}
                </div>
                {inputs.job.skills_preview.length > 0 && (
                  <div className="pt-1">
                    <p className="text-xs text-gray-500 mb-1.5">
                      Kỹ năng JD yêu cầu:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {inputs.job.skills_preview.map((s, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-white text-gray-700 text-xs rounded border border-gray-200"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* AI commentary */}
        {job.explanation && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-2">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Nhận xét tổng quan
              {isFallback && (
                <span className="text-xs font-normal text-gray-400 ml-1">
                  (sinh bởi rule-based)
                </span>
              )}
            </h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {job.explanation}
            </p>
          </div>
        )}

        {/* Skills Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Matched Skills */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-semibold text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Kỹ năng bạn đã có
              {job.matched_skills && (
                <span className="text-xs font-medium text-gray-400">
                  ({job.matched_skills.length})
                </span>
              )}
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.matched_skills && job.matched_skills.length > 0 ? (
                job.matched_skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-full border border-emerald-100"
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
            <h3 className="text-base font-semibold text-amber-700 flex items-center gap-2">
              <CircleHelp className="w-4 h-4" />
              Kỹ năng JD yêu cầu nhưng CV thiếu
              {job.missing_skills && (
                <span className="text-xs font-medium text-gray-400">
                  ({job.missing_skills.length})
                </span>
              )}
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.missing_skills && job.missing_skills.length > 0 ? (
                job.missing_skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-amber-50 text-amber-700 text-sm font-medium rounded-full border border-amber-100"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-emerald-600 font-medium italic">
                  Bạn đã đáp ứng đầy đủ kỹ năng kỹ thuật!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        {job.scores && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between gap-2 text-gray-900">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gray-100 rounded-md">
                  <TrendingUp className="w-4 h-4 text-gray-600" />
                </div>
                <h3 className="text-base font-semibold">
                  Phân tích chi tiết 5 yếu tố
                </h3>
              </div>
              {isAnalyzing && (
                <span className="flex items-center gap-1.5 text-xs text-indigo-500 font-medium">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  Đang phân tích…
                </span>
              )}
            </div>
            <div className="space-y-4">
              {(Object.keys(scoreLabels) as ScoreKey[]).map((key) => {
                const value = (job.scores?.[key] as number | undefined) ?? 0;
                return (
                  <ScoreBar
                    key={key}
                    label={scoreLabels[key]}
                    hint={scoreHints[key]}
                    value={value}
                    lowConfidence={isLowConfidenceScore(key, value, inputs)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Strengths / Improvements */}
        {((job.strengths && job.strengths.length > 0) ||
          (job.improvements && job.improvements.length > 0)) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {job.strengths && job.strengths.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
                <h3 className="text-base font-semibold text-emerald-700">
                  Điểm mạnh của bạn
                </h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  {job.strengths.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {job.improvements && job.improvements.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
                <h3 className="text-base font-semibold text-amber-700">
                  Gợi ý cải thiện
                </h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  {job.improvements.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Methodology accordion */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <button
            onClick={() => setShowMethodology((s) => !s)}
            className="w-full flex items-center justify-between gap-2 px-6 py-4 text-left hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2 text-gray-900 font-semibold text-base">
              <Info className="w-4 h-4 text-gray-500" />
              Cách điểm phù hợp được tính
            </span>
            {showMethodology ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
          {showMethodology && (
            <div className="border-t border-gray-100 px-6 py-5 space-y-4 text-sm text-gray-700">
              <p>
                Điểm tổng được tổng hợp có trọng số từ 5 yếu tố. Khi AI khả
                dụng, mô hình ngôn ngữ sẽ đọc trực tiếp CV và mô tả công việc
                rồi đưa ra điểm từng yếu tố. Khi AI không khả dụng, hệ thống
                rơi về thuật toán so khớp từ khoá (rule-based).
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm border-collapse">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-gray-600">
                      <th className="py-2 px-3 border-b border-gray-200 font-semibold">
                        Yếu tố
                      </th>
                      <th className="py-2 px-3 border-b border-gray-200 font-semibold">
                        Trọng số
                      </th>
                      <th className="py-2 px-3 border-b border-gray-200 font-semibold">
                        Ý nghĩa
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    <tr>
                      <td className="py-2 px-3 border-b border-gray-100 font-medium">
                        Kỹ thuật / Công nghệ
                      </td>
                      <td className="py-2 px-3 border-b border-gray-100">50%</td>
                      <td className="py-2 px-3 border-b border-gray-100">
                        Tỷ lệ kỹ năng JD yêu cầu có trong CV.
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 border-b border-gray-100 font-medium">
                        Tiêu đề công việc
                      </td>
                      <td className="py-2 px-3 border-b border-gray-100">25%</td>
                      <td className="py-2 px-3 border-b border-gray-100">
                        Tiêu đề JD khớp vị trí mong muốn của bạn.
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 border-b border-gray-100 font-medium">
                        Mô tả công việc
                      </td>
                      <td className="py-2 px-3 border-b border-gray-100">10%</td>
                      <td className="py-2 px-3 border-b border-gray-100">
                        Mức trùng từ khoá giữa kinh nghiệm CV và phần mô tả JD.
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 border-b border-gray-100 font-medium">
                        Địa điểm
                      </td>
                      <td className="py-2 px-3 border-b border-gray-100">10%</td>
                      <td className="py-2 px-3 border-b border-gray-100">
                        Cùng tỉnh / thành phố với JD.
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium">Kinh nghiệm</td>
                      <td className="py-2 px-3">5%</td>
                      <td className="py-2 px-3">
                        Số năm bạn có so với số năm JD yêu cầu.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-gray-600">
                Biểu tượng{" "}
                <AlertTriangle className="w-3.5 h-3.5 inline text-amber-500" />{" "}
                bên cạnh điểm có nghĩa dữ liệu đầu vào bị thiếu, không phải bạn
                không phù hợp ở yếu tố đó.
              </p>
            </div>
          )}
        </div>

        {/* AI disclaimer footer */}
        <div className="flex items-start gap-2 text-xs text-gray-500 px-2 pt-2 leading-relaxed">
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <p>
            Phân tích này được sinh tự động bởi AI{meta?.model ? ` (${meta.model})` : ""} dựa
            trên nội dung CV và mô tả công việc. Kết quả mang tính tham khảo,{" "}
            <span className="font-medium">không thay thế quyết định</span> của
            nhà tuyển dụng. Hãy cân nhắc thêm các yếu tố khác như văn hoá công
            ty, chế độ phúc lợi, lộ trình thăng tiến… trước khi ứng tuyển.
          </p>
        </div>
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
