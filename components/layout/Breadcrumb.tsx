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
  "cv-templates": "Quản lý mẫu CV",
  "chatbot-management": "Quản lý chatbot (RAG)",
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

  // Build cumulative breadcrumb segments after /admin so detail pages keep their parent.
  const adminSegments = segments.slice(1);
  const crumbs = adminSegments.map((seg, idx) => {
    const href = "/admin/" + adminSegments.slice(0, idx + 1).join("/");
    const known = routeNameMap[seg];
    const isLast = idx === adminSegments.length - 1;
    const isDetail = !known && idx > 0;
    const label =
      known ||
      (isDetail
        ? "Chi tiết"
        : seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " "));
    return { href, label, isLast };
  });

  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-600 mb-6">
      <Link
        href="/admin"
        className="flex items-center gap-1 hover:text-emerald-600 transition-colors"
      >
        <Home size={16} />
      </Link>

      {crumbs.map((c) => (
        <span key={c.href} className="flex items-center gap-1">
          <ChevronRight size={16} className="text-gray-400" />
          {c.isLast ? (
            <span className="font-medium text-gray-900">{c.label}</span>
          ) : (
            <Link
              href={c.href}
              className="hover:text-emerald-600 transition-colors"
            >
              {c.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
