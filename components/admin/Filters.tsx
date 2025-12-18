"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Input } from "@/components/ui/input";
import { Role } from "@/types/user";
import { StatusOption } from "@/types/status";
import { useStatus } from "@/contexts/StatusContext";

interface FiltersProps {
  role?: string;
  status?: string;
  searchKeyword?: string;
  onRoleChange?: (value: string) => void;
  onStatusChange?: (value: string) => void;
  onSearchChange?: (value: string) => void;
  hideRoleFilter?: boolean;
  hideStatusFilter?: boolean;
  searchPlaceholder?: string;
  availableRoles?: Role[];
  rolesLoading?: boolean;
}

export function Filters({
  role = "all",
  status = "all",
  searchKeyword = "",
  onRoleChange,
  onStatusChange,
  onSearchChange,
  hideRoleFilter = false,
  hideStatusFilter = false,
  searchPlaceholder = "Nhập từ khóa để tìm kiếm...",
  availableRoles = [],
  rolesLoading = false,
}: FiltersProps) {
  // Get status options from context
  const { statusOptions, loading: statusLoading } = useStatus();
  return (
    <div className="flex flex-wrap gap-3 mb-4">
      {!hideRoleFilter && (
        <Select
          value={role}
          onValueChange={onRoleChange}
          disabled={rolesLoading}
        >
          <SelectTrigger className="w-48">
            <SelectValue
              placeholder={rolesLoading ? "Đang tải..." : "Lọc theo vai trò"}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả vai trò</SelectItem>
            {availableRoles.map((roleItem) => (
              <SelectItem key={roleItem.id} value={roleItem.id}>
                {roleItem.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {!hideStatusFilter && (
        <Select
          value={status}
          onValueChange={onStatusChange}
          disabled={statusLoading}
        >
          <SelectTrigger className="w-48">
            <SelectValue
              placeholder={
                statusLoading ? "Đang tải..." : "Lọc theo trạng thái"
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            {statusOptions.map((statusOption) => (
              <SelectItem key={statusOption.value} value={statusOption.value}>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      statusOption.color === "green"
                        ? "bg-green-500"
                        : statusOption.color === "yellow"
                        ? "bg-yellow-500"
                        : statusOption.color === "red"
                        ? "bg-red-500"
                        : "bg-gray-500"
                    }`}
                  />
                  {statusOption.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div className="flex-1 min-w-64">
        <Input
          placeholder={searchPlaceholder}
          className="w-full"
          value={searchKeyword}
          onChange={(e) => onSearchChange?.(e.target.value)}
        />
      </div>
    </div>
  );
}
