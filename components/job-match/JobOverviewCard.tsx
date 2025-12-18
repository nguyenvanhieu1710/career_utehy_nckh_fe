"use client";

import {
  Building2,
  MapPin,
  Clock,
  DollarSign,
  Bookmark,
  Share2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Company {
  id: string;
  name: string;
  logo?: string;
  location?: string;
  size?: string;
  industry?: string;
}

interface JobOverviewCardProps {
  job: {
    id: string;
    title: string;
    company: Company;
    location: string;
    salary?: string;
    job_type: "full-time" | "part-time" | "contract" | "intern" | "freelance";
    work_arrangement: "remote" | "hybrid" | "onsite";
    posted_date: string;
  };
  onSave?: () => void;
  onShare?: () => void;
  onApply?: () => void;
  isSaved?: boolean;
  className?: string;
}

export function JobOverviewCard({
  job,
  onSave,
  onShare,
  isSaved = false,
  className = "",
}: JobOverviewCardProps) {
  const getJobTypeLabel = (jobType: string) => {
    const labels = {
      "full-time": "Toàn thời gian",
      "part-time": "Bán thời gian",
      contract: "Hợp đồng",
      intern: "Thực tập",
      freelance: "Freelance",
    };
    return labels[jobType as keyof typeof labels] || jobType;
  };

  const getWorkArrangementLabel = (arrangement: string) => {
    const labels = {
      remote: "Làm việc từ xa",
      hybrid: "Kết hợp",
      onsite: "Tại văn phòng",
    };
    return labels[arrangement as keyof typeof labels] || arrangement;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Hôm qua";
    if (diffDays <= 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Company Logo */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              <Image
                src={job.company.logo || "/companies/default.png"}
                alt={job.company.name}
                width={80}
                height={80}
                className="object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/companies/default.png";
                }}
              />
            </div>
          </div>

          {/* Job Info */}
          <div className="flex-1">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {job.title}
                </h1>
                <div className="flex items-center gap-2 text-gray-600 mb-3">
                  <Building2 className="h-4 w-4" />
                  <span className="font-medium">{job.company.name}</span>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                  </div>
                  {job.salary && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span>{job.salary}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Đăng {formatDate(job.posted_date)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Badge variant="secondary">
                    {getJobTypeLabel(job.job_type)}
                  </Badge>
                  <Badge variant="outline">
                    {getWorkArrangementLabel(job.work_arrangement)}
                  </Badge>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <button
                  className={`p-2 border rounded-lg transition-colors ${
                    isSaved
                      ? "text-green-600 border-green-600 hover:bg-green-50"
                      : "text-gray-600 border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={onSave}
                  title={isSaved ? "Bỏ lưu" : "Lưu công việc"}
                >
                  <Bookmark
                    className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`}
                  />
                </button>
                <button
                  className="p-2 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={onShare}
                  title="Chia sẻ"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                <Link
                  href={`/career/jobs/${job.id}`}
                  className="flex items-center gap-1 p-2 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  title="Xem chi tiết công việc"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="ml-1 hidden sm:inline">Chi tiết</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
