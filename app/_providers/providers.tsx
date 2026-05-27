"use client";

import { ThemeProvider } from "next-themes";
import { RolesProvider } from "@/contexts/RolesContext";
import { StatusProvider } from "@/contexts/StatusContext";
import { PermissionProvider } from "@/contexts/PermissionContext";
import { useTokenRefresh } from "@/hooks/useTokenRefresh";
import { useBehaviorTracker } from "@/hooks/useBehaviorTracker";
import { ReactNode, Suspense } from "react";

// Separate component for token refresh to avoid re-render issues
function TokenRefreshManager() {
  useTokenRefresh();
  return null; // This component doesn't render anything
}

function BehaviorTrackerManager() {
  useBehaviorTracker();
  return null;
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
          <PermissionProvider>
            <TokenRefreshManager />
            <Suspense fallback={null}>
              <BehaviorTrackerManager />
            </Suspense>
            {children}
          </PermissionProvider>
        </StatusProvider>
      </RolesProvider>
    </ThemeProvider>
  );
}
