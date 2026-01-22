"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import Loader from "@/components/ui/Loader";
import { crawlHistoryAPI } from "@/services/crawlHistory";
import { CrawlHistory, CrawlHistoryFilters } from "@/types/crawl-history";
import { Eye, StopCircle } from "lucide-react";
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jobs
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Success Rate
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {crawls.map((crawl) => (
              <tr key={crawl.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap">
                  {getCrawlStatusBadge(crawl.status)}
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
                  {formatDate(crawl.started_at)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDuration(crawl.duration_seconds)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <div>Found: {crawl.total_jobs_found}</div>
                    <div className="text-xs text-gray-500">
                      Created: {crawl.jobs_created} | Updated:{" "}
                      {crawl.jobs_updated}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {crawl.success_rate.toFixed(1)}%
                  </div>
                  {crawl.error_count > 0 && (
                    <div className="text-xs text-red-500">
                      {crawl.error_count} errors
                    </div>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewDetails?.(crawl)}
                      className="text-blue-600 hover:text-blue-900"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {crawl.status === "running" &&
                      hasPermission("crawl_history.cancel") && (
                        <button
                          onClick={() => handleCancelCrawl(crawl.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Cancel Crawl"
                        >
                          <StopCircle className="h-4 w-4" />
                        </button>
                      )}
                  </div>
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
