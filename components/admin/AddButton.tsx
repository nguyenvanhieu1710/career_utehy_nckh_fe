"use client";

import { Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import { usePermissions } from "@/contexts/PermissionContext";

interface AddButtonProps {
  onClick: () => void;
  permission: string;
  text?: string;
}

export function AddButton({
  onClick,
  permission,
  text = "Thêm",
}: AddButtonProps) {
  const { hasPermission } = usePermissions();

  // Check if user has permission
  if (!hasPermission(permission)) {
    return null; // Hide button if no permission
  }

  return (
    <Button
      type="button"
      onClick={onClick}
      iconLeft={<Plus size={18} className="mr-2" />}
      value={text}
    />
  );
}
