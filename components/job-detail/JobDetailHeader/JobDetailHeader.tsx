import { MapPin, Calendar, DollarSign, Briefcase } from "lucide-react";

type JobDetailHeaderProps = {
  // Props will be added later
};

export default function JobDetailHeader({}: JobDetailHeaderProps) {
  return (
    <div className="bg-white mt-1 mb-1 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <div className="w-32 h-32 sm:w-48 sm:h-48 bg-gray-50 border rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden mx-auto sm:mx-0">
          <img
            src="/logo/kyna-english.png"
            alt="Company Logo"
            className="object-contain w-14 h-14 sm:w-32 sm:h-32"
          />
        </div>
        
        <div className="flex-1">
          <div className="mb-3 sm:mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-[#0C6A4E] line-clamp-2 break-words">
              Giáo viên Tiếng Anh online
            </h1>
            <p className="text-black-700 font-medium text-sm sm:text-base truncate" title="Công ty cổ phần Dream Viet Education – Kyna English">
              Công ty cổ phần Dream Viet Education – Kyna English
            </p>
            <div className="flex flex-col gap-1 text-xs sm:text-sm text-[#5C5C5C] mt-1 sm:mt-1">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                <span>Toàn quốc</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                <span>Hạn ứng tuyển: còn 18 ngày</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-0">
            <button className="bg-[#0C6A4E] hover:bg-[#0C6A4E]/80 text-white px-4 sm:px-5 py-2 rounded-lg text-sm font-medium transition w-full sm:w-auto text-center">
              Ứng tuyển
            </button>
            <button className="border border-[#0C6A4E] hover:bg-[#0C6A4E]/10 px-4 sm:px-5 py-2 rounded-lg text-sm font-medium text-[#0C6A4E] transition w-full sm:w-auto text-center">
              Lưu việc
            </button>
          </div>
        </div>
      </div>      
    </div>
  );
}

