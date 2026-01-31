"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CrawlHistory } from "@/types/crawl-history";
import { Database, Calendar } from "lucide-react";
import { formatDuration, formatDate } from "@/utils/formatters";
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
      <DialogContent className="sm:max-w-4xl bg-white border-2 border-green-200 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-green-900 flex items-center gap-2">
            <Database className="w-5 h-5" />
            Chi tiết phiên crawl
            <span className="text-sm font-normal text-gray-500">
              ID: {crawlHistory.id}
            </span>
          </DialogTitle>
          <div className="flex items-center gap-3 mt-2">
            {getCrawlStatusBadge(crawlHistory.status)}
          </div>
        </DialogHeader>

        <div className="space-y-6">
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
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Thời gian thực hiện
                </label>
                <p className="text-gray-900">
                  {formatDuration(crawlHistory.duration_seconds)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Trạng thái
                </label>
                <div className="mt-1">
                  {getCrawlStatusBadge(crawlHistory.status)}
                </div>
              </div>
            </div>
          </div>

          {/* Error Information */}
          {(crawlHistory.error_count > 0 || crawlHistory.error_message) && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-red-900 mb-4">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
