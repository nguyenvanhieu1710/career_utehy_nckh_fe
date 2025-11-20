import api from "@/cores/api";
import { GetSchema } from "@/types/base";

export const userAPI = {
    getUsers: (filters: GetSchema) => api.post("/auth/get-users", filters)
};
