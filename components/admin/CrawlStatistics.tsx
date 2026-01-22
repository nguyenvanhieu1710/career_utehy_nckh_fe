"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Loader from "@/components/ui/Loader";
import { crawlHistoryAPI } from "@/services/crawlHistory";
import { CrawlStatistics as CrawlStatsType } from "@/types/crawl-history";
import {
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
} from "lucide-react";
import { formatDuration, formatDate, formatNumber } from "@/utils/formatters";

interface CrawlStatisticsProps {
  sourceId?: string;
  days?: number;
  className?: string;
}

export function CrawlStatistics({
  sourceId,
  days = 30,
  className,
}: CrawlStatisticsProps) {
  const [stats, setStats] = useState<CrawlStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await crawlHistoryAPI.getCrawlStatistics(sourceId, days);
      setStats(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, [sourceId, days]);

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
          onClick={fetchStatistics}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}
    >
      {/* Total Crawls */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Crawls</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.total_crawls}
            </p>
            <p className="text-xs text-gray-500">
              Last {stats.period_days} days
            </p>
          </div>
          <Activity className="h-8 w-8 text-blue-500" />
        </div>
      </Card>

      {/* Success Rate */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Success Rate</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.success_rate.toFixed(1)}%
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>{stats.successful_crawls} successful</span>
            </div>
          </div>
          <TrendingUp className="h-8 w-8 text-green-500" />
        </div>
      </Card>

      {/* Running Crawls */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">
              Currently Running
            </p>
            <p className="text-2xl font-bold text-orange-600">
              {stats.running_crawls}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <XCircle className="h-3 w-3 text-red-500" />
              <span>{stats.failed_crawls} failed</span>
            </div>
          </div>
          <Clock className="h-8 w-8 text-orange-500" />
        </div>
      </Card>

      {/* Jobs Statistics */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Jobs Processed</p>
            <p className="text-2xl font-bold text-purple-600">
              {formatNumber(stats.total_jobs_found)}
            </p>
            <div className="text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Created: {stats.total_jobs_created}</span>
                <span>Updated: {stats.total_jobs_updated}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <Badge variant="secondary" className="text-xs">
              Avg: {formatDuration(stats.avg_duration_seconds)}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Last Crawl Info */}
      <Card className="p-4 md:col-span-2 lg:col-span-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Last Crawl</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatDate(stats.last_crawl) || "Never"}
            </p>
          </div>
          <div className="text-right">
            <div className="flex gap-2">
              <Badge
                variant={stats.running_crawls > 0 ? "default" : "secondary"}
                className="text-xs"
              >
                {stats.running_crawls > 0 ? "Active" : "Idle"}
              </Badge>
              <Badge
                variant={stats.success_rate >= 80 ? "default" : "destructive"}
                className="text-xs"
              >
                {stats.success_rate >= 80 ? "Healthy" : "Issues"}
              </Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
