import api from "@/cores/api";
import { GetSchema } from "@/types/base";

export const cvAPI = {
    create: (data: {id?: string, title?: string, subtitle?: string, title_style?: string, subtitle_style?: string, has_avatar?: boolean, avatar_style?: string, primary_color?: string, sections?: string, name: string, template_id?: string}) => api.post(`/cv/create`, data),
    update: (data: {id?: string, title?: string, subtitle?: string, title_style?: string, subtitle_style?: string, has_avatar?: boolean, avatar_style?: string, primary_color?: string, sections?: string, name: string, template_id?: string}) => api.post(`/cv/update`, data),
    getForUser: (filters: GetSchema) => api.post(`/cv/get-for-user`, filters),
    delete: (id: string) => api.delete(`/cv/delete/${id}`),
};
