"use client";

import { Role } from "@/types/user";

interface SimpleRoleDisplayProps {
  roles?: Role[];
  loading?: boolean;
  error?: boolean;
}

export function SimpleRoleDisplay({
  roles,
  loading,
  error,
}: SimpleRoleDisplayProps) {
  if (loading) {
    return <span className="text-gray-400 text-sm">Đang tải...</span>;
  }

  if (error) {
    return <span className="text-red-400 text-sm">Lỗi</span>;
  }

  if (!roles || roles.length === 0) {
    return <span className="text-gray-500 text-sm">Chưa có vai trò</span>;
  }

  if (roles.length === 1) {
    return <span className="text-sm">{roles[0].name}</span>;
  }

  if (roles.length <= 2) {
    return (
      <span className="text-sm">{roles.map((r) => r.name).join(", ")}</span>
    );
  }

  return (
    <span className="text-sm" title={roles.map((r) => r.name).join(", ")}>
      {roles[0].name}, +{roles.length - 1} khác
    </span>
  );
}
