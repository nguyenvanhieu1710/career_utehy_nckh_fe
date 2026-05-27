"use client";

import { useEffect, useState } from "react";
import {
  MapPin,
  Calendar,
  ExternalLink,
  Sparkles,
  Heart,
  Briefcase,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { PublicJobDetail } from "@/services/public";

interface JobDetailHeaderProps {
  job: PublicJobDetail;
}

const DEFAULT_LOGO = "/default-job.png";

function pickLogo(rawLogo: string | null | undefined): string {
  if (!rawLogo) return DEFAULT_LOGO;
  return rawLogo;
}

function ensureExternalUrl(raw: string): string {
  return raw.startsWith("http") ? raw : `https://${raw}`;
}

function formatDeadline(expiredAt?: string | null): string | null {
  if (!expiredAt) return null;
  const exp = new Date(expiredAt);
  if (Number.isNaN(exp.getTime())) return null;
  const now = new Date();
  const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "Đã hết hạn";
  if (diffDays === 0) return "Hết hạn hôm nay";
  return `Hạn ứng tuyển: còn ${diffDays} ngày`;
}

function formatPostedAt(iso?: string | null): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("vi-VN");
  } catch {
    return null;
  }
}

export default function JobDetailHeader({ job }: JobDetailHeaderProps) {
  const router = useRouter();
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("favorite_job_ids");
      if (!raw) return;
      const ids: string[] = JSON.parse(raw);
      if (Array.isArray(ids)) setIsFavorited(ids.includes(String(job.id)));
    } catch {
      /* ignore */
    }
  }, [job.id]);

  const toggleFavorite = () => {
    try {
      const raw = localStorage.getItem("favorite_job_ids");
      const ids: string[] = raw ? JSON.parse(raw) : [];
      const jobIdStr = String(job.id);
      const next = ids.includes(jobIdStr)
        ? ids.filter((id) => id !== jobIdStr)
        : [...ids, jobIdStr];
      localStorage.setItem("favorite_job_ids", JSON.stringify(next));
      setIsFavorited(next.includes(jobIdStr));
    } catch {
      /* ignore */
    }
  };

  const handleApply = () => {
    if (job.url_source) {
      window.open(ensureExternalUrl(job.url_source), "_blank", "noopener,noreferrer");
    }
  };

  const handleEvaluateCv = () => {
    // Pre-populate the suitable-job-detail cache so it doesn't need to
    // re-fetch the job via the permissioned /job/get-job endpoint (which
    // regular users don't have access to). Mirrors the SuitableJobs flow.
    try {
      sessionStorage.setItem(
        "selected_job_detail",
        JSON.stringify({
          job_id: job.id,
          title: job.title,
          company: job.company?.name || "Đang cập nhật",
          location: job.location,
          compatibility: 0,
          experience_required:
            job.years_of_experience != null
              ? `${job.years_of_experience} năm`
              : undefined,
          url_source: job.url_source,
        }),
      );
    } catch {
      /* ignore */
    }
    router.push(`/career/suitable-job-detail?jobId=${job.id}`);
  };

  const handleOpenSource = () => {
    if (!job.url_source) return;
    window.open(ensureExternalUrl(job.url_source), "_blank", "noopener,noreferrer");
  };

  const deadline = formatDeadline(job.expired_at);
  const posted = formatPostedAt(job.posted_at || job.created_at);
  const companyName = job.company?.name || "Đang cập nhật";
  const logo = pickLogo(job.company?.logo_url || job?.image_url);


  return (
    <div className="bg-white mt-1 mb-1 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <div className="w-32 h-32 sm:w-48 sm:h-48 bg-gray-50 border rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden mx-auto sm:mx-0">
          <img
            src={logo}
            alt={companyName}
            className="object-contain w-full h-full p-2"
          />
        </div>

        <div className="flex-1">
          <div className="mb-3 sm:mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-[#0C6A4E] line-clamp-2 break-words">
              {job.title}
            </h1>
            <p
              className="text-black-700 font-medium text-sm sm:text-base truncate"
              title={companyName}
            >
              {companyName}
            </p>
            <div className="flex flex-col gap-1 text-xs sm:text-sm text-[#5C5C5C] mt-1 sm:mt-1">
              {job.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                  <span>{job.location}</span>
                </div>
              )}
              {posted && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                  <span>Đăng ngày {posted}</span>
                </div>
              )}
              {deadline && (
                <div className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                  <span>{deadline}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-0">
            <button
              onClick={handleApply}
              disabled={!job.url_source}
              className="bg-[#0C6A4E] hover:bg-[#0C6A4E]/80 text-white px-4 sm:px-5 py-2 rounded-lg text-sm font-medium transition w-full sm:w-auto text-center disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              Ứng tuyển
            </button>
            <button
              onClick={handleEvaluateCv}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-5 py-2 rounded-lg text-sm font-medium transition w-full sm:w-auto text-center inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Đánh giá CV
            </button>
            {job.url_source && (
              <button
                onClick={handleOpenSource}
                className="border border-[#0C6A4E] hover:bg-[#0C6A4E]/10 px-4 sm:px-5 py-2 rounded-lg text-sm font-medium text-[#0C6A4E] transition w-full sm:w-auto text-center inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                Mở trang gốc
              </button>
            )}
            <button
              onClick={toggleFavorite}
              className={`px-4 sm:px-5 py-2 rounded-lg text-sm font-medium transition w-full sm:w-auto text-center inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                isFavorited
                  ? "bg-red-50 border border-red-200 text-red-600"
                  : "border border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Heart
                className={`w-4 h-4 ${isFavorited ? "fill-red-500 text-red-500" : ""}`}
              />
              {isFavorited ? "Đã lưu" : "Lưu việc"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
