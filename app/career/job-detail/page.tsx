"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import JobDetailHeader from "@/components/job-detail/JobDetailHeader";
import JobDescription from "@/components/job-detail/JobDescription";
import CompanyDescription from "@/components/job-detail/CompanyDescription";
import { publicAPI, PublicJobDetail } from "@/services/public";
import { behaviorAPI } from "@/services/behavior";

function JobDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("id");

  const [job, setJob] = useState<PublicJobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      setError("Thiếu mã công việc trong đường dẫn.");
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    const viewStart = performance.now();
    publicAPI
      .getJobById(jobId)
      .then((res) => {
        if (cancelled) return;
        const data = res.data || null;
        setJob(data);
        // Track the job view as soon as we have the data.
        if (data) {
          const company: any = (data as any).company;
          behaviorAPI.trackJobView({
            job_id: jobId,
            job_title: (data as any).title,
            company_id: company?.id ? String(company.id) : undefined,
            company_name: company?.name,
            category_id: (data as any).category_id,
            category_slug: (data as any).category_slug,
            category_title: (data as any).category_title,
            action: "view",
            source:
              searchParams.get("source") ||
              (document.referrer ? "referrer" : "direct"),
          });
          if ((data as any).category_slug || (data as any).category_id) {
            behaviorAPI.trackCategory({
              interaction_type: "view_detail",
              category_id: (data as any).category_id,
              category_slug: (data as any).category_slug,
              category_title: (data as any).category_title,
              related_job_id: jobId,
              related_job_title: (data as any).title,
              source: "job_detail",
            });
          }
        }
      })
      .catch((e: any) => {
        if (cancelled) return;
        const status = e?.response?.status;
        if (status === 404) {
          setError("Không tìm thấy công việc hoặc công việc đã bị gỡ.");
        } else {
          setError(
            e?.response?.data?.detail ||
              e?.message ||
              "Không tải được thông tin công việc.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      // On unmount, log dwell time + scroll depth so we know how engaged
      // the user was with this job.
      try {
        if (typeof window !== "undefined" && jobId) {
          const duration = Math.round(performance.now() - viewStart);
          const docHeight =
            (document.documentElement?.scrollHeight || 1) -
            (window.innerHeight || 0);
          const depth = docHeight > 0
            ? Math.min(
                100,
                Math.round(((window.scrollY || 0) / docHeight) * 100),
              )
            : 0;
          behaviorAPI.trackJobView({
            job_id: jobId,
            action: depth >= 80 ? "scroll_complete" : "view",
            view_duration_ms: duration,
            scroll_depth: depth,
          });
        }
      } catch {
        // ignore — best effort
      }
    };
  }, [jobId, searchParams]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
          <Loader2 className="h-10 w-10 animate-spin text-[#0C6A4E]" />
          <p className="text-sm">Đang tải thông tin công việc…</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-sm text-gray-700 mb-5">
            {error || "Không tải được thông tin công việc."}
          </p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-[#0C6A4E] hover:underline text-sm font-medium cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 text-gray-600 bg-white">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-gray-500 hover:text-[#0C6A4E] transition-colors cursor-pointer text-sm font-medium mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại
      </button>

      <div className="space-y-8">
        <JobDetailHeader job={job} />
        <div className="border w-full h-1 bg-[#676767] mb-1"></div>
        <JobDescription job={job} />
        <div className="border w-full h-1 bg-[#676767] mb-1"></div>
        <CompanyDescription company={job.company} />
      </div>
    </div>
  );
}

export default function JobDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0C6A4E]"></div>
          </div>
        </div>
      }
    >
      <JobDetailContent />
    </Suspense>
  );
}
