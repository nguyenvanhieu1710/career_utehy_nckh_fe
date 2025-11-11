// components/common/CompanyCard.tsx
import Image from "next/image";
import { Heart } from "lucide-react";

interface CompanyCardProps {
  logo: string;
  name: string;
  jobsCount: number;
}

export default function CompanyCard({ logo, name, jobsCount }: CompanyCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col items-center text-center transition-transform hover:scale-[1.02]">
      <div className="mb-6 w-32 h-20 relative">
        <Image
          src={logo}
          alt={name}
          fill
          className="object-contain"
        />
      </div>

      <h3 className="text-xl font-bold text-gray-900">{name}</h3>

      <div className="mt-4 flex items-center justify-center gap-1 bg-[#E6E6E6] w-32 px-4 py-2 rounded-sm">
        <span className="text-[#5C5C5C]">{jobsCount}</span>
        <span className="text-[#5C5C5C] text-sm">việc làm</span>
      </div>

      <button className="mt-2 flex items-center gap-2 bg-[#E6E6E6] w-32 px-4 py-2 rounded-sm">
        <span className="text-[#5C5C5C]">Yêu thích</span>
        <Heart className="w-5 h-5 text-[#5C5C5C] fill-[#5C5C5C]" />
      </button>
    </div>
  );
}