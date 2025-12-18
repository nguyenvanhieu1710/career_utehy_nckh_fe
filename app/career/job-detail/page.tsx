"use client";
import { Suspense } from "react";
import JobDetailHeader from "@/components/job-detail/JobDetailHeader";
import JobDescription from "@/components/job-detail/JobDescription";
import CompanyDescription from "@/components/job-detail/CompanyDescription";
import { useSearchParams } from "next/navigation";

function JobDetailContent() {
  const searchParams = useSearchParams();
  const job_id = searchParams.get("id");

  return (
    <div className="container mx-auto px-4 py-8 text-gray-600 bg-white">
      <div className="space-y-8">
        <JobDetailHeader />
        <div className="border w-full h-1 bg-[#676767] mb-1"></div>
        <JobDescription />
        <div className="border w-full h-1 bg-[#676767] mb-1"></div>
        <CompanyDescription />
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
