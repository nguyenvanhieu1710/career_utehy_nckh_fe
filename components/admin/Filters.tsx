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

interface FiltersProps {
  role?: string;
  status?: string;
  searchKeyword?: string;
  onRoleChange?: (value: string) => void;
  onStatusChange?: (value: string) => void;
  onSearchChange?: (value: string) => void;
  hideRoleFilter?: boolean;
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
  searchPlaceholder = "Nhập từ khóa để tìm kiếm...",
  availableRoles = [],
  rolesLoading = false,
}: FiltersProps) {
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

      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Lọc theo trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả trạng thái</SelectItem>
          <SelectItem value="active">Hoạt động</SelectItem>
          <SelectItem value="inactive">Tạm dừng</SelectItem>
          <SelectItem value="error">Lỗi</SelectItem>
          <SelectItem value="crawling">Đang thu thập</SelectItem>
        </SelectContent>
      </Select>

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
