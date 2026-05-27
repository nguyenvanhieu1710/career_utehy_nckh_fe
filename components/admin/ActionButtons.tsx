"use client";

import {
  Ban,
  Download,
  Edit,
  History,
  Loader2,
  StopCircle,
  Trash2,
  View,
} from "lucide-react";
import { usePermissions } from "@/contexts/PermissionContext";

interface ActionTypeProps {
  type: "edit" | "view" | "delete" | "ban" | "cancel" | "history" | "scrape";
  onClick?: () => void;
  permission: string;
  loading?: boolean;
  title?: string;
}

export function ActionButtons({
  type,
  onClick,
  permission,
  loading = false,
  title,
}: ActionTypeProps) {
  const { hasPermission } = usePermissions();

  // Check if user has permission
  if (!hasPermission(permission)) {
    return null; // Hide button if no permission
  }

  const getVariant = () => {
    switch (type) {
      case "edit":
        return "bg-green-600 hover:bg-green-700";
      case "view":
        return "bg-blue-600 hover:bg-blue-700";
      case "history":
        return "bg-gray-600 hover:bg-gray-700";
      case "scrape":
        return "bg-amber-500 hover:bg-amber-600";
      case "delete":
      case "ban":
      case "cancel":
        return "bg-red-600 hover:bg-red-700";
      default:
        return "bg-green-600 hover:bg-green-700";
    }
  };

  const getIcon = () => {
    if (loading) return <Loader2 size={16} className="animate-spin" />;
    switch (type) {
      case "edit":
        return <Edit size={16} />;
      case "delete":
        return <Trash2 size={16} />;
      case "ban":
        return <Ban size={16} />;
      case "cancel":
        return <StopCircle size={16} />;
      case "history":
        return <History size={16} />;
      case "scrape":
        return <Download size={16} />;
      case "view":
      default:
        return <View size={16} />;
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={loading}
      className={`p-2 rounded-md text-white cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${getVariant()}`}
    >
      {getIcon()}
    </button>
  );
}
