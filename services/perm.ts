import api from "@/cores/api";
import { GetSchema } from "@/types/base";

export const permAPI = {
    createRole: (data: { name: string, description?: string, perms: string[] }) => api.post("/permission/create", data),
    getRoles: (filters: GetSchema) => api.post("/permission/get-roles", filters),
    getPerms: () => api.get("/permission/get-perms")

};
