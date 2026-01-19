"use client";

import { Ban, Edit, Trash2, View } from "lucide-react";
import { usePermissions } from "@/contexts/PermissionContext";

interface ActionTypeProps {
  type: "edit" | "view" | "delete" | "ban";
  onClick?: () => void;
  permission: string;
}

export function ActionButtons({ type, onClick, permission }: ActionTypeProps) {
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
      case "delete":
      case "ban":
        return "bg-red-600 hover:bg-red-700";
      default:
        return "bg-green-600 hover:bg-green-700";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "edit":
        return <Edit size={16} />;
      case "delete":
        return <Trash2 size={16} />;
      case "ban":
        return <Ban size={16} />;
      case "view":
      default:
        return <View size={16} />;
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded-md text-white cursor-pointer transition-colors ${getVariant()}`}
    >
      {getIcon()}
    </button>
  );
}
