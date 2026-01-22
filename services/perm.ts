import api from "@/cores/api";
import { GetSchema } from "@/types/base";
import { Role, RoleCreate, RoleUpdate } from "@/types/permission";

export const permAPI = {
  getPerms: () =>
    api.get<{ status: string; data: string[] }>("/permission/get-perms"),

  getRoles: (filters: GetSchema) =>
    api.post<{
      total: number;
      page: number;
      max_page: number;
      row: number;
      data: Role[];
    }>("/permission/get-roles", filters),

  createRole: (data: RoleCreate) =>
    api.post<{ status: string; message: string; data: Role }>(
      "/permission/create",
      data,
    ),

  updateRole: (roleId: string, data: RoleUpdate) =>
    api.put<{ status: string; message: string; data: Role }>(
      `/permission/update/${roleId}`,
      data,
    ),

  deleteRole: (roleId: string) =>
    api.delete<{ status: string; message: string }>(
      `/permission/delete/${roleId}`,
    ),
};
