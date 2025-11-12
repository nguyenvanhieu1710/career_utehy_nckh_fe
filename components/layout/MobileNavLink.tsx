import Link from "next/link";
import { ReactNode } from "react";

interface MobileNavLinkProps {
  href: string;
  children: ReactNode;
  onClick: () => void;
}

export function MobileNavLink({ href, children, onClick }: MobileNavLinkProps) {
  return (
    <Link
      href={href}
      className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
      onClick={onClick}
    >
      {children}
    </Link>
  );
}