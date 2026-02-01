"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Users,
  Star,
  Heart,
  ExternalLink,
  Share2,
  Building,
  Calendar,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Job } from "@/types/job";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface JobDetailModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onApply?: (jobId: string) => void;
  onFavorite?: (jobId: string, isFavorited: boolean) => void;
  isFavorited?: boolean;
}

export const JobDetailModal = ({
  job,
  isOpen,
  onClose,
  onApply,
  onFavorite,
  isFavorited = false,
}: JobDetailModalProps) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "company" | "requirements"
  >("overview");

  if (!job) return null;

  const formatJobType = (jobType: string) => {
    const typeMap: Record<string, string> = {
      "full-time": "Toàn thời gian",
      "part-time": "Bán thời gian",
      contract: "Hợp đồng",
      internship: "Thực tập",
    };
    return typeMap[jobType] || jobType;
  };

  const formatWorkArrangement = (arrangement: string) => {
    const arrangementMap: Record<string, string> = {
      remote: "Làm việc từ xa",
      hybrid: "Hybrid",
      onsite: "Tại văn phòng",
    };
    return arrangementMap[arrangement] || arrangement;
  };

  const formatPostedDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffInDays === 0) return "Hôm nay";
    if (diffInDays === 1) return "Hôm qua";
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} tuần trước`;
    return date.toLocaleDateString("vi-VN");
  };

  const handleApply = () => {
    onApply?.(job.id);
  };

  const handleFavorite = () => {
    onFavorite?.(job.id, !isFavorited);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: job.title,
          text: `${job.title} tại ${job.company.name}`,
          url: window.location.href,
        });
      } catch (error) {
        // Handle sharing error silently or show user-friendly message
        // Could implement proper error logging service here
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  const tabs: Array<{
    id: "overview" | "company" | "requirements";
    label: string;
    icon: typeof Briefcase;
  }> = [
    { id: "overview", label: "Tổng quan", icon: Briefcase },
    { id: "company", label: "Công ty", icon: Building },
    { id: "requirements", label: "Yêu cầu", icon: CheckCircle },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 bg-white flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 z-10">
          <div className="flex items-start justify-between p-6">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Briefcase className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold text-gray-900">
                      {job.title}
                    </h2>
                    {job.is_featured && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                    {job.is_urgent && (
                      <span className="bg-red-50 text-red-700 text-xs font-medium px-2 py-1 rounded-full">
                        Gấp
                      </span>
                    )}
                  </div>
                  <p className="text-green-600 font-medium">
                    {job.company.name}
                  </p>
                </div>
              </div>

              {/* Quick Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {formatJobType(job.job_type)}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatPostedDate(job.posted_date)}
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {job.salary}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                title="Chia sẻ"
              >
                <Share2 className="h-5 w-5" />
              </button>
              <button
                onClick={handleFavorite}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  isFavorited
                    ? "text-red-600 bg-red-50 hover:bg-red-100"
                    : "text-gray-500 hover:text-red-600 hover:bg-gray-100"
                }`}
                title={isFavorited ? "Bỏ lưu" : "Lưu việc làm"}
              >
                <Heart
                  className={`h-5 w-5 ${isFavorited ? "fill-current" : ""}`}
                />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(
                      tab.id as "overview" | "company" | "requirements",
                    )
                  }
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors relative cursor-pointer ${
                    activeTab === tab.id
                      ? "text-green-600 border-b-2 border-green-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="p-6"
            >
              {activeTab === "overview" && (
                <div className="space-y-8">
                  {/* Job Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Mô tả công việc
                    </h3>
                    <div className="prose prose-sm max-w-none text-gray-700">
                      <p className="leading-relaxed">{job.description}</p>
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Kỹ năng yêu cầu
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill) => (
                        <span
                          key={skill}
                          className="bg-green-50 text-green-700 text-sm font-medium px-3 py-1 rounded-full border border-green-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Benefits */}
                  {job.benefits && job.benefits.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Phúc lợi
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {job.benefits.map((benefit) => (
                          <div
                            key={benefit}
                            className="flex items-center gap-2"
                          >
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                            <span className="text-gray-700">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Work Arrangement */}
                  {job.work_arrangement && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Hình thức làm việc
                      </h3>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-blue-600" />
                          <span className="font-medium text-blue-900">
                            {formatWorkArrangement(job.work_arrangement)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "company" && (
                <div className="space-y-8">
                  {/* Company Info */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                        <Building className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {job.company.name}
                        </h3>
                        {job.company.location && (
                          <div className="flex items-center gap-1 text-gray-600 mb-2">
                            <MapPin className="h-4 w-4" />
                            {job.company.location}
                          </div>
                        )}
                        <p className="text-gray-700">
                          Công ty công nghệ hàng đầu chuyên phát triển các giải
                          pháp phần mềm hiện đại.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Company Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        50+
                      </div>
                      <div className="text-sm text-gray-600">Nhân viên</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        5+
                      </div>
                      <div className="text-sm text-gray-600">
                        Năm kinh nghiệm
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        100+
                      </div>
                      <div className="text-sm text-gray-600">Dự án</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600 mb-1">
                        4.8
                      </div>
                      <div className="text-sm text-gray-600">Đánh giá</div>
                    </div>
                  </div>

                  {/* Other Jobs */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Việc làm khác tại {job.company.name}
                    </h3>
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                Backend Developer
                              </h4>
                              <p className="text-sm text-gray-600">
                                Hà Nội • Toàn thời gian
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-gray-900">
                                20 - 30 triệu
                              </div>
                              <div className="text-sm text-gray-500">
                                2 ngày trước
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "requirements" && (
                <div className="space-y-8">
                  {/* Requirements */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Yêu cầu công việc
                    </h3>
                    <div className="space-y-3">
                      {job.requirements.map((requirement, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{requirement}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Nice to Have */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Ưu tiên
                    </h3>
                    <div className="space-y-3">
                      {[
                        "Kinh nghiệm với GraphQL",
                        "Hiểu biết về microservices",
                        "Kỹ năng leadership",
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Application Process */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-green-900 mb-3">
                      Quy trình ứng tuyển
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          1
                        </div>
                        <span className="text-green-800">Nộp hồ sơ online</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          2
                        </div>
                        <span className="text-green-800">
                          Phỏng vấn qua điện thoại (30 phút)
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          3
                        </div>
                        <span className="text-green-800">
                          Phỏng vấn kỹ thuật (1 giờ)
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          4
                        </div>
                        <span className="text-green-800">
                          Phỏng vấn với team lead (45 phút)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="flex-shrink-0 bg-white border-t border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{job.application_count}</span> người
              đã ứng tuyển
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleApply}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 cursor-pointer"
              >
                <ExternalLink className="h-4 w-4" />
                Ứng tuyển ngay
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
