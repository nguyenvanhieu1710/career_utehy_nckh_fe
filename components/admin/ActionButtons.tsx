"use client";

import { Ban, Edit, Trash2, View } from "lucide-react";

interface ActionTypeProps {
  type: "edit" | "view" | "delete" | "ban";
  onClick?: () => void;
}

export function ActionButtons({ type, onClick }: ActionTypeProps) {
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

  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded-md text-white cursor-pointer transition-colors ${getVariant()}`}
    >
      {type === "edit" ? (
        <Edit size={16} />
      ) : type === "delete" ? (
        <Trash2 size={16} />
      ) : type === "ban" ? (
        <Ban size={16} />
      ) : (
        <View size={16} />
      )}
    </button>
  );
}
