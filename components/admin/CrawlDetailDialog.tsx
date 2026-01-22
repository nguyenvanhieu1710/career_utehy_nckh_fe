"use client";

import { Dialog } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CrawlHistory } from "@/types/crawl-history";
import {
  Database,
  Activity,
  TrendingUp,
  Calendar,
  Timer,
  Target,
  AlertCircle,
} from "lucide-react";
import {
  formatDuration,
  formatDate,
  formatResponseTime,
} from "@/utils/formatters";
import { getCrawlStatusBadge } from "@/utils/crawl-helpers";

interface CrawlDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  crawlHistory: CrawlHistory | null;
}

export function CrawlDetailDialog({
  open,
  onOpenChange,
  crawlHistory,
}: CrawlDetailDialogProps) {
  if (!crawlHistory) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={() => onOpenChange(false)}
        />
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Database className="h-6 w-6 text-blue-500" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Chi tiết phiên crawl
                </h2>
                <p className="text-sm text-gray-500">ID: {crawlHistory.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getCrawlStatusBadge(crawlHistory.status)}
              <button
                onClick={() => onOpenChange(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ×
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Jobs Found
                  </span>
                </div>
                <p className="text-2xl font-bold text-blue-900">
                  {crawlHistory.total_jobs_found}
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Success Rate
                  </span>
                </div>
                <p className="text-2xl font-bold text-green-900">
                  {crawlHistory.success_rate.toFixed(1)}%
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Timer className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">
                    Duration
                  </span>
                </div>
                <p className="text-2xl font-bold text-purple-900">
                  {formatDuration(crawlHistory.duration_seconds)}
                </p>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">
                    Pages
                  </span>
                </div>
                <p className="text-2xl font-bold text-orange-900">
                  {crawlHistory.pages_crawled || 0}
                </p>
              </div>
            </div>

            {/* Basic Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Database className="h-5 w-5" />
                Thông tin cơ bản
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Nguồn dữ liệu
                  </label>
                  <p className="text-gray-900 font-medium">
                    {crawlHistory.source_name || "Unknown"}
                  </p>
                  {crawlHistory.source_base_url && (
                    <p className="text-sm text-gray-500 truncate">
                      {crawlHistory.source_base_url}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Phiên bản crawler
                  </label>
                  <p className="text-gray-900">
                    {crawlHistory.crawler_version || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Thời gian bắt đầu
                  </label>
                  <p className="text-gray-900 flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {formatDate(crawlHistory.started_at)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Thời gian kết thúc
                  </label>
                  <p className="text-gray-900 flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {formatDate(crawlHistory.completed_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* Job Statistics */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Thống kê jobs
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {crawlHistory.total_jobs_found}
                  </p>
                  <p className="text-sm text-gray-600">Tìm thấy</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {crawlHistory.jobs_created}
                  </p>
                  <p className="text-sm text-gray-600">Tạo mới</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {crawlHistory.jobs_updated}
                  </p>
                  <p className="text-sm text-gray-600">Cập nhật</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-600">
                    {crawlHistory.jobs_skipped}
                  </p>
                  <p className="text-sm text-gray-600">Bỏ qua</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {crawlHistory.jobs_failed}
                  </p>
                  <p className="text-sm text-gray-600">Thất bại</p>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Hiệu suất
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Thời gian phản hồi trung bình
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatResponseTime(crawlHistory.avg_response_time_ms)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Số trang crawl
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {crawlHistory.pages_crawled || 0}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Số lỗi
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {crawlHistory.error_count}
                  </p>
                </div>
              </div>
            </div>

            {/* Error Information */}
            {(crawlHistory.error_count > 0 || crawlHistory.error_message) && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Thông tin lỗi
                </h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-red-800">
                      Số lỗi
                    </label>
                    <p className="text-red-900 font-semibold">
                      {crawlHistory.error_count}
                    </p>
                  </div>
                  {crawlHistory.error_message && (
                    <div>
                      <label className="text-sm font-medium text-red-800">
                        Chi tiết lỗi
                      </label>
                      <p className="text-red-900 bg-red-100 p-2 rounded text-sm font-mono">
                        {crawlHistory.error_message}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Technical Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Chi tiết kỹ thuật
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    User Agent
                  </label>
                  <p className="text-sm text-gray-900 font-mono bg-gray-100 p-2 rounded">
                    {crawlHistory.user_agent || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Thời gian tạo
                  </label>
                  <p className="text-gray-900">
                    {formatDate(crawlHistory.created_at)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Cập nhật lần cuối
                  </label>
                  <p className="text-gray-900">
                    {formatDate(crawlHistory.updated_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end">
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
