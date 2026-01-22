/**
 * Shared formatting utilities for the application
 */

/**
 * Format duration from seconds to human readable format
 */
export const formatDuration = (seconds?: number): string => {
  if (!seconds) return "N/A";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  }
  return `${minutes}m ${remainingSeconds}s`;
};

/**
 * Format date string to localized format
 */
export const formatDate = (
  dateString?: string,
  locale: string = "vi-VN",
): string => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString(locale);
};

/**
 * Format response time in milliseconds
 */
export const formatResponseTime = (ms?: number): string => {
  if (!ms) return "N/A";
  return `${ms.toFixed(0)}ms`;
};

/**
 * Format number with locale-specific formatting
 */
export const formatNumber = (num: number, locale: string = "vi-VN"): string => {
  return num.toLocaleString(locale);
};

/**
 * Format percentage with specified decimal places
 */
export const formatPercentage = (
  value: number,
  decimals: number = 1,
): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format file size in bytes to human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Format time period text for Vietnamese locale
 */
export const formatTimePeriod = (timePeriod: string): string => {
  const periodMap: Record<string, string> = {
    "7_days": "7 ngày",
    "30_days": "30 ngày",
    "3_months": "3 tháng",
    "6_months": "6 tháng",
    "1_year": "1 năm",
    custom: "Tùy chỉnh",
  };

  return periodMap[timePeriod] || "Không xác định";
};
