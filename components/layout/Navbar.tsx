"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Button from "@/components/ui/Button";
import { Menu, X } from "lucide-react";
import { MobileNavLink } from "./MobileNavLink";
import { ProfileDropdown } from "./ProfileDropdown";
import { useAuth } from "@/hooks/useAuth";
import { userAPI } from "@/services/user";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user, isLoading } = useAuth();
  const pathname = usePathname();

  // Helper function to check if link is active
  const isActiveLink = (href: string) => {
    if (href === "/career/jobs") {
      return pathname.startsWith("/career/jobs");
    }
    return pathname.startsWith(href);
  };

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  return (
    <nav
      className={`sticky top-0 z-50 bg-white transition-shadow ${
        scrolled ? "shadow-md" : "border-b"
      }`}
    >
      <div className="w-full px-7">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-1">
              <img
                src={"/logo/header_logo.jpg"}
                className="object-cover h-13"
              />
            </Link>

            <div className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link
                href="/career/jobs"
                className={`hover:text-green-600 transition font-bold ${
                  isActiveLink("/career/jobs")
                    ? "text-green-600 border-b-2 border-green-600 pb-1"
                    : "text-[#000000]"
                }`}
              >
                Việc làm
              </Link>
              <Link
                href="/cv"
                className={`hover:text-green-600 transition font-bold ${
                  isActiveLink("/cv")
                    ? "text-green-600 border-b-2 border-green-600 pb-1"
                    : "text-[#000000]"
                }`}
              >
                Tạo CV
              </Link>
              <Link
                href="/career/about-us"
                className={`hover:text-green-600 transition font-bold ${
                  isActiveLink("/career/about-us")
                    ? "text-green-600 border-b-2 border-green-600 pb-1"
                    : "text-[#000000]"
                }`}
              >
                Về chúng tôi
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {isLoading ? (
              <div className="w-8 h-8 animate-pulse bg-gray-200 rounded-full"></div>
            ) : isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex gap-2 items-center cursor-pointer p-2 transition"
                >
                  <div className="flex flex-col gap-0 text-left">
                    <div className="font-bold text-sm text-gray-700">
                      {user.fullname}
                    </div>
                    <div className="text-xs text-gray-500">@{user.username}</div>
                  </div>                
                  <img
                  src={userAPI.getAvatarUrl(user)}
                  alt={`${user.fullname} avatar`}
                  className="w-10 h-10 rounded-full object-cover border"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/default-avatar.jpg";
                  }}
                />  
                </button>

                {isProfileOpen && (
                  <ProfileDropdown onClose={() => setIsProfileOpen(false)} />
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link href="/auth/signin">
                  <Button type="button" value="Đăng nhập" border="10px" />
                </Link>
                <Link href="/auth/signup">
                  <Button type="button" value="Đăng ký" border="10px" />
                </Link>
              </div>
            )}

            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 focus:outline-none"
                aria-label="Toggle menu"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isOpen
              ? "max-h-96 opacity-100"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="pt-2 pb-4 px-4 space-y-2 bg-white border-t">
            <MobileNavLink href="/career/jobs" onClick={() => setIsOpen(false)}>
              Việc làm
            </MobileNavLink>
            <MobileNavLink href="/cv" onClick={() => setIsOpen(false)}>
              Tạo CV
            </MobileNavLink>
            <MobileNavLink
              href="/career/about-us"
              onClick={() => setIsOpen(false)}
            >
              Về chúng tôi
            </MobileNavLink>
            {!isAuthenticated && (
              <>
                <div className="border-t my-2"></div>
                <MobileNavLink
                  href="/auth/signin"
                  onClick={() => setIsOpen(false)}
                >
                  Đăng nhập
                </MobileNavLink>
                <MobileNavLink
                  href="/auth/signup"
                  onClick={() => setIsOpen(false)}
                >
                  Đăng ký
                </MobileNavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
