import api from "@/cores/api";
import { GetSchema } from "@/types/base";

const clearCvCache = () => {
    if (typeof window !== "undefined") {
        sessionStorage.removeItem("auto_recommendations_cache");
    }
};

export const cvAPI = {
    create: (data: {id?: string, title?: string, subtitle?: string, primary_color?: string, sections?: string, name: string, template_id?: string}) => {
        clearCvCache();
        return api.post(`/cv/create`, data);
    },
    update: (data: {id?: string, title?: string, subtitle?: string, primary_color?: string, sections?: string, name: string, template_id?: string}) => {
        clearCvCache();
        return api.post(`/cv/update`, data);
    },
    getForUser: (filters: GetSchema) => api.post(`/cv/get-for-user`, filters),
    delete: (id: string) => {
        clearCvCache();
        return api.delete(`/cv/${id}`);
    },
    getRecommendations: (id: string, top_k: number = 10) => api.get(`/cv/recommendations/${id}`, { params: { top_k } }),
    getRecommendationsFromFile: (id: string, top_k: number = 10) => api.get(`/cv/recommendations/file/${id}`, { params: { top_k } }),
    getAutoRecommendations: (top_k: number = 10) => api.get(`/cv/recommendations-auto`, { params: { top_k } }),
};