'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Input } from '@/components/ui/input';

export function Filters() {
  return (
    <div className="flex flex-wrap gap-3 mb-4">
      <Select defaultValue="all">
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Lọc theo vai trò" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả vai trò</SelectItem>
          <SelectItem value="sinh-vien">Sinh viên</SelectItem>
          <SelectItem value="nha-tuyen-dung">Nhà tuyển dụng</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>

      <Select defaultValue="all">
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Lọc theo trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả trạng thái</SelectItem>
          <SelectItem value="active">Còn hoạt động</SelectItem>
          <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex-1 min-w-64">
        <Input
          placeholder="Nhập tên người dùng để tìm kiếm..."
          className="w-full"
        />
      </div>
    </div>
  );
}