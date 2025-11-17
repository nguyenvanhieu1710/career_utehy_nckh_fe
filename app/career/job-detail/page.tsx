"use client"
import JobDetailHeader from "@/components/job-detail/JobDetailHeader";
import JobDescription from "@/components/job-detail/JobDescription";
import CompanyDescription from "@/components/job-detail/CompanyDescription";
import { useSearchParams } from "next/navigation";


export default function JobDetailPage() {
  const searchParams = useSearchParams();
  const job_id = searchParams.get('id');
  
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
