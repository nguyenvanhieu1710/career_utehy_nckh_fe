import JobDetailHeader from "@/components/job-detail/JobDetailHeader";
import JobDescription from "@/components/job-detail/JobDescription";
import CompanyDescription from "@/components/job-detail/CompanyDescription";

type JobDetailProps = {
  jobId: string;
};

export default function JobDetailPage({ jobId }: JobDetailProps) {
  // TODO: Fetch job data using jobId

  return (
    <div className="container mx-auto px-4 py-8">
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
