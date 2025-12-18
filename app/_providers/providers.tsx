"use client";

import { ThemeProvider } from "next-themes";
import { RolesProvider } from "@/contexts/RolesContext";
import { StatusProvider } from "@/contexts/StatusContext";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <RolesProvider>
        <StatusProvider>{children}</StatusProvider>
      </RolesProvider>
    </ThemeProvider>
  );
}
