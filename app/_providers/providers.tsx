"use client";

import { ThemeProvider } from "next-themes";
import { RolesProvider } from "@/contexts/RolesContext";
import { StatusProvider } from "@/contexts/StatusContext";
import { useTokenRefresh } from "@/hooks/useTokenRefresh";
import { ReactNode } from "react";

// Separate component for token refresh to avoid re-render issues
function TokenRefreshManager() {
  useTokenRefresh();
  return null; // This component doesn't render anything
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <RolesProvider>
        <StatusProvider>
          <TokenRefreshManager />
          {children}
        </StatusProvider>
      </RolesProvider>
    </ThemeProvider>
  );
}
