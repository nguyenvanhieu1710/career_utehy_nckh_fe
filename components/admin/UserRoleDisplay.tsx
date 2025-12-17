"use client";

import { useState, useEffect } from "react";
// import { Badge } from "@/components/ui/badge";
import { userAPI } from "@/services/user";
import { Role } from "@/types/user";

interface UserRoleDisplayProps {
  userId: string;
  maxDisplay?: number;
  showTooltip?: boolean;
}

export function UserRoleDisplay({
  userId,
  maxDisplay = 2,
  showTooltip = true,
}: UserRoleDisplayProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadUserRoles = async () => {
      // Skip during SSR/SSG
      if (typeof window === "undefined") {
        return;
      }

      try {
        setLoading(true);

        const response = await userAPI.getUserRolesPermissions(userId);

        const userRoles = response.data.data.roles || [];

        setRoles(userRoles);
        setError(false);
      } catch (err) {
        console.error(`❌ Failed to load user ${userId} roles:`, err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadUserRoles();
    }
  }, [userId]);

  if (loading) {
    return <span className="text-gray-400 text-sm">Đang tải...</span>;
  }

  if (error) {
    return <span className="text-red-400 text-sm">Lỗi tải dữ liệu</span>;
  }

  if (!roles || roles.length === 0) {
    return <span className="text-gray-500 text-sm">Chưa có vai trò</span>;
  }

  const displayRoles = roles.slice(0, maxDisplay);
  const remainingCount = roles.length - maxDisplay;

  return (
    <div className="flex flex-wrap gap-1">
      {displayRoles.map((role) => (
        <span
          key={role.id}
          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
          title={showTooltip ? role.description || role.name : undefined}
        >
          {role.name}
        </span>
      ))}
      {remainingCount > 0 && (
        <span
          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600"
          title={
            showTooltip
              ? `Còn ${remainingCount} vai trò khác: ${roles
                  .slice(maxDisplay)
                  .map((r) => r.name)
                  .join(", ")}`
              : undefined
          }
        >
          +{remainingCount}
        </span>
      )}
    </div>
  );
}
