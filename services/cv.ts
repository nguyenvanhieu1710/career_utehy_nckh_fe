import api from "@/cores/api";
import { GetSchema } from "@/types/base";

export const cvAPI = {
    create: (data: {id?: string, title?: string, subtitle?: string, primary_color?: string, sections?: string, name: string, template_id?: string}) => api.post(`/cv/create`, data),
    update: (data: {id?: string, title?: string, subtitle?: string, primary_color?: string, sections?: string, name: string, template_id?: string}) => api.post(`/cv/update`, data),
    getForUser: (filters: GetSchema) => api.post(`/cv/get-for-user`, filters),
};