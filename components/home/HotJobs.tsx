// components/home/HotJobs.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import SectionTitle from "@/components/common/SectionTitle";
import JobCard from "@/components/common/JobCard";
import PaginationArrows from "@/components/common/PaginationArrows";
import { cvAPI } from "@/services/cv";

interface HotJobItem {
  job_id: string;
  logo: string;
  title: string;
  company: string;
  location: string;
  url_source?: string;
}

const PAGE_SIZE = 6;
const DEFAULT_LOGO = "/default-job.png";

/** next/image only loads remote URLs from whitelisted hosts (see next.config.ts).
 *  Company logo URLs from crawled sources are arbitrary, so we only keep ones
 *  served from our own uploads path and fall back to the default otherwise. */
function pickLogo(rawLogo: string | null | undefined): string {
  if (!rawLogo) return DEFAULT_LOGO;
  return rawLogo;
}

export default function HotJobs() {
  const [jobs, setJobs] = useState<HotJobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    cvAPI
      .getHotJobs(18)
      .then((res) => {
        if (cancelled) return;
        const matches: any[] = res.data?.matches || [];
        setJobs(
          matches.map((m) => ({
            job_id: String(m.job_id),
            logo: pickLogo(m.logo_url || m.image_url),
            title: m.job_title || "Việc làm mới",
            company: m.company || "Đang cập nhật",
            location: m.location || "",
            url_source: m.url_source || undefined,
          })),
        );
      })
      .catch((e) => {
        if (cancelled) return;
        setError(
          e?.response?.data?.detail ||
          e?.message ||
          "Không tải được danh sách việc làm.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const totalPages = Math.max(1, Math.ceil(jobs.length / PAGE_SIZE));
  const visibleJobs = useMemo(
    () => jobs.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [jobs, page],
  );


  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <SectionTitle title="VIỆC LÀM HOT" />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-3" />
            <p className="text-sm">Đang tải việc làm mới…</p>
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-sm text-gray-700">{error}</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="max-w-md mx-auto bg-white border border-gray-200 rounded-2xl p-8 text-center text-gray-500 text-sm">
            Chưa có việc làm nào được đăng tải.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {visibleJobs.map((job, index) => (
                <JobCard key={job.job_id || index} {...job} index={index} logo={job.logo} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <PaginationArrows
                  hasPrevious={page > 0}
                  hasNext={page < totalPages - 1}
                  onPrevious={() => setPage((p) => Math.max(0, p - 1))}
                  onNext={() =>
                    setPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                />
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
