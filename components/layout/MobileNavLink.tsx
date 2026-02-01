"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface MobileNavLinkProps {
  href: string;
  children: ReactNode;
  onClick: () => void;
}

export function MobileNavLink({ href, children, onClick }: MobileNavLinkProps) {
  const pathname = usePathname();

  const isActive = () => {
    if (href === "/career/jobs") {
      return pathname.startsWith("/career/jobs");
    }
    return pathname.startsWith(href);
  };

  return (
    <Link
      href={href}
      className={`block px-4 py-2 text-base font-medium rounded-md transition-colors ${
        isActive()
          ? "text-green-600 bg-green-50 border-l-4 border-green-600"
          : "text-gray-700 hover:bg-gray-100"
      }`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
