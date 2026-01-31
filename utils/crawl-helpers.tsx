/**
 * Shared utilities for crawl-related components
 */

import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Database,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type CrawlStatus = "running" | "completed" | "failed" | "cancelled";
export type DataSourceStatus = "active" | "inactive" | "error" | "crawling";

/**
 * Get status icon component for crawl status
 */
export const getCrawlStatusIcon = (
  status: CrawlStatus,
  className: string = "h-4 w-4",
) => {
  const iconProps = { className };

  switch (status) {
    case "running":
      return (
        <Clock {...iconProps} className={`${className} text-orange-500`} />
      );
    case "completed":
      return (
        <CheckCircle {...iconProps} className={`${className} text-green-500`} />
      );
    case "failed":
      return <XCircle {...iconProps} className={`${className} text-red-500`} />;
    case "cancelled":
      return (
        <AlertTriangle
          {...iconProps}
          className={`${className} text-gray-500`}
        />
      );
    default:
      return <Clock {...iconProps} className={`${className} text-gray-500`} />;
  }
};

/**
 * Get status icon component for data source status
 */
export const getDataSourceStatusIcon = (
  status: DataSourceStatus,
  className: string = "w-4 h-4",
) => {
  const iconProps = { className };

  switch (status) {
    case "active":
      return (
        <CheckCircle {...iconProps} className={`${className} text-green-600`} />
      );
    case "inactive":
      return (
        <XCircle {...iconProps} className={`${className} text-gray-600`} />
      );
    case "error":
      return (
        <AlertTriangle {...iconProps} className={`${className} text-red-600`} />
      );
    case "crawling":
      return (
        <RefreshCw
          {...iconProps}
          className={`${className} text-blue-600 animate-spin`}
        />
      );
    default:
      return (
        <Database {...iconProps} className={`${className} text-gray-600`} />
      );
  }
};

/**
 * Get status badge component for crawl status
 */
export const getCrawlStatusBadge = (status: CrawlStatus) => {
  const variants: Record<CrawlStatus, "default" | "secondary" | "destructive"> =
    {
      running: "default",
      completed: "secondary",
      failed: "destructive",
      cancelled: "secondary",
    };

  return (
    <Badge variant={variants[status]} className="flex items-center gap-1">
      {getCrawlStatusIcon(status, "h-4 w-4")}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

/**
 * Get status color classes for data source status
 */
export const getDataSourceStatusColor = (status: DataSourceStatus): string => {
  switch (status) {
    case "active":
      return "text-green-600 bg-green-50";
    case "inactive":
      return "text-gray-600 bg-gray-50";
    case "error":
      return "text-red-600 bg-red-50";
    case "crawling":
      return "text-blue-600 bg-blue-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
};

/**
 * Get status text for data source status in Vietnamese
 */
export const getDataSourceStatusText = (status: DataSourceStatus): string => {
  switch (status) {
    case "active":
      return "Hoạt động";
    case "inactive":
      return "Tạm dừng";
    case "error":
      return "Lỗi";
    case "crawling":
      return "Đang thu thập";
    default:
      return "Không xác định";
  }
};

/**
 * Calculate success rate from crawl statistics
 */
export const calculateSuccessRate = (
  jobsCreated: number,
  jobsUpdated: number,
  jobsFailed: number,
): number => {
  const totalProcessed = jobsCreated + jobsUpdated + jobsFailed;
  if (totalProcessed === 0) return 0;
  return ((jobsCreated + jobsUpdated) / totalProcessed) * 100;
};

/**
 * Get health status based on success rate
 */
export const getHealthStatus = (
  successRate: number,
): {
  status: "healthy" | "warning" | "critical";
  text: string;
  color: string;
} => {
  if (successRate >= 80) {
    return {
      status: "healthy",
      text: "Healthy",
      color: "text-green-600",
    };
  } else if (successRate >= 60) {
    return {
      status: "warning",
      text: "Warning",
      color: "text-yellow-600",
    };
  } else {
    return {
      status: "critical",
      text: "Issues",
      color: "text-red-600",
    };
  }
};
