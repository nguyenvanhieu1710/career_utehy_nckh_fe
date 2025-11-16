'use client';

import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const routeNameMap: Record<string, string> = {
  dashboard: 'Dashboard',
  'user-management': 'Quản lý tài khoản',
  'data-management': 'Quản lý nguồn dữ liệu',
  'crawl-management': 'Quản lý crawl tin',
  'job-management': 'Quản lý tin tuyển dụng',
  'category-management': 'Quản lý danh mục',
};

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter((seg) => seg);
  const currentPage = segments[segments.length - 1] || 'admin';

  const currentPageLabel = routeNameMap[currentPage] || 
    currentPage.charAt(0).toUpperCase() + currentPage.slice(1).replace(/-/g, ' ');


  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-600 mb-6">
      <Link
        href="/admin"
        className="flex items-center gap-1 hover:text-emerald-600 transition-colors"
      >
        <Home size={16} />
        <span>Trang chủ</span>
      </Link>

      {segments.length > 0 && (
        <>
          <ChevronRight size={16} className="text-gray-400" />
          <span className="font-medium text-gray-900">{currentPageLabel}</span>
        </>
      )}
    </nav>
  );
}