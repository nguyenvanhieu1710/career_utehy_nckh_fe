"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { Star, Menu, X } from "lucide-react";
import { MobileNavLink } from "./MobileNavLink";
import {
  authAPI,
  logout,
  setTokenCookie,
  setUserStorage,
} from "@/services/auth";
import { ProfileDropdown } from "./ProfileDropdown";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [checkToken, setCheckToken] = useState(false);

  useEffect(() => {
    authAPI
      .verify()
      .then((res) => {
        setTokenCookie(res.data.access_token);
        setUserStorage(
          res.data.email,
          res.data.user_name,
          res.data.user_id,
          res.data.fullname
        );
        setCheckToken(true);
      })
      .catch((err) => {
        setCheckToken(false);
      });
  }, []);

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
      <div className="w-full px-6">
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
                href="/"
                className="hover:text-green-600 transition font-bold text-[#000000]"
              >
                Việc làm
              </Link>
              <Link
                href="/cv"
                className="hover:text-green-600 transition font-bold text-[#000000]"
              >
                Tạo CV
              </Link>
              <Link
                href="/about"
                className="hover:text-green-600 transition font-bold text-[#000000]"
              >
                Về chúng tôi
              </Link>
            </div>
          </div>

          {checkToken ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex gap-2 items-center cursor-pointer p-2 transition"
              >
                <div className="flex flex-col gap-0 text-left">
                  <div className="font-bold text-sm text-gray-700">
                    {localStorage.getItem("fullname")}
                  </div>
                  <div className="text-xs text-gray-500">
                    @{localStorage.getItem("account_username")}
                  </div>
                </div>
                <img
                  src="/avatars/avatar-1.jpeg"
                  alt="Avatar"
                  className="w-10 h-10 rounded-full object-cover border"
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
              <div className="text-[#0C6A4E] font-bold flex gap-1">
                <Star /> Dành cho Nhà tuyển dụng
              </div>
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

        {/* Mobile Menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isOpen
              ? "max-h-96 opacity-100"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="pt-2 pb-4 px-4 space-y-2 bg-white border-t">
            <MobileNavLink href="/career/" onClick={() => setIsOpen(false)}>
              Việc làm
            </MobileNavLink>
            <MobileNavLink href="/career/cv" onClick={() => setIsOpen(false)}>
              Tạo CV
            </MobileNavLink>
            <MobileNavLink href="/career/about" onClick={() => setIsOpen(false)}>
              Về chúng tôi
            </MobileNavLink>
            <div className="border-t my-2"></div>
            <MobileNavLink href="/auth/signin" onClick={() => setIsOpen(false)}>
              Đăng nhập
            </MobileNavLink>
            <MobileNavLink href="/auth/signup" onClick={() => setIsOpen(false)}>
              Đăng ký
            </MobileNavLink>
            <MobileNavLink href="/" onClick={() => setIsOpen(false)}>
              Dành cho Nhà tuyển dụng
            </MobileNavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}
