"use client";

import { useState, useEffect, useCallback } from "react";
import Loader from "@/components/ui/Loader";
import { crawlHistoryAPI } from "@/services/crawlHistory";
import { CrawlHistory, CrawlHistoryFilters } from "@/types/crawl-history";
// import { ActionButtons } from "./ActionButtons";
import { usePermissions } from "@/contexts/PermissionContext";
import { formatDuration, formatDate } from "@/utils/formatters";
import { getCrawlStatusBadge } from "@/utils/crawl-helpers";

interface CrawlHistoryTableProps {
  sourceId?: string;
  onViewDetails?: (crawl: CrawlHistory) => void;
  className?: string;
}

export function CrawlHistoryTable({
  sourceId,
  onViewDetails,
  className,
}: CrawlHistoryTableProps) {
  const { hasPermission } = usePermissions();
  const [crawls, setCrawls] = useState<CrawlHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    max_page: 0,
  });
  const [filters, setFilters] = useState<CrawlHistoryFilters>({
    page: 1,
    limit: 20,
    status: "all",
    sort_by: "started_at",
    sort_order: "desc",
  });

  const fetchCrawlHistories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filterParams = { ...filters, source_id: sourceId };
      const data = await crawlHistoryAPI.getCrawlHistories(filterParams);

      setCrawls(data.data);
      setPagination({
        page: data.page,
        limit: data.limit,
        total: data.total,
        max_page: data.max_page,
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(
        error.response?.data?.detail || "Failed to load crawl histories",
      );
    } finally {
      setLoading(false);
    }
  }, [filters, sourceId]);

  useEffect(() => {
    fetchCrawlHistories();
  }, [fetchCrawlHistories]);

  const handleStatusFilter = (status: string) => {
    setFilters((prev) => ({ ...prev, status, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleCancelCrawl = async (crawlId: string) => {
    if (!hasPermission("crawl_history.cancel")) {
      alert("You don't have permission to cancel crawls");
      return;
    }

    if (!confirm("Are you sure you want to cancel this crawl?")) return;

    try {
      await crawlHistoryAPI.cancelCrawl(crawlId);
      fetchCrawlHistories(); // Refresh data
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      alert(error.response?.data?.detail || "Failed to cancel crawl");
    }
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center p-8 ${className}`}>
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchCrawlHistories}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => handleStatusFilter("all")}
          className={`px-3 py-1 rounded text-sm ${
            filters.status === "all"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          All
        </button>
        {["running", "completed", "failed", "cancelled"].map((status) => (
          <button
            key={status}
            onClick={() => handleStatusFilter(status)}
            className={`px-3 py-1 rounded text-sm capitalize ${
              filters.status === status
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Started
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                New/Update
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Success
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Failed
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {crawls.map((crawl) => (
              <tr key={crawl.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4 whitespace-nowrap">
                  {getCrawlStatusBadge(crawl.status)}
                  {crawl.status === 'failed' && crawl.error_message && (
                    <div className="text-[10px] text-red-500 mt-1 max-w-[150px] truncate" title={crawl.error_message}>
                      {crawl.error_message}
                    </div>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {crawl.source_name || "Unknown"}
                    </div>
                    {crawl.crawler_version && (
                      <div className="text-xs text-gray-500">
                        v{crawl.crawler_version}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {crawl.started_at
                    ? new Date(crawl.started_at)
                        .toLocaleString("vi-VN", {
                          day: "numeric",
                          month: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: false,
                        })
                        .replace(",", "")
                    : "N/A"}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-900 font-semibold">
                  {crawl.total_jobs_found.toLocaleString()}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-green-600 font-medium">+{crawl.jobs_created}</span>
                    <span className="text-blue-600 text-xs">~{crawl.jobs_updated}</span>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    crawl.success_rate >= 90 ? 'bg-green-100 text-green-700' :
                    crawl.success_rate >= 50 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {crawl.success_rate.toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDuration(crawl.duration_seconds)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-red-600 font-medium">
                  {crawl.jobs_failed > 0 ? crawl.jobs_failed : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.max_page > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm">
              Page {pagination.page} of {pagination.max_page}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.max_page}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {crawls.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No crawl histories found
        </div>
      )}
    </div>
  );
}
