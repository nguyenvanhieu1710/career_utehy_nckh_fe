import React from "react";
import { statusAPI } from "@/services/status";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export function StatusBadge({
  status,
  size = "md",
  showIcon = false,
}: StatusBadgeProps) {
  const statusInfo = statusAPI.formatStatus(status);

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const colorClasses = {
    green: "bg-green-100 text-green-800 border-green-200",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
    red: "bg-red-100 text-red-800 border-red-200",
  };

  const iconClasses = {
    green: "text-green-500",
    yellow: "text-yellow-500",
    red: "text-red-500",
  };

  const getIcon = (color: string) => {
    switch (color) {
      case "green":
        return "●"; // Active dot
      case "yellow":
        return "⏸"; // Pause symbol
      case "red":
        return "✕"; // X symbol
      default:
        return "●";
    }
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full border font-medium
        ${sizeClasses[size]}
        ${colorClasses[statusInfo.color as keyof typeof colorClasses]}
      `}
    >
      {showIcon && (
        <span
          className={iconClasses[statusInfo.color as keyof typeof iconClasses]}
        >
          {getIcon(statusInfo.color)}
        </span>
      )}
      {statusInfo.label}
    </span>
  );
}
