'use client';

import { Home, Users, Database, Briefcase, FileText, Menu, Settings, LogOut, ChevronLeft, ChevronRight, Key } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/user-management', label: 'Quản lý tài khoản', icon: Users },
  { href: '/admin/data-management', label: 'Quản lý nguồn dữ liệu', icon: Database },
  { href: '/admin/crawl-management', label: 'Quản lý crawl tin', icon: Briefcase },
  { href: '/admin/job-management', label: 'Quản lý tin tuyển dụng', icon: FileText },
  { href: '/admin/permission-management', label: 'Quyền / Vai trò', icon: Key },
  { href: '/admin/category-management', label: 'Quản lý danh mục', icon: Menu },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <motion.aside
      initial={{ width: 256 }}
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative flex flex-col bg-gradient-to-b from-emerald-800 to-emerald-900 text-white overflow-hidden"
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-emerald-700 bg-emerald-800">
        <motion.div 
          className={cn('flex items-center gap-3 overflow-hidden', collapsed ? 'justify-center ml-0' : 'ml-2')}
          animate={{
            opacity: collapsed ? 0 : 1,
            x: collapsed ? -10 : 0,
            width: collapsed ? 0 : 'auto'
          }}
          transition={{ duration: 0.2, delay: collapsed ? 0 : 0.1 }}
        >
          <motion.span 
            className="text-xl font-bold text-white whitespace-nowrap"
            initial={{ opacity: 1 }}
          >
            CAREER
          </motion.span>
        </motion.div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-full p-1.5 bg-emerald-700 hover:bg-emerald-600 transition-colors text-emerald-100 hover:text-white"
          aria-label={collapsed ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'}
        >
          {collapsed ? (
            <ChevronRight size={18} className="text-emerald-100" />
          ) : (
            <ChevronLeft size={18} className="text-emerald-100" />
          )}
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === '/admin' 
            ? pathname === '/admin'
            : pathname === item.href || 
              (pathname.startsWith(`${item.href}/`) && 
               !pathname.replace(item.href, '').startsWith('/'));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all overflow-hidden',
                isActive
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-emerald-100 hover:bg-emerald-700 hover:text-white',
                collapsed && 'justify-center'
              )}
            >
              <motion.div
                animate={{
                  scale: collapsed ? 1.1 : 1,
                  transition: { duration: 0.2 }
                }}
              >
                <Icon size={20} />
              </motion.div>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      transition: { duration: 0.2, delay: 0.1 }
                    }}
                    exit={{ opacity: 0, x: -10 }}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>
    </motion.aside>
  );
}