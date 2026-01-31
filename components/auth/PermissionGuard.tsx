"use client";

import { ReactNode } from "react";
import { usePermissions } from "@/contexts/PermissionContext";
import { useAuth } from "@/hooks/useAuth";
import { LoginRequired } from "./LoginRequired";
import { motion } from "framer-motion";
import { ShieldX, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";

interface PermissionGuardProps {
  children: ReactNode;
  requiredPermission?: string;
  requiredPermissions?: string[];
  requiredRole?: string;
  requireAll?: boolean; // true = need ALL permissions, false = need ANY permission
  fallback?: ReactNode;
  showLoginRequired?: boolean;
}

export function PermissionGuard({
  children,
  requiredPermission,
  requiredPermissions = [],
  requiredRole,
  requireAll = false,
  fallback,
  showLoginRequired = true,
}: PermissionGuardProps) {
  const { isAuthenticated } = useAuth();
  const { hasPermission, hasAnyPermission, hasRole, loading } =
    usePermissions();

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check authentication first
  if (!isAuthenticated) {
    if (showLoginRequired) {
      return (
        <LoginRequired
          title="Đăng nhập để truy cập"
          description="Bạn cần đăng nhập để truy cập tính năng này."
        />
      );
    }
    return fallback || null;
  }

  // Combine all required permissions
  const allRequiredPermissions = [
    ...(requiredPermission ? [requiredPermission] : []),
    ...requiredPermissions,
  ];

  // Check role permission
  if (requiredRole && !hasRole(requiredRole)) {
    return fallback || <AccessDenied />;
  }

  // Check permissions
  if (allRequiredPermissions.length > 0) {
    const hasAccess = requireAll
      ? allRequiredPermissions.every((perm) => hasPermission(perm))
      : hasAnyPermission(allRequiredPermissions);

    if (!hasAccess) {
      return fallback || <AccessDenied />;
    }
  }

  // All checks passed, render children
  return <>{children}</>;
}

// Default access denied component
function AccessDenied() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center min-h-[400px] p-8"
    >
      <Card className="p-8 text-center max-w-md">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-red-100 rounded-full">
            <ShieldX className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Không có quyền truy cập
        </h3>

        <p className="text-gray-600 mb-4">
          Bạn không có quyền truy cập vào tính năng này. Vui lòng liên hệ quản
          trị viên để được cấp quyền.
        </p>

        <div className="flex items-center justify-center text-sm text-gray-500">
          <Lock className="h-4 w-4 mr-1" />
          Quyền truy cập bị hạn chế
        </div>
      </Card>
    </motion.div>
  );
}

// Convenience components for common use cases
export function AdminGuard({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGuard
      requiredPermissions={["*"]}
      requireAll={false}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
}

export function UserManagementGuard({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGuard
      requiredPermissions={["user.list", "user.read", "user.*", "*"]}
      requireAll={false}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
}

export function JobManagementGuard({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGuard
      requiredPermissions={["job.list", "job.read", "job.*", "*"]}
      requireAll={false}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
}
