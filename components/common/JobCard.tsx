// components/common/JobCard.tsx
import Image from "next/image";
import { Heart, ExternalLink } from "lucide-react";
import Link from "next/link";

interface JobCardProps {
  logo: string;
  title: string;
  company: string;
  location: string;
  job_id: string;
}

export default function JobCard({
  logo,
  title,
  company,
  location,
  job_id,
}: JobCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 transition-transform hover:scale-[1.02] hover:shadow-md h-full flex flex-col">
      <div className="flex gap-4 flex-1">
        <div className="relative w-1/4 min-w-[70px] max-w-[90px] flex-shrink-0 h-full flex items-center">
          <div className="w-full">
            <div className="relative aspect-square">
              <Image
                src={logo}
                alt={company}
                fill
                className="object-contain rounded-lg"
                sizes="(max-width: 768px) 25vw, 100px"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <Link href={`/job-detail?id=${job_id}`}>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-[#852121] line-clamp-2 leading-tight break-words">
                {title}
              </h3>
              <p className="text-sm text-[#000000] mt-1">{company}</p>
              <p className="text-sm text-[#656565] mt-1">{location}</p>
            </div>

          </Link>
          <div className="mt-4 pt-4">
            <div className="flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 bg-[#E6E6E6] text-[#5C5C5C] font-medium text-sm py-2.5 rounded-lg transition">
                Link
                <ExternalLink className="w-4 h-4" />
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#E6E6E6] text-[#5C5C5C] transition rounded-lg">
                <span className="text-sm font-medium">Yêu thích</span>
                <Heart className="w-5 h-5 text-[#5C5C5C] fill-[#5C5C5C]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
