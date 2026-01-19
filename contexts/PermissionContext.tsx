"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { userAPI } from "@/services/user";
import { useAuth } from "@/hooks/useAuth";

interface PermissionContextType {
  permissions: string[];
  roles: string[];
  loading: boolean;
  error: string | null;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasRole: (roleName: string) => boolean;
  refetchPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(
  undefined,
);

interface PermissionProviderProps {
  children: ReactNode;
}

export function PermissionProvider({ children }: PermissionProviderProps) {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  const fetchUserPermissions = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setPermissions([]);
      setRoles([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get user roles and permissions
      const response = await userAPI.getUserRolesPermissions(user.id);
      const userData = response.data.data;

      // Extract permissions (both individual and from roles)
      const userPermissions = userData.permissions || [];
      setPermissions(userPermissions);

      // Extract role names
      const userRoles = userData.roles?.map((role) => role.name) || [];
      setRoles(userRoles);
    } catch (err: any) {
      console.error("Failed to fetch user permissions:", err);

      // Only set error if it's not a 401 (which means user is not authenticated)
      if (err.response?.status !== 401) {
        setError("Không thể tải quyền người dùng");
      }

      // Try to use cached data only if user is authenticated
      if (isAuthenticated) {
        const cachedPermissions = localStorage.getItem("user_permissions");
        const cachedRoles = localStorage.getItem("user_roles");

        if (cachedPermissions) {
          setPermissions(JSON.parse(cachedPermissions));
        }
        if (cachedRoles) {
          setRoles(JSON.parse(cachedRoles));
        }
      } else {
        // Clear cached data if user is not authenticated
        localStorage.removeItem("user_permissions");
        localStorage.removeItem("user_roles");
        setPermissions([]);
        setRoles([]);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  // Permission checking functions
  const hasPermission = (permission: string): boolean => {
    if (!isAuthenticated) return false;

    // Check for wildcard permissions
    if (permissions.includes("*")) return true;

    // Check exact permission
    if (permissions.includes(permission)) return true;

    // Check wildcard for module (e.g., "user.*" covers "user.create")
    const permissionModule = permission.split(".")[0];
    if (permissions.includes(`${permissionModule}.*`)) return true;

    return false;
  };

  const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.some((permission) => hasPermission(permission));
  };

  const hasRole = (roleName: string): boolean => {
    return roles.includes(roleName);
  };

  const refetchPermissions = async () => {
    await fetchUserPermissions();
  };

  // Fetch permissions when user changes
  useEffect(() => {
    fetchUserPermissions();
  }, [fetchUserPermissions]);

  // Cache permissions when they change
  useEffect(() => {
    if (permissions.length > 0) {
      localStorage.setItem("user_permissions", JSON.stringify(permissions));
    }
    if (roles.length > 0) {
      localStorage.setItem("user_roles", JSON.stringify(roles));
    }
  }, [permissions, roles]);

  const value: PermissionContextType = {
    permissions,
    roles,
    loading,
    error,
    hasPermission,
    hasAnyPermission,
    hasRole,
    refetchPermissions,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions(): PermissionContextType {
  const context = useContext(PermissionContext);

  if (context === undefined) {
    throw new Error("usePermissions must be used within a PermissionProvider");
  }

  return context;
}
