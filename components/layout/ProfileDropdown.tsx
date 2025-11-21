// components/navbar/ProfileDropdown.tsx
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { LogOut, User, Heart, Briefcase, FileText } from "lucide-react";
import { logout } from "@/services/auth";

interface ProfileDropdownProps {
  onClose?: () => void;
}

export function ProfileDropdown({
  onClose,
}: ProfileDropdownProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose?.();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    window.location.href = "/auth/signin";
  };

  const menuItems = [
    { label: "Cập nhật tài khoản", href: "/career/profile", icon: User },
    { label: "Công việc yêu thích", href: "/career/favorite-jobs", icon: Heart },
    { label: "Công việc đã ứng tuyển", href: "/career/applied-jobs", icon: Briefcase },
    { label: "Quản lý CV", href: "/cv", icon: FileText },
  ];

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="py-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition"
            >
              <Icon size={18} className="text-gray-500" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="border-t">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center gap-3 w-full px-4 py-2.5 text-red-600 hover:bg-red-50 transition text-sm font-medium cursor-pointer"
        >
          <LogOut size={18} />
          {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
        </button>
      </div>
    </div>
  );
}
