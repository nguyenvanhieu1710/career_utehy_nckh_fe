"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const routeNameMap: Record<string, string> = {
  admin: "Dashboard",
  "user-management": "Quản lý tài khoản",
  "data-management": "Quản lý nguồn dữ liệu",
  "crawl-management": "Quản lý crawl tin",
  "job-management": "Quản lý tin tuyển dụng",
  "category-management": "Quản lý danh mục ngành",
  "permission-management": "Quản lý quyền / vai trò",
};

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter((seg) => seg);

  // Nếu chỉ ở /admin thì hiển thị 🏠 > Dashboard
  if (segments.length <= 1) {
    return (
      <nav className="flex items-center space-x-1 text-sm text-gray-600 mb-6">
        <div className="flex items-center gap-1">
          <Home size={16} />
          <ChevronRight size={16} className="text-gray-400" />
          <span className="font-medium text-gray-900">Dashboard</span>
        </div>
      </nav>
    );
  }

  const currentPage = segments[segments.length - 1];
  const currentPageLabel =
    routeNameMap[currentPage] ||
    currentPage.charAt(0).toUpperCase() +
      currentPage.slice(1).replace(/-/g, " ");

  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-600 mb-6">
      <Link
        href="/admin"
        className="flex items-center gap-1 hover:text-emerald-600 transition-colors"
      >
        <Home size={16} />
      </Link>

      <ChevronRight size={16} className="text-gray-400" />
      <span className="font-medium text-gray-900">{currentPageLabel}</span>
    </nav>
  );
}
