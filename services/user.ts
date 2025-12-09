import api from "@/cores/api";
import { GetSchema } from "@/types/base";
import { User, UserUpdate, UserCreate } from "@/types/user";

export const userAPI = {
  getUsers: (filters: GetSchema) =>
    api.post<{
      total: number;
      page: number;
      max_page: number;
      row: number;
      data: User[];
    }>("/auth/get-users", filters),

  getUserById: (userId: string) =>
    api.get<{ status: string; data: User }>(`/auth/get-user/${userId}`),

  updateUser: (userId: string, data: UserUpdate) =>
    api.put<{ status: string; data: User }>(
      `/auth/update-user/${userId}`,
      data
    ),

  deleteUser: (userId: string) =>
    api.delete<{ status: string; message: string }>(
      `/auth/delete-user/${userId}`
    ),

  createUser: (data: UserCreate) =>
    api.post<{ status: string; message: string; data: User }>(
      "/auth/create-user",
      data
    ),
};
