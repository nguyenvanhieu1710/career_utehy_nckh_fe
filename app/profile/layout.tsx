import type { ReactNode } from "react";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto flex flex-col md:flex-row gap-8 px-4">
        {children}
      </div>
    </div>
  );
}
