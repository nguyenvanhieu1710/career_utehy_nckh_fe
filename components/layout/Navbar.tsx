// components/layout/Navbar.tsx
import Link from "next/link";
import Button from "@/components/ui/Button";
import { Star, Waves } from "lucide-react";

export function Navbar() {
  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1">
            <span className="text-3xl font-bold text-gray-700 font-[Squada One]">CAREER</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="hover:text-green-600 transition text-gray-600">
              Việc làm
            </Link>
            <Link href="/cv" className="hover:text-green-600 transition text-gray-600">
              Tạo CV
            </Link>
            <Link href="/about" className="hover:text-green-600 transition text-gray-600">
              Về chúng tôi
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Link href='/auth/signin'><Button type="button" value="Đăng nhập" border="10px" /></Link>
            <Link href='/auth/signup'><Button type="button" value="Đăng ký" border="10px" /></Link>
            <div className="text-[#0C6A4E] font-bold flex gap-1"><Star/> Dành cho Nhà tuyển dụng</div>
          </div>
        </div>
      </div>
    </nav>
  );
}
