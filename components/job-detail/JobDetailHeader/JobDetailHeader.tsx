import { MapPin, Calendar, Heart } from "lucide-react";
import { Job } from "@/types/job";

type JobDetailHeaderProps = {
  job: Job;
  isFavorited: boolean;
  onFavorite: (jobId: string, isFavorited: boolean) => void;
};

export default function JobDetailHeader({ job, isFavorited, onFavorite }: JobDetailHeaderProps) {
  // Tính toán số ngày còn lại bằng Date thuần
  const getRemainingDays = (dateStr: string | undefined) => {
    if (!dateStr) return null;
    const expiryDate = new Date(dateStr);
    const today = new Date();
    
    expiryDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "---";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (e) {
      return "---";
    }
  };

  const remainingDays = getRemainingDays(job.expired_at);

  return (
    <div className="bg-white mt-1 mb-1 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <div className="w-32 h-32 sm:w-48 sm:h-48 bg-gray-50 border rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden mx-auto sm:mx-0">
          <img
            src={job.image_url || job.company?.logo || "/logo/default-company.png"}
            alt={job.company?.name || "Company Logo"}
            className="object-contain w-full h-full p-2"
          />
        </div>
        
        <div className="flex-1">
          <div className="mb-3 sm:mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-[#0C6A4E] line-clamp-2 break-words">
              {job.title || "---"}
            </h1>
            <p className="text-gray-700 font-medium text-sm sm:text-base truncate" title={job.company?.name}>
              {job.company?.name || "---"}
            </p>
            <div className="flex flex-col gap-1 text-xs sm:text-sm text-[#5C5C5C] mt-1 sm:mt-1">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                <span>{job.location || "---"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                <span>
                  Hạn ứng tuyển: {formatDate(job.expired_at)}
                  {remainingDays !== null && remainingDays > 0 && ` (còn ${remainingDays} ngày)`}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-0">
            {job.url_source ? (
              <a 
                href={job.url_source}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#0C6A4E] hover:bg-[#0C6A4E]/80 text-white px-4 sm:px-5 py-2 rounded-lg text-sm font-medium transition w-full sm:w-auto text-center"
              >
                Ứng tuyển ngay
              </a>
            ) : (
              <button className="bg-[#0C6A4E] hover:bg-[#0C6A4E]/80 text-white px-4 sm:px-5 py-2 rounded-lg text-sm font-medium transition w-full sm:w-auto text-center">
                Ứng tuyển ngay
              </button>
            )}
            
            <button 
              onClick={() => onFavorite(job.id, !isFavorited)}
              className={`flex items-center justify-center gap-2 border px-4 sm:px-5 py-2 rounded-lg text-sm font-medium transition w-full sm:w-auto text-center cursor-pointer ${
                isFavorited 
                  ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100" 
                  : "border-[#0C6A4E] text-[#0C6A4E] hover:bg-[#0C6A4E]/10"
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`} />
              {isFavorited ? "Đã lưu" : "Lưu việc làm"}
            </button>
          </div>
        </div>
      </div>      
    </div>
  );
}
